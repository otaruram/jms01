import { useState, useRef } from 'react';
import { PdfToolLayout } from './PdfToolLayout';
import { addSignature } from '../../lib/pdfUtils';
import { Input } from '../ui/Input';
import { Upload } from 'lucide-react';

interface Props { onBack: () => void; }

export function PdfSign({ onBack }: Props) {
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState('');
  const [pageNum, setPageNum] = useState(1);
  const [posX, setPosX] = useState(100);
  const [posY, setPosY] = useState(100);
  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(80);
  const sigInputRef = useRef<HTMLInputElement>(null);

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSignatureFile(file);
    const reader = new FileReader();
    reader.onload = () => setSignaturePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <PdfToolLayout
      title="Tanda Tangan PDF"
      description="Tambahkan gambar tanda tangan ke halaman tertentu di PDF."
      onProcess={(files) => {
        if (!signatureFile) throw new Error('Upload gambar tanda tangan terlebih dahulu');
        return addSignature(files[0], signatureFile, pageNum - 1, posX, posY, width, height);
      }}
      outputFilename="signed.pdf"
      onBack={onBack}
    >
      {() => (
        <div className="pdf-option-group">
          {/* Signature Upload */}
          <label className="pdf-option-label">Gambar Tanda Tangan</label>
          {signaturePreview ? (
            <div className="pdf-sign-preview">
              <img src={signaturePreview} alt="Tanda tangan" />
              <button className="pdf-sign-change" onClick={() => sigInputRef.current?.click()}>
                Ganti
              </button>
            </div>
          ) : (
            <button className="pdf-sign-upload" onClick={() => sigInputRef.current?.click()}>
              <Upload size={20} />
              <span>Upload Gambar Tanda Tangan (PNG/JPG)</span>
            </button>
          )}
          <input
            ref={sigInputRef}
            type="file"
            accept=".png,.jpg,.jpeg"
            onChange={handleSignatureUpload}
            style={{ display: 'none' }}
          />

          <div className="pdf-option-row">
            <Input label="Halaman" type="number" value={pageNum} onChange={(e) => setPageNum(Number(e.target.value))} />
            <Input label="Posisi X" type="number" value={posX} onChange={(e) => setPosX(Number(e.target.value))} />
            <Input label="Posisi Y" type="number" value={posY} onChange={(e) => setPosY(Number(e.target.value))} />
          </div>
          <div className="pdf-option-row">
            <Input label="Lebar (px)" type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} />
            <Input label="Tinggi (px)" type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
          </div>
        </div>
      )}
    </PdfToolLayout>
  );
}
