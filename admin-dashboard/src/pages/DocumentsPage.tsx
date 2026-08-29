import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SlideOver } from '../components/ui/SlideOver';
import { Printer, FileText, Plus } from 'lucide-react';
import { documentApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useMutation } from '@tanstack/react-query';
import styles from './DocumentsPage.module.css';

export function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<'form' | 'preview-inv' | 'preview-kwt' | 'preview-sj'>('form');

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

  const createDocMutation = useMutation({
    mutationFn: (data: { clientId: string, projectId: string, amount: number, items: string }) => 
      documentApi.createSmartDocument(data.clientId, data.projectId, data.amount, data.items),
    onSuccess: () => {
      alert('Dokumen berhasil disimpan di Database!');
      setActiveTab('preview-inv');
    },
    onError: (error) => {
      console.error('Gagal menyimpan dokumen', error);
      alert('Gagal menyimpan dokumen');
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
                <Button onClick={handleGenerate} disabled={createDocMutation.isPending}>
                  {createDocMutation.isPending ? 'Menyimpan...' : 'Generate Dokumen'}
                </Button>
              </div>
            </Card>
          )}

          {activeTab !== 'form' && (
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
                <div className={styles.docMockup}>
                  <div className={styles.docHeader}>
                    <h2>PT. INOVASI TEKNOLOGI</h2>
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
            <Button type="submit" disabled={createDocMutation.isPending}>
              {createDocMutation.isPending ? 'Memproses...' : 'Buat Kwitansi & Surat Jalan'}
            </Button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
}
