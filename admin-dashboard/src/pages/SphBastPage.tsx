import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Download, FileCheck, FileSignature, Printer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { sphBastApi } from '../lib/api';
import styles from './SphBastPage.module.css';

export function SphBastPage() {
  const [activeForm, setActiveForm] = useState<'sph' | 'bast'>('sph');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { isReadOnly } = useAuth();

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
      alert('SPH berhasil digenerate dan disimpan!');
      setSphData({ clientId: '', projectId: '', subject: '', totalAmount: '', items: '' });
    },
    onError: (error: any) => {
      alert('Gagal menggenerate SPH: ' + (error.response?.data?.message || error.message));
    }
  });

  const bastMutation = useMutation({
    mutationFn: (data: { clientId: string; projectId: string; description: string }) =>
      sphBastApi.createBast(data),
    onSuccess: () => {
      alert('BAST berhasil digenerate dan disimpan!');
      setBastData({ clientId: '', projectId: '', description: '' });
    },
    onError: (error: any) => {
      alert('Gagal menggenerate BAST: ' + (error.response?.data?.message || error.message));
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
          onClick={() => setActiveForm('sph')}
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
          onClick={() => setActiveForm('bast')}
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
    </div>
  );
}
