import { useState } from 'react';
import { PdfToolLayout } from './PdfToolLayout';
import { splitPdf, getPageCount } from '../../lib/pdfUtils';
import { Input } from '../ui/Input';

interface Props { onBack: () => void; }

export function PdfSplit({ onBack }: Props) {
  const [pageRange, setPageRange] = useState('');
  const [totalPages, setTotalPages] = useState(0);

  const handleProcess = async (files: File[]) => {
    const pages = pageRange
      .split(',')
      .flatMap((part) => {
        const trimmed = part.trim();
        if (trimmed.includes('-')) {
          const [start, end] = trimmed.split('-').map(Number);
          return Array.from({ length: end - start + 1 }, (_, i) => start + i);
        }
        return [Number(trimmed)];
      })
      .filter((n) => !isNaN(n) && n >= 1 && n <= totalPages);

    return splitPdf(files[0], pages);
  };

  return (
    <PdfToolLayout
      title="Pisahkan PDF"
      description="Ambil halaman tertentu dari file PDF dan simpan sebagai file baru."
      onProcess={handleProcess}
      outputFilename="split.pdf"
      onBack={onBack}
    >
      {({ files }) => {
        // Get page count when file is loaded
        if (files.length > 0 && totalPages === 0) {
          getPageCount(files[0]).then(setTotalPages);
        }
        return (
          <div className="pdf-option-group">
            {totalPages > 0 && (
              <p className="pdf-option-hint">Dokumen memiliki {totalPages} halaman.</p>
            )}
            <Input
              label="Halaman yang ingin diambil"
              placeholder="cth: 1,3,5-8"
              value={pageRange}
              onChange={(e) => setPageRange(e.target.value)}
            />
            <p className="pdf-option-hint-sm">Pisahkan dengan koma. Gunakan tanda hubung untuk rentang (misal: 1-5).</p>
          </div>
        );
      }}
    </PdfToolLayout>
  );
}
