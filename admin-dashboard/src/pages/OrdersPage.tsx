import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { Search, Filter, Trash2 } from 'lucide-react';
import { AlertModal } from '../components/ui/AlertModal';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SlideOver } from '../components/ui/SlideOver';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/ToastContext';
import styles from './OrdersPage.module.css';

interface Order {
  id: string;
  client: { name: string };
  createdAt: string;
  total: number;
  status: string;
}

export function OrdersPage() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({ clientId: '', total: '' });
  const { isReadOnly } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const createOrderMutation = useMutation({
    mutationFn: (data: any) => orderApi.createOrder(data.clientId, parseFloat(data.total)),
    onSuccess: () => {
      toast('Pesanan berhasil dibuat!', 'success');
      setIsSlideOverOpen(false);
      setNewOrder({ clientId: '', total: '' });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: any) => {
      toast('Gagal membuat pesanan: ' + (error.response?.data?.message || error.message), 'error');
    }
  });

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.clientId || !newOrder.total) return;
    createOrderMutation.mutate(newOrder);
  };

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await orderApi.getOrders();
      return res.data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => 
      orderApi.updateStatus(id, status),
    onSuccess: () => {
      toast('Status pesanan berhasil diubah!', 'success');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: any) => {
      toast('Gagal mengubah status: ' + (error.response?.data?.message || error.message), 'error');
    }
  });

  const deleteOrderMutation = useMutation({
    mutationFn: (id: string) => orderApi.deleteOrder(id),
    onSuccess: () => {
      toast('Pesanan berhasil dihapus permanen!', 'success');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: any) => {
      toast('Gagal menghapus pesanan: ' + (error.response?.data?.message || error.message), 'error');
    }
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget(id);
  };

  const orders = response?.data || [];
  
  const filteredOrders = orders.filter((o: Order) => 
    o.client?.name?.toLowerCase().includes(search.toLowerCase()) || 
    o.id.toLowerCase().includes(search.toLowerCase())
  );
  
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Tracking Status Pesanan</h1>
          <p className={styles.subtitle}>Pantau status pembayaran dan progres pesanan klien</p>
        </div>
        {!isReadOnly && (
          <Button onClick={() => setIsSlideOverOpen(true)}>+ Buat Pesanan Baru</Button>
        )}
      </header>

      <Card title="Daftar Pesanan Berjalan">
        <div className={styles.tableControls}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <input 
              type="text" 
              placeholder="Cari ID Pesanan atau Klien..." 
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className={styles.filterBtn}>
            <Filter size={16} /> Filter Status
          </Button>
        </div>

        <div className={styles.tableWrapper + " overflow-x-auto"}>
          <table className={styles.table + " min-w-[700px]"}>
            <thead>
              <tr>
                <th>ID Pesanan</th>
                <th>Klien</th>
                <th>Tanggal</th>
                <th className="text-right pr-4">Total Tagihan</th>
                <th>Status</th>
                <th className={styles.textRight}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Memuat data pesanan...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-red-500">
                    Gagal memuat data pesanan.
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Tidak ada pesanan ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((o: Order) => (
                  <tr key={o.id}>
                    <td className={styles.cellId}>{o.id}</td>
                    <td className={styles.cellName}>{o.client?.name}</td>
                    <td>{new Date(o.createdAt).toLocaleDateString('id-ID')}</td>
                    <td className="text-right pr-4">Rp {o.total.toLocaleString('id-ID')}</td>
                    <td>
                      {!isReadOnly ? (
                        <select 
                          className="border border-slate-200 rounded p-1 text-sm bg-white"
                          value={o.status}
                          onChange={(e) => updateStatusMutation.mutate({ id: o.id, status: e.target.value })}
                          disabled={updateStatusMutation.isPending}
                        >
                          <option value="UNPAID">Belum Bayar</option>
                          <option value="PROCESS">Proses</option>
                          <option value="PAID">Lunas</option>
                        </select>
                      ) : (
                        <Badge variant={o.status.toLowerCase() as any}>
                          {o.status === 'PAID' ? 'Lunas' : o.status === 'PROCESS' ? 'Proses' : 'Belum Bayar'}
                        </Badge>
                      )}
                    </td>
                    <td className={styles.textRight}>
                      {!isReadOnly && (
                        <button 
                          className="p-2 text-red-500 hover:bg-red-50 rounded"
                          onClick={(e) => handleDelete(o.id, e)}
                          title="Hapus Pesanan"
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

      <SlideOver 
        isOpen={isSlideOverOpen} 
        onClose={() => setIsSlideOverOpen(false)} 
        title="Buat Pesanan Baru"
      >
        <form onSubmit={handleCreateOrder} className="flex flex-col gap-4">
          <Input 
            label="ID Klien" 
            placeholder="Masukkan ID Klien"
            value={newOrder.clientId}
            onChange={(e) => setNewOrder({...newOrder, clientId: e.target.value})}
            required
          />
          <Input 
            label="Total Tagihan (Rp)" 
            type="number"
            placeholder="Masukkan Angka Tagihan"
            value={newOrder.total}
            onChange={(e) => setNewOrder({...newOrder, total: e.target.value})}
            required
          />
          
          <div className="flex justify-end gap-2 mt-8">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => setNewOrder({ clientId: 'CLI-DEMO-01', total: '15000000' })}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              Auto Fill (Dev)
            </Button>
            <Button variant="outline" type="button" onClick={() => setIsSlideOverOpen(false)}>Batal</Button>
            <Button type="submit" disabled={createOrderMutation.isPending}>
              {createOrderMutation.isPending ? 'Menyimpan...' : 'Simpan Pesanan'}
            </Button>
          </div>
        </form>
      </SlideOver>

      <AlertModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) deleteOrderMutation.mutate(deleteTarget); }}
        title="Hapus Pesanan"
        message="Pesanan ini akan dihapus secara permanen dan tidak dapat dikembalikan. Lanjutkan?"
        isLoading={deleteOrderMutation.isPending}
      />
    </div>
  );
}
