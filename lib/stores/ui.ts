
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface Modal {
  id: string;
  component: React.ComponentType<any>;
  props?: any;
}

interface UIState {
  language: 'ko' | 'en';
  toasts: Toast[];
  modals: Modal[];
  setLanguage: (language: 'ko' | 'en') => void;
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
  showModal: (modal: Omit<Modal, 'id'>) => void;
  hideModal: (id: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      language: 'ko',
      toasts: [],
      modals: [],

      setLanguage: (language) => {
        console.log('UI Store - Setting language to:', language);
        set({ language });
      },

      showToast: (toast) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = { ...toast, id };

        set((state) => ({
          toasts: [...state.toasts, newToast]
        }));

        if (toast.duration !== 0) {
          setTimeout(() => {
            get().hideToast(id);
          }, toast.duration || 4000);
        }
      },

      hideToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter(toast => toast.id !== id)
        }));
      },

      showModal: (modal) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newModal = { ...modal, id };

        set((state) => ({
          modals: [...state.modals, newModal]
        }));
      },

      hideModal: (id) => {
        set((state) => ({
          modals: state.modals.filter(modal => modal.id !== id)
        }));
      },
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        language: state.language,
      }),
    }
  )
);
