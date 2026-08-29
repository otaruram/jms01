import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Plus } from 'lucide-react';
import styles from './ProjectDetailPage.module.css';

export function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'barang' | 'akomodasi'>('barang');

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <button className={styles.backBtn} onClick={() => navigate('/projects')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className={styles.title}>Detail Proyek: {id}</h1>
            <p className={styles.subtitle}>PT. Maju Mundur - Instalasi Jaringan Gedung A</p>
          </div>
        </div>
        <Button><Plus size={16} /> Tambah Pengeluaran</Button>
      </header>

      <div className={styles.summaryGrid}>
        <Card className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Total Modal Keseluruhan</div>
          <div className={styles.summaryValue}>Rp 15.000.000</div>
        </Card>
        <Card className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Total Modal Barang</div>
          <div className={styles.summaryValue}>Rp 12.500.000</div>
        </Card>
        <Card className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Total Modal Akomodasi</div>
          <div className={styles.summaryValue}>Rp 2.500.000</div>
        </Card>
      </div>

      <Card className={styles.tabsCard}>
        <div className={styles.tabsHeader}>
          <button 
            className={`${styles.tab} ${activeTab === 'barang' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('barang')}
          >
            Modal Barang
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'akomodasi' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('akomodasi')}
          >
            Modal Akomodasi
          </button>
        </div>
        
        <div className={styles.tabContent}>
          {activeTab === 'barang' ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>ID Barang / Deskripsi</th>
                  <th>Qty</th>
                  <th>Total Harga</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>12 Aug 2026</td>
                  <td>INV-001 (Kabel UTP Cat 6)</td>
                  <td>2 Roll</td>
                  <td>Rp 3.000.000</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Deskripsi Akomodasi</th>
                  <th>Kategori</th>
                  <th>Total Biaya</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>14 Aug 2026</td>
                  <td>Tiket Kereta & Penginapan Tim</td>
                  <td>Transport & Penginapan</td>
                  <td>Rp 1.500.000</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
