import { PdfToolLayout } from './PdfToolLayout';
import { imagesToPdf } from '../../lib/pdfUtils';

interface Props { onBack: () => void; }

export function PdfImageToPdf({ onBack }: Props) {
  return (
    <PdfToolLayout
      title="Gambar ke PDF"
      description="Ubah foto proyek atau dokumen (JPG/PNG) menjadi satu file PDF."
      accept=".jpg,.jpeg,.png"
      multiple
      onProcess={imagesToPdf}
      outputFilename="images.pdf"
      onBack={onBack}
    >
      {({ files }) => (
        <p className="pdf-option-hint">
          {files.length} gambar dipilih. Gambar akan dikonversi sesuai dengan urutan upload.
        </p>
      )}
    </PdfToolLayout>
  );
}
