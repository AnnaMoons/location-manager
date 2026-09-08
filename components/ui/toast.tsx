'use client';

import * as React from 'react';
import DsToastRaw from '@ds/components/molecules/Toast';

const DsToast = DsToastRaw as React.ComponentType<any>;

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'destructive' | 'warning';
}

export interface ToastContextType {
  toasts: Toast[];
  toast: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

/** default→info, destructive→error: the only DS Toast types that don't share a name. */
const TYPE_MAP: Record<NonNullable<Toast['variant']>, 'info' | 'success' | 'warning' | 'error'> = {
  default: 'info',
  success: 'success',
  warning: 'warning',
  destructive: 'error',
};

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-toast flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <DsToast
          key={t.id}
          type={TYPE_MAP[t.variant || 'default']}
          title={t.title}
          body={t.description}
          onClose={() => dismiss(t.id)}
        />
      ))}
    </div>
  );
}
