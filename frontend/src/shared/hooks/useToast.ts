import { useToastContext } from '../components/ui/Toast';

export const useToast = () => {
  try {
    const context = useToastContext();
    if (context) {
      return {
        toast: context.addToast,
        info: (message: string, title?: string) => context.addToast({ type: 'info', message, title }),
        success: (message: string, title?: string) => context.addToast({ type: 'success', message, title }),
        warning: (message: string, title?: string) => context.addToast({ type: 'warning', message, title }),
        error: (message: string, title?: string) => context.addToast({ type: 'error', message, title }),
        removeToast: context.removeToast,
      };
    }
  } catch (e) {
    // Fallback if ToastProvider is omitted
  }

  return {
    toast: (t: any) => console.log('[Toast Notice]:', t),
    info: (message: string, title?: string) => console.info(`[Toast Info] ${title || ''}: ${message}`),
    success: (message: string, title?: string) => console.log(`[Toast Success] ${title || ''}: ${message}`),
    warning: (message: string, title?: string) => console.warn(`[Toast Warning] ${title || ''}: ${message}`),
    error: (message: string, title?: string) => console.error(`[Toast Error] ${title || ''}: ${message}`),
    removeToast: () => {},
  };
};

export default useToast;
