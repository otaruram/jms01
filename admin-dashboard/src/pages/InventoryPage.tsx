import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SlideOver } from '../components/ui/SlideOver';
import { Pagination } from '../components/ui/Pagination';
import { Plus, Search, Filter, ArrowDownToLine, Trash2 } from 'lucide-react';
import { AlertModal } from '../components/ui/AlertModal';
import { inventoryApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../components/ui/ToastContext';
import styles from './InventoryPage.module.css';

interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  status: string;
}

export function InventoryPage() {
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { isReadOnly } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Form states
  const [projectId, setProjectId] = useState('');
  const [productId, setProductId] = useState('');
  const [qty, setQty] = useState('');

  const { data: inventoryResponse, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await inventoryApi.getInventory();
      return res.data;
    }
  });

  const installMutation = useMutation({
    mutationFn: (data: { productId: string, projectId: string, qty: number }) => 
      inventoryApi.installProduct(data.productId, data.projectId, data.qty),
    onSuccess: () => {
      toast('Pemasangan berhasil dan stok terpotong!', 'success');
      setIsSlideOverOpen(false);
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (error) => {
      console.error('Gagal memotong stok', error);
      toast('Gagal memotong stok', 'error');
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => inventoryApi.deleteProduct(id),
    onSuccess: () => {
      toast('Barang berhasil dihapus permanen!', 'success');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (error: any) => {
      toast('Gagal menghapus barang: ' + (error.response?.data?.message || error.message), 'error');
      setDeleteTarget(null);
    }
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget(id);
  };

  const inventoryData = inventoryResponse?.data || [];
  
  // Filter based on search (Mock pagination for now as API might not support it yet, 
  // but we implement client side pagination to keep the UI functional)
  const filteredData = inventoryData.filter((item: Product) => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleInstallSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !productId || !qty) return toast('Mohon lengkapi data', 'error');
    
    installMutation.mutate({ productId, projectId, qty: parseInt(qty) });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Manajemen Stok & Instalasi</h1>
          <p className={styles.subtitle}>Kelola persediaan barang dan surat pemasangan</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="outline" className={styles.actionBtn}>
            <ArrowDownToLine size={16} /> Export
          </Button>
          {!isReadOnly && (
            <Button onClick={() => setIsSlideOverOpen(true)} className={styles.actionBtn}>
              <Plus size={16} /> Pemasangan Barang
            </Button>
          )}
        </div>
      </header>

      <Card title="Master Stok Inventaris">
        <div className={styles.tableControls}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <input 
              type="text" 
              placeholder="Cari nama barang atau ID..." 
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className={styles.filterBtn}>
            <Filter size={16} /> Filter
          </Button>
        </div>

        <div className={styles.tableWrapper + " overflow-x-auto"}>
          <table className={styles.table + " min-w-[700px]"}>
            <thead>
              <tr>
                <th>ID Barang</th>
                <th>Nama Barang</th>
                <th>Kategori</th>
                <th className="text-right pr-4">Stok</th>
                <th>Status</th>
                <th className={styles.textRight}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Memuat data inventory...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Tidak ada data ditemukan
                  </td>
                </tr>
              ) : (
                paginatedData.map((item: Product) => (
                  <tr key={item.id}>
                    <td className={styles.cellId}>{item.id}</td>
                    <td className={styles.cellName}>{item.name}</td>
                    <td>{item.category}</td>
                    <td className="text-right pr-4">{item.stock} {item.unit}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[item.status.toLowerCase()]}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className={styles.textRight}>
                      <div className="flex justify-end gap-2 items-center">
                        <Button variant="ghost" size="sm" onClick={() => setDetailProduct(item)}>Detail</Button>
                        {!isReadOnly && (
                          <button 
                            className="p-2 text-red-500 hover:bg-red-50 rounded"
                            onClick={(e) => handleDelete(item.id, e)}
                            title="Hapus Barang"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
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
        title="Surat Pemasangan Barang"
      >
        <form className={styles.form} onSubmit={handleInstallSubmit}>
          <div className={styles.formInfo}>
            Membuat surat ini akan otomatis memotong stok barang yang dipilih.
          </div>
          
          <Input 
            label="ID Proyek Terkait" 
            placeholder="Pilih ID Proyek..." 
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            required
          />
          <Input label="Lokasi Pemasangan" placeholder="Contoh: Gedung A Lt. 2" />
          
          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>Pilih Barang</h4>
            <div className={styles.itemRow}>
              <div className={styles.productInput}>
                <Input 
                  placeholder="ID Barang (cth: a1b2...)" 
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  required
                />
              </div>
              <div className={styles.qtyInput}>
                <Input 
                  type="number" 
                  placeholder="Qty" 
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <Input label="Catatan Tambahan" placeholder="Opsional" />

          <div className={styles.formActions}>
            <Button variant="outline" type="button" onClick={() => setIsSlideOverOpen(false)}>Batal</Button>
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => {
                setProjectId('PRJ-DEMO-01');
                setProductId('INV-DEMO-01');
                setQty('5');
              }}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              Auto Fill (Dev)
            </Button>
            <Button type="submit" disabled={installMutation.isPending}>
              {installMutation.isPending ? 'Memproses...' : 'Buat & Potong Stok'}
            </Button>
          </div>
        </form>
      </SlideOver>

      {/* Product Detail Popup */}
      <SlideOver 
        isOpen={!!detailProduct} 
        onClose={() => setDetailProduct(null)} 
        title="Detail Master Stok"
      >
        {detailProduct && (
          <div className="flex flex-col gap-6 p-2">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col gap-2">
              <span className="text-xs text-slate-500 font-bold uppercase">ID BARANG</span>
              <span className="font-mono text-slate-900">{detailProduct.id}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col gap-2">
              <span className="text-xs text-slate-500 font-bold uppercase">NAMA BARANG</span>
              <span className="text-slate-900">{detailProduct.name}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col gap-2">
              <span className="text-xs text-slate-500 font-bold uppercase">KATEGORI</span>
              <span className="text-slate-900">{detailProduct.category}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col gap-2">
              <span className="text-xs text-slate-500 font-bold uppercase">STOK TERSEDIA</span>
              <span className="text-2xl font-bold text-slate-900">{detailProduct.stock} <span className="text-base font-normal text-slate-500">{detailProduct.unit}</span></span>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col gap-2">
              <span className="text-xs text-slate-500 font-bold uppercase">STATUS</span>
              <div>
                <span className={`${styles.statusBadge} ${styles[detailProduct.status.toLowerCase()]}`}>
                  {detailProduct.status}
                </span>
              </div>
            </div>
            <Button className="w-full mt-4" onClick={() => setDetailProduct(null)}>Tutup</Button>
          </div>
        )}
      </SlideOver>

      {/* AlertModal for Delete Confirmation */}
      <AlertModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) deleteProductMutation.mutate(deleteTarget); }}
        title="Hapus Barang Inventaris"
        message="Apakah Anda yakin ingin menghapus barang ini beserta riwayat pemasangannya secara permanen?"
        isLoading={deleteProductMutation.isPending}
      />
    </div>
  );
}
