import { useState } from 'react';
import { PdfToolLayout } from './PdfToolLayout';
import { rotatePdf } from '../../lib/pdfUtils';

interface Props { onBack: () => void; }

export function PdfRotate({ onBack }: Props) {
  const [rotation, setRotation] = useState(90);

  return (
    <PdfToolLayout
      title="Putar Halaman PDF"
      description="Putar orientasi halaman PDF Anda (90°, 180°, atau 270°)."
      onProcess={(files) => rotatePdf(files[0], rotation)}
      outputFilename="rotated.pdf"
      onBack={onBack}
    >
      {() => (
        <div className="pdf-option-group">
          <label className="pdf-option-label">Arah Putar</label>
          <div className="pdf-option-buttons">
            {[
              { value: 90, label: '90° Searah Jarum Jam' },
              { value: 180, label: '180° (Balik)' },
              { value: 270, label: '90° Berlawanan Jarum Jam' },
            ].map((opt) => (
              <button
                key={opt.value}
                className={`pdf-option-btn ${rotation === opt.value ? 'pdf-option-btn--active' : ''}`}
                onClick={() => setRotation(opt.value)}
                type="button"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </PdfToolLayout>
  );
}
