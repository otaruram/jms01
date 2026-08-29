import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { Search, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const { isReadOnly } = useAuth();
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: () => {
      alert('Gagal mengupdate status pesanan');
    }
  });

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
        {!isReadOnly && <Button>+ Buat Pesanan Baru</Button>}
      </header>

      <Card>
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

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
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
                      <Badge variant={o.status.toLowerCase() as any}>
                        {o.status === 'PAID' ? 'Sudah Bayar' : o.status === 'PROCESS' ? 'Proses' : 'Belum Bayar'}
                      </Badge>
                    </td>
                    <td className={styles.textRight}>
                      {!isReadOnly && o.status !== 'PAID' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          disabled={updateStatusMutation.isPending}
                          onClick={() => {
                            const nextStatus = o.status === 'UNPAID' ? 'PROCESS' : 'PAID';
                            updateStatusMutation.mutate({ id: o.id, status: nextStatus });
                          }}
                        >
                          Tandai {o.status === 'UNPAID' ? 'Proses' : 'Lunas'}
                        </Button>
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
    </div>
  );
}
