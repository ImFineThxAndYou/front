
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
  theme: 'light' | 'dark';
  language: 'ko' | 'en';
  toasts: Toast[];
  modals: Modal[];
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'ko' | 'en') => void;
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
  showModal: (modal: Omit<Modal, 'id'>) => void;
  hideModal: (id: string) => void;
}

// CSS 변수와 body 스타일을 동시에 적용하는 함수
const applyTheme = (theme: 'light' | 'dark') => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  
  // 테마 속성 설정
  root.setAttribute('data-theme', theme);
  root.className = root.className.replace(/theme-\w+/, '') + ` theme-${theme}`;

  // 메타 테마 색상 설정 (브라우저 UI 색상)
  let metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (!metaThemeColor) {
    metaThemeColor = document.createElement('meta');
    metaThemeColor.setAttribute('name', 'theme-color');
    document.head.appendChild(metaThemeColor);
  }
  metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f172a' : '#ffffff');
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      language: 'ko',
      toasts: [],
      modals: [],

      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },

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
      }
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language
      }),
      onRehydrateStorage: () => (state) => {
        // 페이지 로드 시 저장된 테마 즉시 적용
        if (state?.theme) {
          setTimeout(() => applyTheme(state.theme), 0);
        }
      }
    }
  )
);
