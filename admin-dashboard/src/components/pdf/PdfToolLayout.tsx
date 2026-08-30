import { useState, useRef, useCallback } from 'react';
import { Upload, Download, CheckCircle, Loader2, AlertCircle, X, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatFileSize } from '../../lib/pdfUtils';

/**
 * PdfToolLayout — Reusable wrapper for all PDF tool components.
 * Handles: file upload (drag & drop + click), processing state, download result.
 * Each tool only needs to provide its options UI and processing function.
 */

interface PdfToolLayoutProps {
  title: string;
  description: string;
  accept?: string;           // e.g. ".pdf" or ".jpg,.jpeg,.png"
  multiple?: boolean;
  children: (props: {
    files: File[];
    setFiles: (files: File[]) => void;
    removeFile: (index: number) => void;
  }) => React.ReactNode;
  onProcess: (files: File[]) => Promise<Uint8Array>;
  outputFilename?: string;
  onBack: () => void;
}

type ProcessState = 'idle' | 'processing' | 'done' | 'error';

export function PdfToolLayout({
  title,
  description,
  accept = '.pdf',
  multiple = false,
  children,
  onProcess,
  outputFilename = 'hasil.pdf',
  onBack,
}: PdfToolLayoutProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessState>('idle');
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles);
    if (multiple) {
      setFiles((prev) => [...prev, ...arr]);
    } else {
      setFiles(arr.slice(0, 1));
    }
    setState('idle');
    setResult(null);
    setError('');
  }, [multiple]);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setState('idle');
    setResult(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleProcess = async () => {
    if (files.length === 0) return;
    setState('processing');
    setError('');
    try {
      const data = await onProcess(files);
      setResult(data);
      setResultSize(data.length);
      setState('done');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memproses PDF.');
      setState('error');
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = outputFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const originalSize = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="pdf-tool-layout">
      {/* Header */}
      <div className="pdf-tool-header">
        <button className="pdf-tool-back" onClick={onBack}>← Kembali ke PDF Tools</button>
        <h2 className="pdf-tool-title">{title}</h2>
        <p className="pdf-tool-desc">{description}</p>
      </div>

      {/* Drop Zone */}
      {files.length === 0 && (
        <div
          className={`pdf-dropzone ${isDragging ? 'pdf-dropzone--active' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <Upload size={48} className="pdf-dropzone-icon" />
          <p className="pdf-dropzone-text">
            Seret & letakkan file di sini, atau <span className="pdf-dropzone-link">pilih file</span>
          </p>
          <p className="pdf-dropzone-hint">
            {accept === '.pdf' ? 'Hanya file PDF' : 'JPG, JPEG, atau PNG'}
            {multiple && ' — Bisa pilih banyak file'}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="pdf-file-list">
          {files.map((file, i) => (
            <div key={`${file.name}-${i}`} className="pdf-file-item">
              <FileText size={20} className="pdf-file-icon" />
              <div className="pdf-file-info">
                <span className="pdf-file-name">{file.name}</span>
                <span className="pdf-file-size">{formatFileSize(file.size)}</span>
              </div>
              <button className="pdf-file-remove" onClick={() => removeFile(i)}>
                <X size={16} />
              </button>
            </div>
          ))}
          {multiple && (
            <button className="pdf-add-more" onClick={() => inputRef.current?.click()}>
              + Tambah File Lagi
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {/* Tool-specific options (rendered by child) */}
      {files.length > 0 && state !== 'done' && (
        <div className="pdf-tool-options">
          {children({ files, setFiles, removeFile })}
        </div>
      )}

      {/* Action Buttons */}
      {files.length > 0 && state !== 'done' && (
        <div className="pdf-tool-actions">
          <Button
            variant="outline"
            onClick={() => { setFiles([]); setState('idle'); setResult(null); setError(''); }}
          >
            Reset
          </Button>
          <Button
            onClick={handleProcess}
            disabled={state === 'processing'}
          >
            {state === 'processing' ? (
              <><Loader2 size={16} className="animate-spin" style={{ marginRight: 8 }} /> Memproses...</>
            ) : (
              'Proses Sekarang'
            )}
          </Button>
        </div>
      )}

      {/* Error */}
      {state === 'error' && (
        <div className="pdf-result pdf-result--error">
          <AlertCircle size={24} />
          <p>{error}</p>
          <Button variant="outline" onClick={() => setState('idle')}>Coba Lagi</Button>
        </div>
      )}

      {/* Success + Download */}
      {state === 'done' && result && (
        <div className="pdf-result pdf-result--success">
          <CheckCircle size={48} className="pdf-result-icon" />
          <h3>Berhasil!</h3>
          <div className="pdf-result-meta">
            <span>Ukuran asli: {formatFileSize(originalSize)}</span>
            <span>Ukuran hasil: {formatFileSize(resultSize)}</span>
          </div>
          <div className="pdf-result-actions">
            <Button onClick={handleDownload}>
              <Download size={16} style={{ marginRight: 8 }} /> Unduh Hasil
            </Button>
            <Button variant="outline" onClick={() => { setFiles([]); setState('idle'); setResult(null); }}>
              Proses File Lain
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
