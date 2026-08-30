import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SlideOver } from '../components/ui/SlideOver';
import { Pagination } from '../components/ui/Pagination';
import { AlertModal } from '../components/ui/AlertModal';
import { Printer, FileText, Plus, Trash2, Search } from 'lucide-react';
import { documentApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../components/ui/ToastContext';
import styles from './DocumentsPage.module.css';

export function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<'form' | 'preview-inv' | 'preview-kwt' | 'preview-sj' | 'history'>('form');

  // Shared state for the single input document generator
  const [docData, setDocData] = useState({
    clientId: '',
    projectId: '',
    amount: '',
    date: '',
    items: ''
  });

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [docItems, setDocItems] = useState<{name: string, qty: number, price: number}[]>([{name: '', qty: 1, price: 0}]);
  const { isReadOnly } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: documentHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentApi.getDocuments().then(res => res.data.data)
  });

  const createDocMutation = useMutation({
    mutationFn: (data: { clientId: string, projectId: string, amount: number, items: string }) => 
      documentApi.createSmartDocument(data.clientId, data.projectId, data.amount, data.items),
    onSuccess: () => {
      toast('Dokumen berhasil disimpan di Database!', 'success');
      setActiveTab('history');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (error: any) => {
      console.error('Gagal menyimpan dokumen', error);
      toast('Gagal menyimpan dokumen: ' + (error.response?.data?.message || error.message), 'error');
    }
  });

  const deleteDocMutation = useMutation({
    mutationFn: (id: string) => documentApi.deleteDocument(id),
    onSuccess: () => {
      toast('Dokumen berhasil dihapus permanen!', 'success');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (error: any) => {
      toast('Gagal menghapus dokumen: ' + (error.response?.data?.message || error.message), 'error');
      setDeleteTarget(null);
    }
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    
    // Check if form is valid (using HTML5 validation)
    const form = e.currentTarget as HTMLFormElement;
    if (!form.checkValidity()) {
      return; // Stop if invalid, the browser will show the tooltips and CSS will show red borders
    }
    
    // For single simple input format in Master Data
    let itemsToPass = docData.items;
    
    // If it's from the SlideOver with docItems, serialize it
    if (isSlideOverOpen) {
      itemsToPass = docItems.map(item => item.name).join(', ');
    }

    createDocMutation.mutate({
      clientId: docData.clientId,
      projectId: docData.projectId,
      amount: parseFloat(docData.amount),
      items: itemsToPass
    });
  };

  // Compute filtered + paginated data
  const allDocs = documentHistory || [];
  const filtered = allDocs.filter((doc: any) =>
    doc.clientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.projectId.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Dokumen & Administrasi</h1>
          <p className={styles.subtitle}>Sistem input terintegrasi (Kwitansi & Surat Jalan otomatis)</p>
        </div>
        {!isReadOnly && (
          <Button onClick={() => setIsSlideOverOpen(true)}>
            <Plus size={16} style={{marginRight: 8}} /> Dokumen Baru
          </Button>
        )}
      </header>

      <div className={styles.layout}>
        <div className={styles.sidebar}>
          <Card className={styles.navCard}>
            <button 
              className={`${styles.navItem} ${activeTab === 'form' ? styles.activeNav : ''}`}
              onClick={() => setActiveTab('form')}
            >
              <FileText size={18} /> Input Data Utama
            </button>
            <div className={styles.navDivider}>Preview Otomatis</div>
            <button 
              className={`${styles.navItem} ${activeTab === 'preview-inv' ? styles.activeNav : ''}`}
              onClick={() => setActiveTab('preview-inv')}
            >
              Invoice
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'preview-kwt' ? styles.activeNav : ''}`}
              onClick={() => setActiveTab('preview-kwt')}
            >
              Kwitansi
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'preview-sj' ? styles.activeNav : ''}`}
              onClick={() => setActiveTab('preview-sj')}
            >
              Surat Jalan
            </button>
            <div className={styles.navDivider}>Arsip</div>
            <button 
              className={`${styles.navItem} ${activeTab === 'history' ? styles.activeNav : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <FileText size={18} /> Riwayat Dokumen
            </button>
          </Card>
        </div>

        <div className={styles.mainArea}>
          {activeTab === 'form' && (
            <Card title="Formulir Master Data">
              <div className={styles.formGrid}>
                <Input 
                  label="ID Klien" 
                  value={docData.clientId}
                  onChange={e => setDocData({...docData, clientId: e.target.value})}
                />
                <Input 
                  label="ID Proyek" 
                  value={docData.projectId}
                  onChange={e => setDocData({...docData, projectId: e.target.value})}
                />
                <Input 
                  label="Nominal Transaksi (Rp)" 
                  type="number"
                  value={docData.amount}
                  onChange={e => setDocData({...docData, amount: e.target.value})}
                />
                <Input 
                  label="Tanggal Cetak" 
                  type="date"
                  value={docData.date}
                  onChange={e => setDocData({...docData, date: e.target.value})}
                />
                <div className={styles.fullWidth}>
                  <label className={styles.label}>Rincian Barang (Pisahkan dengan koma)</label>
                  <textarea 
                    className={styles.textarea} 
                    rows={4}
                    value={docData.items}
                    onChange={e => setDocData({...docData, items: e.target.value})}
                  />
                </div>
              </div>
              <div className={styles.formActions}>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => {
                    setDocData({
                      clientId: 'CLI-DEMO-01',
                      projectId: 'PRJ-DEMO-01',
                      amount: '15000000',
                      date: new Date().toISOString().split('T')[0],
                      items: 'Instalasi Server, Setup Jaringan'
                    });
                  }}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  style={{ marginRight: '1rem' }}
                >
                  Auto Fill (Dev)
                </Button>
                <Button onClick={handleGenerate} disabled={createDocMutation.isPending}>
                  {createDocMutation.isPending ? 'Menyimpan...' : 'Generate Dokumen'}
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'history' && (
            <Card title="Riwayat Dokumen Pintar">
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                  <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan klien atau proyek..."
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
                <table className="w-full min-w-[800px] text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="p-3 font-semibold text-gray-600">ID Dokumen</th>
                      <th className="p-3 font-semibold text-gray-600">Klien / Proyek</th>
                      <th className="p-3 font-semibold text-gray-600">Tanggal</th>
                      <th className="p-3 font-semibold text-gray-600">Total Nominal</th>
                      <th className="p-3 font-semibold text-gray-600">Arsip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingHistory ? (
                      <tr><td colSpan={5} className="p-4 text-center text-gray-500">Memuat riwayat dokumen...</td></tr>
                    ) : paginated.length > 0 ? (
                      paginated.map((doc: any) => (
                        <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3 font-mono text-xs text-gray-500">{doc.id}</td>
                          <td className="p-3">
                            <div className="font-medium text-gray-900">{doc.clientId}</div>
                            <div className="text-xs text-gray-500">{doc.projectId}</div>
                          </td>
                          <td className="p-3 text-gray-600">
                            {new Date(doc.createdAt).toLocaleDateString('id-ID')}
                          </td>
                          <td className="p-3 font-medium text-gray-900">
                            Rp {doc.amount?.toLocaleString('id-ID')}
                          </td>
                          <td className="p-3 flex gap-2 items-center">
                            <Button variant="ghost" size="sm" onClick={() => {
                              setDocData({
                                clientId: doc.clientId,
                                projectId: doc.projectId,
                                amount: doc.amount.toString(),
                                date: doc.createdAt.split('T')[0],
                                items: doc.itemsJson
                              });
                              setActiveTab('preview-inv');
                            }}>Inv</Button>
                            <Button variant="ghost" size="sm" onClick={() => {
                              setDocData({
                                clientId: doc.clientId,
                                projectId: doc.projectId,
                                amount: doc.amount.toString(),
                                date: doc.createdAt.split('T')[0],
                                items: doc.itemsJson
                              });
                              setActiveTab('preview-kwt');
                            }}>Kwt</Button>
                            <Button variant="ghost" size="sm" onClick={() => {
                              setDocData({
                                clientId: doc.clientId,
                                projectId: doc.projectId,
                                amount: doc.amount.toString(),
                                date: doc.createdAt.split('T')[0],
                                items: doc.itemsJson
                              });
                              setActiveTab('preview-sj');
                            }}>SJ</Button>
                            {!isReadOnly && (
                              <button 
                                className="p-2 text-red-500 hover:bg-red-50 rounded"
                                onClick={() => setDeleteTarget(doc.id)}
                                title="Hapus Dokumen"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={5} className="p-4 text-center text-gray-500">
                        {searchTerm ? 'Tidak ada data yang cocok.' : 'Belum ada dokumen yang di-generate'}
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
          )}

          {activeTab !== 'form' && activeTab !== 'history' && (
            <Card className={styles.previewCard}>
              <div className={styles.previewHeader}>
                <h3 className={styles.previewTitle}>
                  {activeTab === 'preview-inv' && 'Preview Invoice'}
                  {activeTab === 'preview-kwt' && 'Preview Kwitansi'}
                  {activeTab === 'preview-sj' && 'Preview Surat Jalan'}
                </h3>
                <Button size="sm"><Printer size={16} style={{marginRight: 8}}/> Cetak / PDF</Button>
              </div>
              
              <div className={styles.documentCanvas}>
                <div className={styles.docMockup} contentEditable={true} suppressContentEditableWarning={true}>
                  <div className={styles.docHeader}>
                    <h2>PT. JARINGAN MAKMUR SEJAHTERA</h2>
                    <p>Jl. Teknologi No. 45, Jakarta</p>
                  </div>
                  
                  <h1 className={styles.docType}>
                    {activeTab === 'preview-inv' && 'INVOICE'}
                    {activeTab === 'preview-kwt' && 'KWITANSI'}
                    {activeTab === 'preview-sj' && 'SURAT JALAN'}
                  </h1>

                  <div className={styles.docMeta}>
                    <p><strong>Kepada:</strong> {docData.clientId || '[ID Klien]'}</p>
                    <p><strong>Proyek:</strong> {docData.projectId || '[ID Proyek]'}</p>
                    <p><strong>Tanggal:</strong> {docData.date || '[Tanggal]'}</p>
                  </div>

                  {activeTab === 'preview-kwt' && (
                    <div className={styles.kwtBox}>
                      <p>Telah terima dari: <strong>{docData.clientId || '...'}</strong></p>
                      <p>Uang sejumlah: <strong>Rp {docData.amount ? parseInt(docData.amount).toLocaleString('id-ID') : '...'}</strong></p>
                      <p>Untuk pembayaran: {docData.projectId || '...'}</p>
                    </div>
                  )}

                  {(activeTab === 'preview-inv' || activeTab === 'preview-sj') && (
                    <table className={styles.docTable}>
                      <thead>
                        <tr>
                          <th>No</th>
                          <th>Deskripsi Barang</th>
                          {activeTab === 'preview-inv' && <th>Total Harga</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {(docData.items ? docData.items.split(',') : ['Item 1', 'Item 2']).map((item, idx) => (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td>{item.trim()}</td>
                            {activeTab === 'preview-inv' && <td>Rp -</td>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {activeTab === 'preview-inv' && (
                    <div className={styles.docTotal}>
                      <h3>Total: Rp {docData.amount ? parseInt(docData.amount).toLocaleString('id-ID') : '0'}</h3>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      <SlideOver 
        isOpen={isSlideOverOpen} 
        onClose={() => setIsSlideOverOpen(false)} 
        title="Buat Dokumen Baru"
      >
        <form className={`${styles.form} ${hasSubmitted ? 'was-validated' : ''}`} onSubmit={handleGenerate} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="ID Klien" 
              placeholder="Ketik ID Klien..."
              value={docData.clientId}
              onChange={(e) => setDocData({...docData, clientId: e.target.value})}
              required
            />
            <Input 
              label="ID Proyek Terkait" 
              placeholder="Ketik ID Proyek..."
              value={docData.projectId}
              onChange={(e) => setDocData({...docData, projectId: e.target.value})}
              required
            />
          </div>
          
          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>Item Dokumen</h4>
            {docItems.map((item, idx) => (
              <div key={idx} className={styles.itemRow}>
                <div style={{flex: 2}}>
                  <Input 
                    placeholder="Nama Item (cth: Instalasi)" 
                    value={item.name}
                    onChange={(e) => {
                      const newItems = [...docItems];
                      newItems[idx].name = e.target.value;
                      setDocItems(newItems);
                    }}
                    required
                  />
                </div>
                <div style={{flex: 1}}>
                  <Input 
                    type="number" 
                    placeholder="Qty" 
                    value={item.qty}
                    onChange={(e) => {
                      const newItems = [...docItems];
                      newItems[idx].qty = parseInt(e.target.value);
                      setDocItems(newItems);
                    }}
                    required
                  />
                </div>
                <div style={{flex: 2}}>
                  <Input 
                    type="number" 
                    placeholder="Harga Satuan (Rp)" 
                    value={item.price || ''}
                    onChange={(e) => {
                      const newItems = [...docItems];
                      newItems[idx].price = parseInt(e.target.value);
                      setDocItems(newItems);
                    }}
                    required
                  />
                </div>
              </div>
            ))}
            <div className="mt-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => setDocItems([...docItems, {name: '', qty: 1, price: 0}])}
              >
                + Tambah Item
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input 
              type="number"
              label="Total Nominal Akhir (Rp)" 
              placeholder="Contoh: 15000000"
              value={docData.amount}
              onChange={(e) => setDocData({...docData, amount: e.target.value})}
              required
            />
            <Input 
              type="date"
              label="Tanggal Cetak" 
              value={docData.date}
              onChange={(e) => setDocData({...docData, date: e.target.value})}
              required
            />
          </div>

          <div className={`${styles.formActions} mt-8`}>
            <Button variant="outline" type="button" onClick={() => setIsSlideOverOpen(false)}>Batal</Button>
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => {
                setDocData({
                  clientId: 'CLI-DEMO-01',
                  projectId: 'PRJ-DEMO-01',
                  amount: '15000000',
                  date: new Date().toISOString().split('T')[0],
                  items: ''
                });
                setDocItems([{name: 'Instalasi Server', qty: 1, price: 15000000}]);
              }}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              Auto Fill (Dev)
            </Button>
            <Button type="submit" disabled={createDocMutation.isPending}>
              {createDocMutation.isPending ? 'Memproses...' : 'Buat Kwitansi & Surat Jalan'}
            </Button>
          </div>
        </form>
      </SlideOver>

      {/* AlertModal for Delete Confirmation */}
      <AlertModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) deleteDocMutation.mutate(deleteTarget); }}
        title="Hapus Dokumen"
        message="Dokumen ini beserta kwitansi dan surat jalannya akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan."
        isLoading={deleteDocMutation.isPending}
      />
    </div>
  );
}
