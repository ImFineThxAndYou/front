
'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../lib/stores/auth';
import { useUIStore } from '../../../lib/stores/ui';
import TopBar from './TopBar';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuthStore();
  const { theme, setTheme } = useUIStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 테마 변경 시 HTML data-theme 속성 업데이트
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // 사용자가 로그인하지 않은 경우 처리
  if (!user) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center theme-transition"
        style={{
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)'
        }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">로그인이 필요합니다</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            이 페이지에 접근하려면 로그인이 필요합니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-screen flex flex-col theme-transition"
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}
    >
      {/* TopBar */}
      <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
