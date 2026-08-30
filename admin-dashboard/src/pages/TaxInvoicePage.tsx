import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SlideOver } from '../components/ui/SlideOver';
import { Pagination } from '../components/ui/Pagination';
import { Plus, Search, FileText, Trash2 } from 'lucide-react';
import { AlertModal } from '../components/ui/AlertModal';
import { taxInvoiceApi, projectApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../components/ui/ToastContext';
import styles from './InventoryPage.module.css'; // Reusing some base styles

interface TaxInvoice {
  id: string;
  invoiceNo: string;
  client: { name: string };
  project: { name: string } | null;
  dppAmount: number;
  taxAmount: number;
  date: string;
  status: string;
}

export function TaxInvoicePage() {
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { isReadOnly } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Form states
  const [invoiceNo, setInvoiceNo] = useState('');
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [dppAmount, setDppAmount] = useState('');
  const [taxAmount, setTaxAmount] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  const { data: invoicesResponse, isLoading } = useQuery({
    queryKey: ['taxInvoices', currentPage],
    queryFn: async () => {
      const res = await taxInvoiceApi.getAll({ page: currentPage, limit: 10 });
      return res.data;
    }
  });

  const { data: projectsResponse } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await projectApi.getProjects();
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => taxInvoiceApi.create(data),
    onSuccess: () => {
      toast('Faktur Pajak berhasil dibuat!', 'success');
      setIsSlideOverOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['taxInvoices'] });
    },
    onError: (error: any) => {
      toast(error.response?.data?.message || 'Gagal membuat faktur pajak', 'error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => taxInvoiceApi.delete(id),
    onSuccess: () => {
      toast('Faktur Pajak berhasil dihapus!', 'success');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['taxInvoices'] });
    },
    onError: (error: any) => {
      toast(error.response?.data?.message || 'Gagal menghapus faktur pajak', 'error');
      setDeleteTarget(null);
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => taxInvoiceApi.updateStatus(id, status),
    onSuccess: () => {
      toast('Status berhasil diubah!', 'success');
      queryClient.invalidateQueries({ queryKey: ['taxInvoices'] });
    },
    onError: () => toast('Gagal mengubah status', 'error')
  });

  const resetForm = () => {
    setInvoiceNo('');
    setClientId('');
    setProjectId('');
    setDppAmount('');
    setTaxAmount('');
    setDate('');
    setDescription('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNo || !clientId || !dppAmount || !taxAmount) return toast('Mohon lengkapi field wajib', 'error');
    
    createMutation.mutate({
      invoiceNo,
      clientId,
      projectId: projectId || undefined,
      dppAmount: parseFloat(dppAmount),
      taxAmount: parseFloat(taxAmount),
      date: date ? new Date(date).toISOString() : undefined,
      description
    });
  };

  const handleDppChange = (val: string) => {
    setDppAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setTaxAmount((num * 0.11).toFixed(0));
    }
  };

  const invoices = invoicesResponse?.data || [];
  const filteredData = invoices.filter((item: TaxInvoice) => 
    item.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Faktur Pajak</h1>
          <p className={styles.subtitle}>Pusat rekapan dan pencatatan faktur pajak perusahaan</p>
        </div>
        <div className={styles.headerActions}>
          {!isReadOnly && (
            <Button onClick={() => setIsSlideOverOpen(true)} className={styles.actionBtn}>
              <Plus size={16} /> Buat Faktur
            </Button>
          )}
        </div>
      </header>

      <Card title="Daftar Faktur Pajak">
        <div className={styles.tableControls}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <input 
              type="text" 
              placeholder="Cari No. Faktur atau Klien..." 
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.tableWrapper + " overflow-x-auto"}>
          <table className={styles.table + " min-w-[900px]"}>
            <thead>
              <tr>
                <th>No. Faktur (NSFP)</th>
                <th>Klien</th>
                <th>Proyek</th>
                <th className="text-right">DPP</th>
                <th className="text-right">PPN</th>
                <th>Status</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">Memuat data...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">Tidak ada data ditemukan</td>
                </tr>
              ) : (
                filteredData.map((item: TaxInvoice) => (
                  <tr key={item.id}>
                    <td className="font-mono text-slate-700">{item.invoiceNo}</td>
                    <td className="font-medium">{item.client.name}</td>
                    <td>{item.project?.name || '-'}</td>
                    <td className="text-right">Rp {item.dppAmount.toLocaleString('id-ID')}</td>
                    <td className="text-right">Rp {item.taxAmount.toLocaleString('id-ID')}</td>
                    <td>
                      <select 
                        value={item.status} 
                        onChange={(e) => updateStatusMutation.mutate({ id: item.id, status: e.target.value })}
                        disabled={isReadOnly}
                        className={`text-xs px-2 py-1 rounded-full border outline-none font-medium
                          ${item.status === 'PAID' ? 'bg-green-100 text-green-700 border-green-200' : 
                            item.status === 'ISSUED' ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                            'bg-amber-100 text-amber-700 border-amber-200'}`}
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="ISSUED">ISSUED</option>
                        <option value="PAID">PAID</option>
                      </select>
                    </td>
                    <td className="text-right">
                      {!isReadOnly && (
                        <button 
                          className="p-2 text-red-500 hover:bg-red-50 rounded"
                          onClick={() => setDeleteTarget(item.id)}
                          title="Hapus Faktur"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          <Pagination 
            currentPage={currentPage}
            totalPages={invoicesResponse?.pagination?.totalPages || 1}
            onPageChange={setCurrentPage}
          />
        </div>
      </Card>

      <SlideOver 
        isOpen={isSlideOverOpen} 
        onClose={() => setIsSlideOverOpen(false)} 
        title="Buat Faktur Pajak Baru"
      >
        <form className="flex flex-col gap-4 p-2" onSubmit={handleSubmit}>
          <Input 
            label="Nomor Seri Faktur Pajak (NSFP)" 
            placeholder="000.xxx-xx.xxxxxxxx" 
            value={invoiceNo}
            onChange={(e) => setInvoiceNo(e.target.value)}
            required
          />
          
          <Input 
            label="ID Klien (Wajib)" 
            placeholder="Masukkan ID Klien..." 
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
          />

          <Input 
            label="ID Proyek (Opsional)" 
            placeholder="Masukkan ID Proyek..." 
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          />

          <Input 
            label="Tanggal Terbit" 
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4 mt-2">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2"><FileText size={16}/> Rincian Nilai</h4>
            <Input 
              label="Dasar Pengenaan Pajak (DPP)" 
              type="number"
              placeholder="0"
              value={dppAmount}
              onChange={(e) => handleDppChange(e.target.value)}
              required
            />
            <Input 
              label="Nominal PPN (Default 11%)" 
              type="number"
              placeholder="0"
              value={taxAmount}
              onChange={(e) => setTaxAmount(e.target.value)}
              required
            />
          </div>

          <Input 
            label="Keterangan (Opsional)" 
            placeholder="Catatan tambahan..." 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => {
                const firstProject = projectsResponse?.data?.[0];
                if (firstProject) {
                  // Get dynamic ID from the first project in database
                  setClientId(firstProject.clientId || firstProject.client?.id || '');
                  setProjectId(firstProject.id || '');
                } else {
                  toast('Proyek/Klien tidak ditemukan di database. Pastikan ada minimal 1 proyek.', 'error');
                }
                setInvoiceNo(`010.000-${new Date().getFullYear()}.${Math.floor(10000000 + Math.random() * 90000000)}`);
                setDppAmount('10000000');
                setTaxAmount('1100000');
                setDate(new Date().toISOString().split('T')[0]);
                setDescription('Penagihan Termin 1 (Auto Fill)');
              }}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              Auto Fill (Dev)
            </Button>
            <Button variant="outline" type="button" onClick={() => setIsSlideOverOpen(false)}>Batal</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan Faktur'}
            </Button>
          </div>
        </form>
      </SlideOver>

      <AlertModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        title="Hapus Faktur Pajak"
        message="Apakah Anda yakin ingin menghapus catatan faktur pajak ini secara permanen?"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
