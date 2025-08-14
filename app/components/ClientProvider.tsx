
'use client';

import { useEffect } from 'react';
import { useUIStore } from '../../lib/stores/ui';
import i18n from '../../lib/i18n';

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  const { theme, language } = useUIStore();

  // 페이지 로드 시 초기 테마 설정 (플리커 방지)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // 저장된 테마 불러오기
      const savedData = localStorage.getItem('ui-storage');
      let savedTheme = 'light';
      
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          savedTheme = parsed?.state?.theme || 'light';
        } catch (error) {
          console.log('테마 로드 실패:', error);
        }
      }
      
      // 즉시 테마 적용
      const root = document.documentElement;
      root.setAttribute('data-theme', savedTheme);
      root.className = root.className.replace(/theme-\w+/, '') + ` theme-${savedTheme}`;
      
      // 메타 테마 색상 설정
      let metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.setAttribute('name', 'theme-color');
        document.head.appendChild(metaThemeColor);
      }
      metaThemeColor.setAttribute('content', savedTheme === 'dark' ? '#0f172a' : '#ffffff');
    }
  }, []);

  // 언어 변경 시 적용
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  return (
    <div 
      style={{ 
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}
    >
      {children}
    </div>
  );
}
