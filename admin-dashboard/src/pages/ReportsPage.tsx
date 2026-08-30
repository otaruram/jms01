import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Download, FileText, Briefcase, FileSignature } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../lib/api';
import styles from './ReportsPage.module.css';

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'profit-loss' | 'finance' | 'projects' | 'tax'>('profit-loss');
  const [monthsFilter, setMonthsFilter] = useState<number>(3);

  const { data: profitLossRes, isLoading: isLoadingProfitLoss } = useQuery({
    queryKey: ['reports', 'profit-loss', monthsFilter],
    queryFn: async () => {
      const res = await reportsApi.getProfitLoss(monthsFilter);
      return res.data;
    }
  });

  const { data: financeRes, isLoading: isLoadingFinance } = useQuery({
    queryKey: ['reports', 'finance'],
    queryFn: async () => {
      const res = await reportsApi.getFinance();
      return res.data;
    }
  });

  const { data: projectsRes, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['reports', 'projects'],
    queryFn: async () => {
      const res = await reportsApi.getProjects();
      return res.data;
    }
  });

  const { data: taxRes, isLoading: isLoadingTax } = useQuery({
    queryKey: ['reports', 'tax'],
    queryFn: async () => {
      const res = await reportsApi.getTax();
      return res.data;
    }
  });

  const profitLossData = profitLossRes?.data || [];
  const financeData = financeRes?.data || [];
  const projectsData = projectsRes?.data || [];
  const taxData = taxRes?.data || [];

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      const response = await reportsApi.exportFile(activeTab, format, activeTab === 'profit-loss' ? monthsFilter : undefined);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan_${activeTab}_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Export failed', error);
      alert('Gagal mengunduh laporan');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Pusat Rekapan Laporan</h1>
          <p className={styles.subtitle}>Eksport dan pantau laporan operasional secara terpusat</p>
        </div>
      </header>

      <div className={styles.tabsGrid}>
        <Card 
          className={`${styles.tabCard} ${activeTab === 'profit-loss' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('profit-loss')}
        >
          <span className="text-xl">💰</span>
          <span className={styles.tabText}>Laba Rugi (Cash Flow)</span>
        </Card>
        <Card 
          className={`${styles.tabCard} ${activeTab === 'finance' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('finance')}
        >
          <FileText size={20} className={activeTab === 'finance' ? styles.iconActive : styles.icon} />
          <span className={styles.tabText}>Rekapan Dokumen</span>
        </Card>
        <Card 
          className={`${styles.tabCard} ${activeTab === 'projects' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          <Briefcase size={20} className={activeTab === 'projects' ? styles.iconActive : styles.icon} />
          <span className={styles.tabText}>Rekapan Modal Proyek</span>
        </Card>
        <Card 
          className={`${styles.tabCard} ${activeTab === 'tax' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('tax')}
        >
          <FileSignature size={20} className={activeTab === 'tax' ? styles.iconActive : styles.icon} />
          <span className={styles.tabText}>Faktur Pajak</span>
        </Card>
      </div>

      <Card>
        <div className={styles.reportHeader}>
          <div className="flex flex-col gap-2">
            <h2 className={styles.reportTitle}>
              {activeTab === 'profit-loss' && "Laporan Laba Rugi (Cash Flow)"}
              {activeTab === 'finance' && "Rekapan Dokumen Administrasi"}
              {activeTab === 'projects' && "Rekapan Modal Proyek"}
              {activeTab === 'tax' && "Rekapan Faktur Pajak"}
            </h2>
            
            {activeTab === 'profit-loss' && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm font-medium text-slate-600">Periode:</span>
                <select 
                  value={monthsFilter}
                  onChange={(e) => setMonthsFilter(parseInt(e.target.value))}
                  className="border border-slate-200 rounded-md px-3 py-1.5 text-sm bg-white outline-none focus:border-blue-500"
                >
                  <option value={3}>3 Bulan Terakhir</option>
                  <option value={6}>6 Bulan Terakhir</option>
                  <option value={9}>9 Bulan Terakhir</option>
                  <option value={12}>1 Tahun Terakhir</option>
                </select>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('excel')}>
              <Download size={16} style={{marginRight: 8}}/> Export Excel
            </Button>
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <Download size={16} style={{marginRight: 8}}/> Export PDF
            </Button>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          {activeTab === 'profit-loss' && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Bulan & Tahun</th>
                  <th className="text-right">Total Pemasukan</th>
                  <th className="text-right">Total Pengeluaran</th>
                  <th className="text-right pr-4">Laba/Rugi Bersih</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingProfitLoss ? (
                  <tr><td colSpan={4} className="text-center py-4">Memuat data...</td></tr>
                ) : profitLossData.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-4">Tidak ada data</td></tr>
                ) : (
                  profitLossData.map((row: any, idx: number) => (
                    <tr key={idx}>
                      <td className="font-medium text-slate-700">{row.period}</td>
                      <td className="text-right text-green-600 font-semibold">Rp {row.income?.toLocaleString('id-ID')}</td>
                      <td className="text-right text-red-600 font-semibold">Rp {row.expense?.toLocaleString('id-ID')}</td>
                      <td className="text-right pr-4 font-bold">
                        <span className={row.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}>
                          Rp {row.netProfit?.toLocaleString('id-ID')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'finance' && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Klien</th>
                  <th>Nomor Invoice</th>
                  <th>Nomor Surat Jalan</th>
                  <th>Nomor Kwitansi</th>
                  <th className="text-right pr-4">Nilai Transaksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingFinance ? (
                  <tr><td colSpan={6} className="text-center py-4">Memuat data...</td></tr>
                ) : financeData.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-4">Tidak ada data</td></tr>
                ) : (
                  financeData.map((row: any, idx: number) => (
                    <tr key={idx}>
                      <td>{new Date(row.date).toLocaleDateString('id-ID')}</td>
                      <td>{row.clientName}</td>
                      <td>{row.invoiceNo}</td>
                      <td>{row.sjNo}</td>
                      <td>{row.kwtNo}</td>
                      <td className="text-right pr-4">Rp {row.amount?.toLocaleString('id-ID')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'projects' && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID Proyek</th>
                  <th>Klien</th>
                  <th className="text-right pr-4">Modal Barang</th>
                  <th className="text-right pr-4">Modal Akomodasi</th>
                  <th className="text-right pr-4">Total Modal</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingProjects ? (
                  <tr><td colSpan={5} className="text-center py-4">Memuat data...</td></tr>
                ) : projectsData.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4">Tidak ada data</td></tr>
                ) : (
                  projectsData.map((row: any, idx: number) => (
                    <tr key={idx}>
                      <td>{row.projectId}</td>
                      <td>{row.clientName}</td>
                      <td className="text-right pr-4">Rp {row.goodsCapital?.toLocaleString('id-ID')}</td>
                      <td className="text-right pr-4">Rp {row.accommCapital?.toLocaleString('id-ID')}</td>
                      <td className="text-right pr-4"><strong>Rp {row.totalCapital?.toLocaleString('id-ID')}</strong></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'tax' && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Periode</th>
                  <th>Nomor Seri Faktur Pajak (NSFP)</th>
                  <th>Nama Pembeli BKP/JKP</th>
                  <th className="text-right pr-4">DPP</th>
                  <th className="text-right pr-4">PPN</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingTax ? (
                  <tr><td colSpan={5} className="text-center py-4">Memuat data...</td></tr>
                ) : taxData.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4">Tidak ada data</td></tr>
                ) : (
                  taxData.map((row: any, idx: number) => (
                    <tr key={idx}>
                      <td>{row.period}</td>
                      <td>{row.nsfp}</td>
                      <td>{row.clientName}</td>
                      <td className="text-right pr-4">Rp {row.dpp?.toLocaleString('id-ID')}</td>
                      <td className="text-right pr-4">Rp {row.ppn?.toLocaleString('id-ID')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
