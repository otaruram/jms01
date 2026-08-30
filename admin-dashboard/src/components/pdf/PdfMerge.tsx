import { PdfToolLayout } from './PdfToolLayout';
import { mergePdfs } from '../../lib/pdfUtils';

interface Props { onBack: () => void; }

export function PdfMerge({ onBack }: Props) {
  return (
    <PdfToolLayout
      title="Gabungkan PDF"
      description="Gabungkan beberapa file PDF menjadi satu dokumen berurutan."
      multiple
      onProcess={(files) => mergePdfs(files)}
      outputFilename="merged.pdf"
      onBack={onBack}
    >
      {({ files }) => (
        <p className="pdf-option-hint">
          {files.length} file dipilih. Urutan file sesuai urutan upload. Drag file di atas untuk mengubah urutan.
        </p>
      )}
    </PdfToolLayout>
  );
}
