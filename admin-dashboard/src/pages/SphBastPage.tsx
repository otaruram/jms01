import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Pagination } from '../components/ui/Pagination';
import { AlertModal } from '../components/ui/AlertModal';
import { Download, FileCheck, FileSignature, Printer, Trash2, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sphBastApi } from '../lib/api';
import { useToast } from '../components/ui/ToastContext';
import styles from './SphBastPage.module.css';

export function SphBastPage() {
  const [activeForm, setActiveForm] = useState<'sph' | 'bast'>('sph');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { isReadOnly } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'sph' | 'bast' } | null>(null);

  // SPH form state (matches backend: clientId, projectId, subject, totalAmount, items)
  const [sphData, setSphData] = useState({
    clientId: '', projectId: '', subject: '', totalAmount: '', items: ''
  });

  // BAST form state (matches backend: clientId, projectId, description)
  const [bastData, setBastData] = useState({
    clientId: '', projectId: '', description: ''
  });

  const sphMutation = useMutation({
    mutationFn: (data: { clientId: string; projectId: string; subject: string; totalAmount: number; items: string }) =>
      sphBastApi.createSph(data),
    onSuccess: () => {
      toast('SPH berhasil digenerate dan disimpan!', 'success');
      setSphData({ clientId: '', projectId: '', subject: '', totalAmount: '', items: '' });
      queryClient.invalidateQueries({ queryKey: ['sph'] });
    },
    onError: (error: any) => {
      toast('Gagal menggenerate SPH: ' + (error.response?.data?.message || error.message), 'error');
    }
  });

  const bastMutation = useMutation({
    mutationFn: (data: { clientId: string; projectId: string; description: string }) =>
      sphBastApi.createBast(data),
    onSuccess: () => {
      toast('BAST berhasil digenerate dan disimpan!', 'success');
      setBastData({ clientId: '', projectId: '', description: '' });
      queryClient.invalidateQueries({ queryKey: ['bast'] });
    },
    onError: (error: any) => {
      toast('Gagal menggenerate BAST: ' + (error.response?.data?.message || error.message), 'error');
    }
  });

  const { data: sphHistory, isLoading: isLoadingSph } = useQuery({
    queryKey: ['sph'],
    queryFn: () => sphBastApi.getSph().then(res => res.data.data)
  });

  const { data: bastHistory, isLoading: isLoadingBast } = useQuery({
    queryKey: ['bast'],
    queryFn: () => sphBastApi.getBast().then(res => res.data.data)
  });

  const deleteSphMutation = useMutation({
    mutationFn: (id: string) => sphBastApi.deleteSph(id),
    onSuccess: () => {
      toast('SPH berhasil dihapus permanen!', 'success');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['sph'] });
    },
    onError: (error: any) => {
      toast('Gagal menghapus SPH: ' + (error.response?.data?.message || error.message), 'error');
      setDeleteTarget(null);
    }
  });

  const deleteBastMutation = useMutation({
    mutationFn: (id: string) => sphBastApi.deleteBast(id),
    onSuccess: () => {
      toast('BAST berhasil dihapus permanen!', 'success');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['bast'] });
    },
    onError: (error: any) => {
      toast('Gagal menghapus BAST: ' + (error.response?.data?.message || error.message), 'error');
      setDeleteTarget(null);
    }
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    
    const form = e.currentTarget as HTMLFormElement;
    if (!form.checkValidity()) return;
    
    if (activeForm === 'sph') {
      sphMutation.mutate({
        clientId: sphData.clientId,
        projectId: sphData.projectId,
        subject: sphData.subject,
        totalAmount: parseFloat(sphData.totalAmount),
        items: sphData.items
      });
    } else {
      bastMutation.mutate({
        clientId: bastData.clientId,
        projectId: bastData.projectId,
        description: bastData.description
      });
    }
  };

  const isPending = activeForm === 'sph' ? sphMutation.isPending : bastMutation.isPending;

  // Filter + paginate history
  const currentHistory = activeForm === 'sph' ? (sphHistory || []) : (bastHistory || []);
  const filteredHistory = currentHistory.filter((doc: any) =>
    doc.clientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.projectId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.subject || doc.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredHistory.length / pageSize) || 1;
  const paginatedHistory = filteredHistory.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const isLoadingHistory = activeForm === 'sph' ? isLoadingSph : isLoadingBast;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>SPH & BAST</h1>
          <p className={styles.subtitle}>Surat Penawaran Harga dan Berita Acara Serah Terima</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="outline" className={styles.actionBtn}>
            <Download size={16} /> Export
          </Button>
          {!isReadOnly && (
            <Button className={styles.actionBtn}>
              + Buat {activeForm.toUpperCase()}
            </Button>
          )}
        </div>
      </header>

      <div className={styles.actionGrid}>
        <Card 
          className={`${styles.actionCard} ${activeForm === 'sph' ? styles.activeCard : ''}`}
          onClick={() => { setActiveForm('sph'); setCurrentPage(1); setSearchTerm(''); }}
        >
          <div className={styles.actionIconWrapper}>
            <FileCheck size={24} className={activeForm === 'sph' ? styles.iconActive : ''} />
          </div>
          <div>
            <h3 className={styles.actionTitle}>Buat SPH Baru</h3>
            <p className={styles.actionDesc}>Surat Penawaran Harga untuk klien prospek</p>
          </div>
        </Card>

        <Card 
          className={`${styles.actionCard} ${activeForm === 'bast' ? styles.activeCard : ''}`}
          onClick={() => { setActiveForm('bast'); setCurrentPage(1); setSearchTerm(''); }}
        >
          <div className={styles.actionIconWrapper}>
            <FileSignature size={24} className={activeForm === 'bast' ? styles.iconActive : ''} />
          </div>
          <div>
            <h3 className={styles.actionTitle}>Buat BAST Baru</h3>
            <p className={styles.actionDesc}>Berita Acara Serah Terima setelah proyek selesai</p>
          </div>
        </Card>
      </div>

      <Card title={activeForm === 'sph' ? "Formulir Surat Penawaran Harga (SPH)" : "Formulir Berita Acara Serah Terima (BAST)"}>
        <form className={`${styles.form} ${hasSubmitted ? 'was-validated' : ''}`} onSubmit={handleGenerate} noValidate>
          {activeForm === 'sph' ? (
            <>
              <div className={styles.formGrid}>
                <Input 
                  label="ID Klien" 
                  placeholder="Masukkan ID Klien" 
                  value={sphData.clientId}
                  onChange={(e) => setSphData({...sphData, clientId: e.target.value})}
                  required 
                />
                <Input 
                  label="ID Proyek" 
                  placeholder="Masukkan ID Proyek" 
                  value={sphData.projectId}
                  onChange={(e) => setSphData({...sphData, projectId: e.target.value})}
                  required 
                />
                <Input 
                  label="Subjek Penawaran" 
                  placeholder="cth: Instalasi Jaringan LAN" 
                  value={sphData.subject}
                  onChange={(e) => setSphData({...sphData, subject: e.target.value})}
                  required 
                />
                <Input 
                  label="Total Penawaran (Rp)" 
                  type="number"
                  placeholder="cth: 15000000" 
                  value={sphData.totalAmount}
                  onChange={(e) => setSphData({...sphData, totalAmount: e.target.value})}
                  required 
                />
              </div>
              <div style={{ width: '100%', marginTop: '1rem' }}>
                <label className={styles.label}>Detail Penawaran / Rincian Item</label>
                <textarea 
                  className={styles.textarea}
                  rows={5} 
                  placeholder="Masukkan rincian item penawaran..." 
                  value={sphData.items}
                  onChange={(e) => setSphData({...sphData, items: e.target.value})}
                  required 
                  style={{ width: '100%', marginTop: '0.5rem' }}
                />
              </div>
            </>
          ) : (
            <>
              <div className={styles.formGrid}>
                <Input 
                  label="ID Klien" 
                  placeholder="Masukkan ID Klien" 
                  value={bastData.clientId}
                  onChange={(e) => setBastData({...bastData, clientId: e.target.value})}
                  required 
                />
                <Input 
                  label="ID Proyek" 
                  placeholder="Masukkan ID Proyek" 
                  value={bastData.projectId}
                  onChange={(e) => setBastData({...bastData, projectId: e.target.value})}
                  required 
                />
              </div>
              <div style={{ width: '100%', marginTop: '1rem' }}>
                <label className={styles.label}>Rincian Pekerjaan yang Diserahkan</label>
                <textarea 
                  className={styles.textarea}
                  rows={5} 
                  placeholder="Masukkan rincian pekerjaan..." 
                  value={bastData.description}
                  onChange={(e) => setBastData({...bastData, description: e.target.value})}
                  required 
                  style={{ width: '100%', marginTop: '0.5rem' }}
                />
              </div>
            </>
          )}

          <div className={`${styles.formActions}`} style={{ marginTop: '2rem' }}>
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => {
                if (activeForm === 'sph') {
                  setSphData({
                    clientId: 'CLI-DEMO-01',
                    projectId: 'PRJ-DEMO-01',
                    subject: 'Instalasi Jaringan LAN Gedung A',
                    totalAmount: '15000000',
                    items: '1. Kabel UTP Cat 6 (15 Roll)\n2. Router Mikrotik RB750 (2 Unit)\n3. Jasa Instalasi dan Testing'
                  });
                } else {
                  setBastData({
                    clientId: 'CLI-DEMO-01',
                    projectId: 'PRJ-DEMO-01',
                    description: '1. Instalasi Jaringan LAN (15 Titik) - SELESAI\n2. Setup Mikrotik Router - SELESAI\n3. Testing dan Commissioning - SELESAI'
                  });
                }
              }}
            >
              Auto Fill (Dev)
            </Button>
            <Button variant="outline" type="button">Simpan Draft</Button>
            <Button type="submit" disabled={isPending}>
              <Printer size={16} style={{marginRight: 8}}/> 
              {isPending ? 'Memproses...' : 'Generate & Cetak Dokumen'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Tampilan Riwayat with Search & Pagination */}
      <Card title={`Riwayat ${activeForm === 'sph' ? 'SPH' : 'BAST'}`}>
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              type="text"
              placeholder={`Cari riwayat ${activeForm.toUpperCase()}...`}
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '0.875rem',
              }}
            />
          </div>
        </div>

        <div className="overflow-x-auto mt-2 w-full">
          <table className="w-full min-w-[700px] text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-3 font-semibold text-gray-600">ID Dokumen</th>
                <th className="p-3 font-semibold text-gray-600">Klien / Proyek</th>
                <th className="p-3 font-semibold text-gray-600">Tanggal</th>
                {activeForm === 'sph' && <th className="p-3 font-semibold text-gray-600">Nilai</th>}
                <th className="p-3 font-semibold text-gray-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingHistory ? (
                <tr><td colSpan={activeForm === 'sph' ? 5 : 4} className="p-4 text-center text-gray-500">
                  Memuat riwayat {activeForm.toUpperCase()}...
                </td></tr>
              ) : paginatedHistory.length > 0 ? (
                paginatedHistory.map((doc: any) => (
                  <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-mono text-xs text-gray-500">{doc.id}</td>
                    <td className="p-3">
                      <div className="font-medium text-gray-900">{doc.clientId}</div>
                      <div className="text-xs text-gray-500">{doc.projectId}</div>
                    </td>
                    <td className="p-3 text-gray-600">
                      {new Date(doc.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    {activeForm === 'sph' && (
                      <td className="p-3 font-medium text-gray-900">
                        Rp {doc.totalAmount?.toLocaleString('id-ID')}
                      </td>
                    )}
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <Button variant="ghost" size="sm">Cetak</Button>
                        {!isReadOnly && (
                          <button 
                            className="p-2 text-red-500 hover:bg-red-50 rounded"
                            onClick={() => setDeleteTarget({ id: doc.id, type: activeForm })}
                            title={`Hapus ${activeForm.toUpperCase()}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={activeForm === 'sph' ? 5 : 4} className="p-4 text-center text-gray-500">
                  {searchTerm ? 'Tidak ada hasil yang cocok.' : `Belum ada ${activeForm.toUpperCase()}`}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </Card>

      {/* AlertModal for Delete Confirmation */}
      <AlertModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            if (deleteTarget.type === 'sph') {
              deleteSphMutation.mutate(deleteTarget.id);
            } else {
              deleteBastMutation.mutate(deleteTarget.id);
            }
          }
        }}
        title={`Hapus ${deleteTarget?.type === 'sph' ? 'SPH' : 'BAST'}`}
        message={`Dokumen ${deleteTarget?.type?.toUpperCase() || ''} ini akan dihapus secara permanen dan tidak dapat dikembalikan. Lanjutkan?`}
        isLoading={deleteSphMutation.isPending || deleteBastMutation.isPending}
      />
    </div>
  );
}
