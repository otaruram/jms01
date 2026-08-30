import { prisma } from '../config/database';
import excel from 'exceljs';
import PDFDocument from 'pdfkit';

export class ReportsService {
  async getProfitLoss(months: number) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // 1. Get Income (Paid Orders)
    const orders = await prisma.order.findMany({
      where: { 
        status: 'PAID',
        createdAt: { gte: startDate }
      },
      select: { createdAt: true, total: true }
    });

    // 2. Get Capital (Project Capital)
    const capitals = await prisma.projectCapital.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true, amount: true }
    });

    // 3. Get Expenses
    const expenses = await prisma.expense.findMany({
      where: { date: { gte: startDate } },
      select: { date: true, amount: true }
    });

    // Group by Month-Year
    const grouped: Record<string, { income: number, expense: number }> = {};
    
    // Initialize months in range to ensure no empty gaps
    for (let i = 0; i < months; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      grouped[key] = { income: 0, expense: 0 };
    }

    orders.forEach(o => {
      const key = `${o.createdAt.getFullYear()}-${(o.createdAt.getMonth() + 1).toString().padStart(2, '0')}`;
      if (grouped[key]) grouped[key].income += o.total;
    });

    capitals.forEach(c => {
      const key = `${c.createdAt.getFullYear()}-${(c.createdAt.getMonth() + 1).toString().padStart(2, '0')}`;
      if (grouped[key]) grouped[key].income += c.amount;
    });

    expenses.forEach(e => {
      const key = `${e.date.getFullYear()}-${(e.date.getMonth() + 1).toString().padStart(2, '0')}`;
      if (grouped[key]) grouped[key].expense += e.amount;
    });

    return Object.entries(grouped)
      .sort((a, b) => b[0].localeCompare(a[0])) // Descending (latest first)
      .map(([period, data]) => {
        const [year, month] = period.split('-');
        const dateObj = new Date(parseInt(year), parseInt(month) - 1);
        const periodName = dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        
        return {
          period: periodName,
          income: data.income,
          expense: data.expense,
          netProfit: data.income - data.expense
        };
      });
  }

  async getFinance() {
    const documents = await prisma.documentMaster.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    // Formatting for UI
    return documents.map(doc => ({
      date: doc.createdAt,
      clientName: doc.clientId, // Should join with client, but using id for simplicity as per schema UI
      invoiceNo: `INV/${doc.createdAt.getFullYear()}/${doc.id.substring(0,4)}`,
      sjNo: `SJ/${doc.createdAt.getFullYear()}/${doc.id.substring(0,4)}`,
      kwtNo: `KWT/${doc.createdAt.getFullYear()}/${doc.id.substring(0,4)}`,
      amount: doc.amount
    }));
  }

  async getProjects() {
    const projects = await prisma.project.findMany({
      include: {
        capitals: true,
        client: true
      },
      orderBy: { name: 'asc' }
    });

    return projects.map(p => {
      const goodsCapital = p.capitals.filter(c => c.type === 'BARANG').reduce((sum, c) => sum + c.amount, 0);
      const accommCapital = p.capitals.filter(c => c.type === 'AKOMODASI').reduce((sum, c) => sum + c.amount, 0);
      
      return {
        projectId: p.id,
        clientName: p.client?.name || '-',
        goodsCapital,
        accommCapital,
        totalCapital: p.totalCapital
      };
    });
  }

  async getTax() {
    // Generate tax reports from paid orders
    const orders = await prisma.order.findMany({
      where: { status: 'PAID' },
      include: { client: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return orders.map(o => {
      const dpp = Math.round(o.total / 1.11);
      const ppn = o.total - dpp;
      
      return {
        period: o.createdAt.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
        nsfp: `010.000-${o.createdAt.getFullYear().toString().substring(2)}.${o.id.substring(0,8)}`,
        clientName: o.client?.name || '-',
        dpp,
        ppn
      };
    });
  }

  async exportExcel(type: string, months: number = 3): Promise<excel.Workbook> {
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Report');

    if (type === 'profit-loss') {
      worksheet.columns = [
        { header: 'Periode', key: 'period', width: 25 },
        { header: 'Total Pemasukan', key: 'income', width: 25 },
        { header: 'Total Pengeluaran', key: 'expense', width: 25 },
        { header: 'Laba/Rugi Bersih', key: 'netProfit', width: 25 }
      ];
      const data = await this.getProfitLoss(months);
      worksheet.addRows(data);
    } else if (type === 'finance') {
      worksheet.columns = [
        { header: 'Tanggal', key: 'date', width: 15 },
        { header: 'Klien', key: 'clientName', width: 30 },
        { header: 'Invoice', key: 'invoiceNo', width: 20 },
        { header: 'Nilai Transaksi', key: 'amount', width: 20 }
      ];
      const data = await this.getFinance();
      worksheet.addRows(data);
    } else if (type === 'projects') {
      worksheet.columns = [
        { header: 'ID Proyek', key: 'projectId', width: 20 },
        { header: 'Klien', key: 'clientName', width: 30 },
        { header: 'Total Modal', key: 'totalCapital', width: 20 }
      ];
      const data = await this.getProjects();
      worksheet.addRows(data);
    } else if (type === 'tax') {
      worksheet.columns = [
        { header: 'Periode', key: 'period', width: 20 },
        { header: 'Klien', key: 'clientName', width: 30 },
        { header: 'DPP', key: 'dpp', width: 20 },
        { header: 'PPN', key: 'ppn', width: 20 }
      ];
      const data = await this.getTax();
      worksheet.addRows(data);
    }

    return workbook;
  }

  async exportPdf(type: string, months: number = 3): Promise<PDFKit.PDFDocument> {
    const doc = new PDFDocument();
    
    doc.fontSize(16).text(`Laporan ${type.toUpperCase()}`, { align: 'center' });
    doc.moveDown();

    if (type === 'profit-loss') {
      const data = await this.getProfitLoss(months);
      data.forEach(row => {
        doc.fontSize(10).text(`${row.period} - Pemasukan: Rp ${row.income} - Pengeluaran: Rp ${row.expense} - Bersih: Rp ${row.netProfit}`);
      });
    } else if (type === 'finance') {
      const data = await this.getFinance();
      data.forEach(row => {
        doc.fontSize(10).text(`${row.date.toLocaleDateString()} - ${row.clientName} - Rp ${row.amount}`);
      });
    } else if (type === 'projects') {
      const data = await this.getProjects();
      data.forEach(row => {
        doc.fontSize(10).text(`${row.projectId} - ${row.clientName} - Rp ${row.totalCapital}`);
      });
    } else if (type === 'tax') {
      const data = await this.getTax();
      data.forEach(row => {
        doc.fontSize(10).text(`${row.period} - ${row.clientName} - DPP: Rp ${row.dpp} - PPN: Rp ${row.ppn}`);
      });
    }

    return doc;
  }
}
