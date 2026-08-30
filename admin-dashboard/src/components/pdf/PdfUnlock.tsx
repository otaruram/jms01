import { useState } from 'react';
import { PdfToolLayout } from './PdfToolLayout';
import { Input } from '../ui/Input';
import { readFileAsArrayBuffer } from '../../lib/pdfUtils';
import { PDFDocument } from 'pdf-lib';

interface Props { onBack: () => void; }

export function PdfUnlock({ onBack }: Props) {
  const [password, setPassword] = useState('');

  return (
    <PdfToolLayout
      title="Buka Kunci PDF"
      description="Hapus password dari file PDF Anda (Anda perlu memasukkan password asli)."
      onProcess={async (files) => {
        if (!password) throw new Error('Password tidak boleh kosong');
        const bytes = await readFileAsArrayBuffer(files[0]);
        const pdf = await PDFDocument.load(bytes, { password } as any);
        return pdf.save();
      }}
      outputFilename="unlocked.pdf"
      onBack={onBack}
    >
      {() => (
        <div className="pdf-option-group">
          <Input
            label="Password Asli PDF"
            type="password"
            placeholder="Masukkan password untuk membuka kunci..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      )}
    </PdfToolLayout>
  );
}
