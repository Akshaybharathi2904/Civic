import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { clsx } from 'clsx';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  return useContext(ToastContext);
};

const ToastContainer: React.FC<{ toasts: ToastMessage[]; removeToast: (id: string) => void }> = ({
  toasts,
  removeToast,
}) => {
  if (toasts.length === 0) return null;

  const icons = {
    info: <Info className="text-cyan-400 shrink-0" size={18} />,
    success: <CheckCircle className="text-emerald-400 shrink-0" size={18} />,
    warning: <AlertTriangle className="text-amber-400 shrink-0" size={18} />,
    error: <AlertCircle className="text-rose-400 shrink-0" size={18} />,
  };

  const borders = {
    info: 'border-cyan-500/40 bg-slate-900/95',
    success: 'border-emerald-500/40 bg-slate-900/95',
    warning: 'border-amber-500/40 bg-slate-900/95',
    error: 'border-rose-500/40 bg-slate-900/95',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 transform translate-y-0',
            borders[toast.type]
          )}
        >
          {icons[toast.type]}
          <div className="flex-1">
            {toast.title && <h4 className="text-sm font-semibold text-slate-100">{toast.title}</h4>}
            <p className="text-xs text-slate-300 mt-0.5">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-100 p-0.5"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastProvider;
