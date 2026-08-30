import { useState } from 'react';
import styles from './PdfToolsPage.module.css';
import { 
  FilePlus, FileMinus, Scissors, RotateCw, 
  Type, Hash, PenTool, 
  Lock, Unlock, 
  Image as ImageIcon, Minimize2
} from 'lucide-react';

// Import all tool components
import { PdfMerge } from '../components/pdf/PdfMerge';
import { PdfSplit } from '../components/pdf/PdfSplit';
import { PdfRemovePages } from '../components/pdf/PdfRemovePages';
import { PdfRotate } from '../components/pdf/PdfRotate';
import { PdfWatermark } from '../components/pdf/PdfWatermark';
import { PdfPageNumbers } from '../components/pdf/PdfPageNumbers';
import { PdfSign } from '../components/pdf/PdfSign';
import { PdfProtect } from '../components/pdf/PdfProtect';
import { PdfUnlock } from '../components/pdf/PdfUnlock';
import { PdfImageToPdf } from '../components/pdf/PdfImageToPdf';
import { PdfCompress } from '../components/pdf/PdfCompress';

type ToolId = 
  | 'merge' | 'split' | 'remove' | 'rotate'
  | 'watermark' | 'numbers' | 'sign'
  | 'protect' | 'unlock'
  | 'image-to-pdf' | 'compress'
  | null;

export function PdfToolsPage() {
  const [activeTool, setActiveTool] = useState<ToolId>(null);

  const renderTool = () => {
    const props = { onBack: () => setActiveTool(null) };
    
    switch (activeTool) {
      case 'merge': return <PdfMerge {...props} />;
      case 'split': return <PdfSplit {...props} />;
      case 'remove': return <PdfRemovePages {...props} />;
      case 'rotate': return <PdfRotate {...props} />;
      case 'watermark': return <PdfWatermark {...props} />;
      case 'numbers': return <PdfPageNumbers {...props} />;
      case 'sign': return <PdfSign {...props} />;
      case 'protect': return <PdfProtect {...props} />;
      case 'unlock': return <PdfUnlock {...props} />;
      case 'image-to-pdf': return <PdfImageToPdf {...props} />;
      case 'compress': return <PdfCompress {...props} />;
      default: return null;
    }
  };

  if (activeTool) {
    return (
      <div className={styles.container}>
        {renderTool()}
      </div>
    );
  }

  const categories = [
    {
      title: "Manipulasi Halaman",
      tools: [
        { id: 'merge', name: 'Gabung PDF', desc: 'Gabungkan banyak file PDF menjadi satu file secara berurutan.', icon: <FilePlus /> },
        { id: 'split', name: 'Pisahkan PDF', desc: 'Ambil halaman tertentu dari file PDF dan simpan sebagai file baru.', icon: <Scissors /> },
        { id: 'remove', name: 'Hapus Halaman', desc: 'Hapus halaman yang tidak diinginkan dari dokumen PDF.', icon: <FileMinus /> },
        { id: 'rotate', name: 'Putar PDF', desc: 'Putar orientasi halaman PDF (90°, 180°, atau 270°).', icon: <RotateCw /> },
      ]
    },
    {
      title: "Modifikasi Isi",
      tools: [
        { id: 'watermark', name: 'Tambah Watermark', desc: 'Tambahkan teks watermark transparan di setiap halaman PDF.', icon: <Type /> },
        { id: 'numbers', name: 'Nomor Halaman', desc: 'Beri nomor halaman otomatis pada setiap halaman PDF.', icon: <Hash /> },
        { id: 'sign', name: 'Tanda Tangan', desc: 'Tambahkan gambar tanda tangan ke halaman tertentu di PDF.', icon: <PenTool /> },
      ]
    },
    {
      title: "Keamanan",
      tools: [
        { id: 'protect', name: 'Proteksi PDF', desc: 'Tambahkan password ke file PDF Anda untuk keamanan.', icon: <Lock /> },
        { id: 'unlock', name: 'Buka Kunci PDF', desc: 'Hapus password dari file PDF (butuh password asli).', icon: <Unlock /> },
      ]
    },
    {
      title: "Konversi & Optimasi",
      tools: [
        { id: 'image-to-pdf', name: 'Gambar ke PDF', desc: 'Ubah foto proyek atau dokumen (JPG/PNG) menjadi PDF.', icon: <ImageIcon /> },
        { id: 'compress', name: 'Kompres PDF', desc: 'Perkecil ukuran file PDF agar mudah dikirim via email.', icon: <Minimize2 /> },
      ]
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>PDF Tools</h1>
        <p className={styles.description}>
          Kelola, gabungkan, dan amankan dokumen PDF Anda langsung dari browser tanpa perlu mengunggah ke server pihak ketiga.
        </p>
      </div>

      {categories.map((cat, idx) => (
        <div key={idx} className={styles.category}>
          <h2 className={styles.categoryTitle}>{cat.title}</h2>
          <div className={styles.grid}>
            {cat.tools.map((tool) => (
              <div 
                key={tool.id} 
                className={styles.toolCard}
                onClick={() => setActiveTool(tool.id as ToolId)}
              >
                <div className={styles.iconWrapper}>
                  {tool.icon}
                </div>
                <div>
                  <h3 className={styles.toolTitle}>{tool.name}</h3>
                  <p className={styles.toolDesc}>{tool.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
