import { useState } from 'react';
import { PdfToolLayout } from './PdfToolLayout';
import { addWatermark } from '../../lib/pdfUtils';
import { Input } from '../ui/Input';

interface Props { onBack: () => void; }

export function PdfWatermark({ onBack }: Props) {
  const [text, setText] = useState('RAHASIA');
  const [opacity, setOpacity] = useState(15);
  const [fontSize, setFontSize] = useState(60);

  return (
    <PdfToolLayout
      title="Tambah Watermark"
      description="Tambahkan teks watermark transparan di setiap halaman PDF."
      onProcess={(files) => addWatermark(files[0], text, opacity / 100, fontSize)}
      outputFilename="watermarked.pdf"
      onBack={onBack}
    >
      {() => (
        <div className="pdf-option-group">
          <Input
            label="Teks Watermark"
            placeholder="cth: RAHASIA, DRAFT, CONFIDENTIAL"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="pdf-option-row">
            <div style={{ flex: 1 }}>
              <label className="pdf-option-label">Transparansi: {opacity}%</label>
              <input
                type="range"
                min="5"
                max="80"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="pdf-range"
              />
            </div>
            <div style={{ flex: 1 }}>
              <Input
                label="Ukuran Font"
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      )}
    </PdfToolLayout>
  );
}
