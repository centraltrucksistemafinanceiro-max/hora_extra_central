import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md transform transition-all scale-100 ring-1 ring-white/10" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
             <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
             </div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
        <div className="p-6 text-slate-300 leading-relaxed">
            {children}
        </div>
        <div className="p-5 bg-slate-950/30 flex justify-end gap-3 rounded-b-2xl border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white bg-transparent hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/20 rounded-lg transition-all transform hover:-translate-y-0.5"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;