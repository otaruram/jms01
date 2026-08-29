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
        flex items-center gap-3 px-4 py-3 bg-white rounded-lg shadow-lg border border-gray-100
        transition-all duration-300 ease-in-out transform
        ${isClosing ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'}
      `}
      style={{
        minWidth: '300px',
        maxWidth: '400px',
        animation: isClosing ? 'none' : 'toast-slide-in 0.3s ease-out forwards'
      }}
    >
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      <p className="flex-1 m-0 text-sm font-medium text-gray-800">
        {message}
      </p>
      <button 
        onClick={handleClose}
        className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
      >
        <X size={16} />
      </button>

      <style>{`
        @keyframes toast-slide-in {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
