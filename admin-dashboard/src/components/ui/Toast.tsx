import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type = 'info', onClose }: ToastProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300); // Wait for animation
  };

  useEffect(() => {
    const timer = setTimeout(handleClose, 3700); // 4000ms total lifespan minus animation
    return () => clearTimeout(timer);
  }, []);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="text-emerald-500" size={20} />;
      case 'error':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Info className="text-blue-500" size={20} />;
    }
  };

  return (
    <div 
      className={`
        relative overflow-hidden flex items-center gap-3 px-5 py-4 bg-white rounded-xl shadow-2xl border 
        ${type === 'success' ? 'border-emerald-100 shadow-emerald-500/10' : type === 'error' ? 'border-red-100 shadow-red-500/10' : 'border-blue-100 shadow-blue-500/10'}
        transition-all duration-300 ease-out transform backdrop-blur-sm bg-white/95
        ${isClosing ? 'opacity-0 scale-95 translate-x-8' : 'opacity-100 scale-100 translate-x-0'}
      `}
      style={{
        minWidth: '320px',
        maxWidth: '420px',
        animation: isClosing ? 'none' : 'toast-slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}
    >
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      <p className="flex-1 m-0 text-[15px] leading-tight font-medium text-slate-800">
        {message}
      </p>
      <button 
        onClick={handleClose}
        className="flex-shrink-0 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100/80 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
      >
        <X size={16} />
      </button>

      {/* Progress Bar */}
      <div 
        className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r"
        style={{
          width: '100%',
          backgroundImage: type === 'success' ? 'linear-gradient(to right, #10b981, #34d399)' : type === 'error' ? 'linear-gradient(to right, #ef4444, #f87171)' : 'linear-gradient(to right, #3b82f6, #60a5fa)',
          animation: 'toast-progress 3.7s linear forwards'
        }}
      />

      <style>{`
        @keyframes toast-slide-in {
          0% {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes toast-progress {
          0% { width: 100%; }
          100% { width: 0%; }
        }
      `}</style>
    </div>
  );
}
