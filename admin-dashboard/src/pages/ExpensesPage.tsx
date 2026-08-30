import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Pagination } from '../components/ui/Pagination';
import { AlertModal } from '../components/ui/AlertModal';
import { Search, Trash2, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { expenseApi } from '../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SlideOver } from '../components/ui/SlideOver';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/ToastContext';
import styles from './ExpensesPage.module.css';

interface Expense {
  id: string;
  projectId?: string;
  amount: number;
  date: string;
  description: string;
  category?: string;
  createdAt: string;
}

export function ExpensesPage() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState({
    projectId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: '',
  });
  const { isReadOnly } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const res = await expenseApi.getExpenses();
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: { projectId?: string; amount: number; date: string; description: string; category?: string }) =>
      expenseApi.createExpense(data),
    onSuccess: () => {
      toast('Catatan pengeluaran berhasil ditambahkan!', 'success');
      setIsSlideOverOpen(false);
      setNewExpense({ projectId: '', amount: '', date: new Date().toISOString().split('T')[0], description: '', category: '' });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
    onError: (error: any) => {
      toast('Gagal menambahkan: ' + (error.response?.data?.message || error.message), 'error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => expenseApi.deleteExpense(id),
    onSuccess: () => {
      toast('Catatan pengeluaran berhasil dihapus!', 'success');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
    onError: (error: any) => {
      toast('Gagal menghapus: ' + (error.response?.data?.message || error.message), 'error');
      setDeleteTarget(null);
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.description) return;
    createMutation.mutate({
      projectId: newExpense.projectId || undefined,
      amount: parseFloat(newExpense.amount),
      date: newExpense.date,
      description: newExpense.description,
      category: newExpense.category || undefined,
    });
  };

  const expenses: Expense[] = response?.data || [];

  const filtered = expenses.filter((exp) =>
    exp.description.toLowerCase().includes(search.toLowerCase()) ||
    (exp.category || '').toLowerCase().includes(search.toLowerCase()) ||
    (exp.projectId || '').toLowerCase().includes(search.toLowerCase())
  );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const thisMonthExpenses = expenses
    .filter(exp => {
      const d = new Date(exp.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Catatan Pengeluaran</h1>
          <p className={styles.subtitle}>Kelola dan pantau semua pengeluaran operasional</p>
        </div>
        {!isReadOnly && (
          <Button onClick={() => setIsSlideOverOpen(true)}>
            <Wallet size={16} style={{marginRight: 8}} /> Tambah Pengeluaran
          </Button>
        )}
      </header>

      {/* Stats cards */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <span className={styles.statLabel}>Total Pengeluaran</span>
          <span className={styles.statValue}>Rp {totalExpenses.toLocaleString('id-ID')}</span>
        </Card>
        <Card className={styles.statCard}>
          <span className={styles.statLabel}>Bulan Ini</span>
          <span className={styles.statValue}>Rp {thisMonthExpenses.toLocaleString('id-ID')}</span>
        </Card>
        <Card className={styles.statCard}>
          <span className={styles.statLabel}>Total Transaksi</span>
          <span className={styles.statValue}>{expenses.length}</span>
        </Card>
      </div>

      <Card title="Riwayat Pengeluaran">
        <div className={styles.tableControls}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <input
              type="text"
              placeholder="Cari deskripsi, kategori, atau proyek..."
              className={styles.searchInput}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Deskripsi</th>
                <th>Kategori</th>
                <th>Proyek</th>
                <th className={styles.textRight}>Jumlah</th>
                <th className={styles.textRight}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Memuat data pengeluaran...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-red-500">
                    Gagal memuat data pengeluaran.
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    {search ? 'Tidak ada hasil yang cocok.' : 'Belum ada catatan pengeluaran.'}
                  </td>
                </tr>
              ) : (
                paginated.map((exp) => (
                  <tr key={exp.id}>
                    <td>{new Date(exp.date).toLocaleDateString('id-ID')}</td>
                    <td className={styles.cellDesc}>{exp.description}</td>
                    <td>
                      {exp.category ? (
                        <span className={styles.badge} style={{ background: '#EFF6FF', color: '#2563EB' }}>
                          {exp.category}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className={styles.cellId}>{exp.projectId || '—'}</td>
                    <td className={styles.textRight} style={{ fontWeight: 600 }}>
                      Rp {exp.amount.toLocaleString('id-ID')}
                    </td>
                    <td className={styles.textRight}>
                      {!isReadOnly && (
                        <button
                          className="p-2 text-red-500 hover:bg-red-50 rounded"
                          onClick={() => setDeleteTarget(exp.id)}
                          title="Hapus Pengeluaran"
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
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </Card>

      {/* SlideOver Form */}
      <SlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        title="Tambah Catatan Pengeluaran"
      >
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input
            label="Deskripsi Pengeluaran"
            placeholder="cth: Beli kabel UTP 10 roll"
            value={newExpense.description}
            onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
            required
          />
          <Input
            label="Jumlah (Rp)"
            type="number"
            placeholder="cth: 500000"
            value={newExpense.amount}
            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
            required
          />
          <Input
            label="Tanggal"
            type="date"
            value={newExpense.date}
            onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
            required
          />
          <Input
            label="Kategori (Opsional)"
            placeholder="cth: Material, Transport, Akomodasi"
            value={newExpense.category}
            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
          />
          <Input
            label="ID Proyek Terkait (Opsional)"
            placeholder="cth: uuid-proyek-123"
            value={newExpense.projectId}
            onChange={(e) => setNewExpense({ ...newExpense, projectId: e.target.value })}
          />

          <div className="flex justify-end gap-2 mt-8">
            <Button
              variant="outline"
              type="button"
              onClick={() => setNewExpense({
                projectId: '',
                amount: '500000',
                date: new Date().toISOString().split('T')[0],
                description: 'Beli kabel UTP 10 roll',
                category: 'Material',
              })}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              Auto Fill (Dev)
            </Button>
            <Button variant="outline" type="button" onClick={() => setIsSlideOverOpen(false)}>Batal</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan Pengeluaran'}
            </Button>
          </div>
        </form>
      </SlideOver>

      {/* AlertModal for Delete Confirmation */}
      <AlertModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget); }}
        title="Hapus Catatan Pengeluaran"
        message="Catatan pengeluaran ini akan dihapus secara permanen dan tidak dapat dikembalikan. Lanjutkan?"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
