import { Request, Response } from 'express';
import { ReportsService } from '../services/reports.service';

const reportsService = new ReportsService();

export class ReportsController {
  getProfitLoss = async (req: Request, res: Response) => {
    try {
      const months = req.query.months ? parseInt(req.query.months as string) : 3;
      const data = await reportsService.getProfitLoss(months);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  getFinance = async (req: Request, res: Response) => {
    try {
      const data = await reportsService.getFinance();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  getProjects = async (req: Request, res: Response) => {
    try {
      const data = await reportsService.getProjects();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  getTax = async (req: Request, res: Response) => {
    try {
      const data = await reportsService.getTax();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  exportReport = async (req: Request, res: Response) => {
    try {
      const type = req.query.type as string; // profit-loss | finance | projects | tax
      const format = req.query.format as string; // pdf | excel
      const months = req.query.months ? parseInt(req.query.months as string) : 3;

      if (!['profit-loss', 'finance', 'projects', 'tax'].includes(type)) {
        return res.status(400).json({ success: false, message: 'Invalid report type' });
      }

      if (format === 'excel') {
        const workbook = await reportsService.exportExcel(type, months);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=report-${type}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
      } else if (format === 'pdf') {
        const doc = await reportsService.exportPdf(type, months);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=report-${type}.pdf`);
        doc.pipe(res);
        doc.end();
      } else {
        res.status(400).json({ success: false, message: 'Invalid format. Use pdf or excel' });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
