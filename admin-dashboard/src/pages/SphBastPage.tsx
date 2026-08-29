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
  const [formData, setFormData] = useState({ clientName: '', picName: '', date: '', details: '' });
  const { isReadOnly } = useAuth();

  const generateDocMutation = useMutation({
    mutationFn: (data: any) => sphBastApi.createDocument(data),
    onSuccess: () => {
      alert('Dokumen berhasil digenerate dan disimpan!');
    },
    onError: () => {
      alert('Gagal menggenerate dokumen');
    }
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    
    const form = e.currentTarget as HTMLFormElement;
    if (!form.checkValidity()) return;
    
    generateDocMutation.mutate({
      type: activeForm.toUpperCase(),
      clientName: formData.clientName,
      picName: formData.picName,
      date: formData.date,
      details: formData.details
    });
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="ID Proyek / Penawaran" placeholder="Otomatis digenerate" disabled />
            <Input 
              label="Nama Klien" 
              placeholder="Masukkan nama klien" 
              value={formData.clientName}
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
              required 
            />
            <Input 
              label="Penanggung Jawab Klien" 
              placeholder="Nama representatif klien" 
              value={formData.picName}
              onChange={(e) => setFormData({...formData, picName: e.target.value})}
              required 
            />
            <Input 
              label="Tanggal Dokumen" 
              type="date" 
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required 
            />
          </div>
          
          <div className="w-full mt-4">
            <label className={styles.label}>
              {activeForm === 'sph' ? "Detail Penawaran" : "Rincian Pekerjaan yang Diserahkan"}
            </label>
            <textarea 
              className={`${styles.textarea} w-full mt-2`} 
              rows={5} 
              placeholder="Masukkan rincian..." 
              value={formData.details}
              onChange={(e) => setFormData({...formData, details: e.target.value})}
              required 
            />
          </div>

          <div className={`${styles.formActions} mt-8`}>
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => setFormData({
                clientName: 'PT. Maju Mundur (CLI-DEMO-01)',
                picName: 'Budi Santoso',
                date: new Date().toISOString().split('T')[0],
                details: '1. Instalasi Jaringan LAN (15 Titik)\n2. Setup Mikrotik Router\n3. Testing dan Commissioning'
              })}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              Auto Fill (Dev)
            </Button>
            <Button variant="outline" type="button">Simpan Draft</Button>
            <Button type="submit" disabled={generateDocMutation.isPending}>
              <Printer size={16} style={{marginRight: 8}}/> 
              {generateDocMutation.isPending ? 'Memproses...' : 'Generate & Cetak Dokumen'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
