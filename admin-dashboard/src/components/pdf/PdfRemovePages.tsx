import { useState } from 'react';
import { PdfToolLayout } from './PdfToolLayout';
import { removePages, getPageCount } from '../../lib/pdfUtils';
import { Input } from '../ui/Input';

interface Props { onBack: () => void; }

export function PdfRemovePages({ onBack }: Props) {
  const [pagesToRemove, setPagesToRemove] = useState('');
  const [totalPages, setTotalPages] = useState(0);

  const handleProcess = async (files: File[]) => {
    const pages = pagesToRemove
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

    return removePages(files[0], pages);
  };

  return (
    <PdfToolLayout
      title="Hapus Halaman PDF"
      description="Hapus halaman tertentu dari dokumen PDF Anda."
      onProcess={handleProcess}
      outputFilename="cleaned.pdf"
      onBack={onBack}
    >
      {({ files }) => {
        if (files.length > 0 && totalPages === 0) {
          getPageCount(files[0]).then(setTotalPages);
        }
        return (
          <div className="pdf-option-group">
            {totalPages > 0 && (
              <p className="pdf-option-hint">Dokumen memiliki {totalPages} halaman.</p>
            )}
            <Input
              label="Halaman yang ingin dihapus"
              placeholder="cth: 2,4,6-8"
              value={pagesToRemove}
              onChange={(e) => setPagesToRemove(e.target.value)}
            />
            <p className="pdf-option-hint-sm">Pisahkan dengan koma. Halaman lainnya akan tetap dipertahankan.</p>
          </div>
        );
      }}
    </PdfToolLayout>
  );
}
