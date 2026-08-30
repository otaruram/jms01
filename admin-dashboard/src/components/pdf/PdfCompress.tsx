import { PdfToolLayout } from './PdfToolLayout';
import { compressPdf } from '../../lib/pdfUtils';

interface Props { onBack: () => void; }

export function PdfCompress({ onBack }: Props) {
  return (
    <PdfToolLayout
      title="Kompres PDF"
      description="Perkecil ukuran file PDF dengan mengoptimalkan struktur dan membuang objek yang tidak terpakai."
      onProcess={(files) => compressPdf(files[0])}
      outputFilename="compressed.pdf"
      onBack={onBack}
    >
      {() => (
        <p className="pdf-option-hint">
          Proses kompresi akan berjalan otomatis. File akan dioptimalkan menggunakan algoritma dari pdf-lib.
        </p>
      )}
    </PdfToolLayout>
  );
}
