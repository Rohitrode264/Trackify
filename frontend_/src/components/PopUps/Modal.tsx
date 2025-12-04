import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

// ✅ Add this style block somewhere global (e.g., in your globals.css or tailwind.css):
// @keyframes modalPop {
//   0% { transform: scale(0.9); opacity: 0; }
//   60% { transform: scale(1.05); opacity: 1; }
//   80% { transform: scale(0.98); }
//   100% { transform: scale(1); }
// }
// .animate-modalPop {
//   animation: modalPop 0.35s ease-out;
// }

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, maxWidth = '4xl' }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) setShow(true);
    else {
      const timer = setTimeout(() => setShow(false), 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  } as Record<string, string>;

  if (!isOpen && !show) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 p-4 
        bg-black/30 backdrop-blur-md transition-opacity duration-200
        ${isOpen ? 'opacity-100' : 'opacity-0'}
      `}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          bg-white rounded-xl shadow-2xl w-full ${widthClasses[maxWidth]} 
          max-h-[90vh] overflow-hidden transform transition-all
          ${isOpen ? 'animate-modalPop' : 'scale-95 opacity-0'}
        `}
      >
        {children}
      </div>
    </div>
  );
};

interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose: () => void;
  gradient?: boolean;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ title, subtitle, icon, onClose, gradient }) => {
  return (
    <div
      className={`flex items-center justify-between px-6 py-4 border-b border-gray-200 ${
        gradient ? 'bg-gradient-to-r from-blue-50 to-white' : 'bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon && <div className="p-2 bg-blue-100 rounded-lg">{icon}</div>}
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        type="button"
      >
        <X className="w-5 h-5 text-gray-500" />
      </button>
    </div>
  );
};

interface ModalFooterProps {
  children: React.ReactNode;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ children }) => {
  return (
    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
      {children}
    </div>
  );
};
