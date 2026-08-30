import { useState } from 'react';
import { PdfToolLayout } from './PdfToolLayout';
import { protectPdf } from '../../lib/pdfUtils';
import { Input } from '../ui/Input';

interface Props { onBack: () => void; }

export function PdfProtect({ onBack }: Props) {
  const [userPassword, setUserPassword] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');

  return (
    <PdfToolLayout
      title="Proteksi PDF"
      description="Tambahkan password ke file PDF Anda untuk keamanan tambahan."
      onProcess={(files) => {
        if (!userPassword) throw new Error('Password tidak boleh kosong');
        return protectPdf(files[0], userPassword, ownerPassword || userPassword);
      }}
      outputFilename="protected.pdf"
      onBack={onBack}
    >
      {() => (
        <div className="pdf-option-group">
          <Input
            label="Password untuk Membuka PDF"
            type="password"
            placeholder="Masukkan password..."
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
          />
          <Input
            label="Password Pemilik (Opsional)"
            type="password"
            placeholder="Password berbeda untuk edit (opsional)"
            value={ownerPassword}
            onChange={(e) => setOwnerPassword(e.target.value)}
          />
          <p className="pdf-option-hint-sm">
            Catatan: Proteksi PDF diterapkan sebagai metadata keamanan. Simpan password Anda dengan aman.
          </p>
        </div>
      )}
    </PdfToolLayout>
  );
}
