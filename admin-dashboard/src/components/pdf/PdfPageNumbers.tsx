import { useState } from 'react';
import { PdfToolLayout } from './PdfToolLayout';
import { addPageNumbers } from '../../lib/pdfUtils';
import { Input } from '../ui/Input';

interface Props { onBack: () => void; }

type Position = 'bottom-center' | 'bottom-left' | 'bottom-right' | 'top-center' | 'top-left' | 'top-right';

export function PdfPageNumbers({ onBack }: Props) {
  const [position, setPosition] = useState<Position>('bottom-center');
  const [startFrom, setStartFrom] = useState(1);

  const positions: { value: Position; label: string }[] = [
    { value: 'bottom-left', label: 'Bawah Kiri' },
    { value: 'bottom-center', label: 'Bawah Tengah' },
    { value: 'bottom-right', label: 'Bawah Kanan' },
    { value: 'top-left', label: 'Atas Kiri' },
    { value: 'top-center', label: 'Atas Tengah' },
    { value: 'top-right', label: 'Atas Kanan' },
  ];

  return (
    <PdfToolLayout
      title="Tambah Nomor Halaman"
      description="Beri nomor halaman otomatis pada setiap halaman PDF."
      onProcess={(files) => addPageNumbers(files[0], position, 12, startFrom)}
      outputFilename="numbered.pdf"
      onBack={onBack}
    >
      {() => (
        <div className="pdf-option-group">
          <label className="pdf-option-label">Posisi Nomor Halaman</label>
          <div className="pdf-position-grid">
            {positions.map((pos) => (
              <button
                key={pos.value}
                className={`pdf-option-btn ${position === pos.value ? 'pdf-option-btn--active' : ''}`}
                onClick={() => setPosition(pos.value)}
                type="button"
              >
                {pos.label}
              </button>
            ))}
          </div>
          <Input
            label="Mulai dari nomor"
            type="number"
            value={startFrom}
            onChange={(e) => setStartFrom(Number(e.target.value))}
          />
        </div>
      )}
    </PdfToolLayout>
  );
}
