'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../../lib/stores/auth';
import { useUIStore } from '../../../lib/stores/ui';
import { sseManager } from '../../../lib/services/sseManager';
import { useChat } from '../../../lib/hooks/useChat';
import DesktopNav from './DesktopNav';
import MobileNav from './MobileNav';
import TopBar from './TopBar';
import ToastContainer from '../ui/ToastContainer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  // 모든 Hook을 항상 호출
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const { theme } = useUIStore();
  const { connectWebSocket, disconnectWebSocket } = useChat();
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // 테마 변경 시 HTML data-theme 속성 업데이트
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.className = document.documentElement.className.replace(/theme-\w+/, '') + ` theme-${theme}`;
  }, [theme]);

  // 인증 상태 확인 및 SSE 연결
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        console.log('🔍 MainLayout: 인증 상태 확인 시작');
        const isAuth = await checkAuth();
        console.log('🔍 MainLayout: 인증 상태 확인 결과:', isAuth);
        
        // 인증이 성공하고 사용자 정보가 있으면 SSE 연결 시도
        if (isAuth && user?.membername) {
          console.log('🔗 MainLayout: SSE 연결 시도:', user.membername);
          await sseManager.connect(user.membername);
          
          // 채팅 WebSocket 연결 시도
          console.log('🔗 MainLayout: 채팅 WebSocket 연결 시도');
          await connectWebSocket();
        }
      } catch (error) {
        console.error('❌ MainLayout: 인증 확인 실패:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    verifyAuth();
  }, [checkAuth, user?.membername]);

  // 컴포넌트 언마운트 시 연결 해제
  useEffect(() => {
    return () => {
      console.log('🔌 MainLayout 언마운트, 연결 해제');
      sseManager.disconnect();
      disconnectWebSocket();
    };
  }, [disconnectWebSocket]);

  // 네비게이션 확장 상태 추적
  const handleNavExpand = useCallback((expanded: boolean) => {
    setIsNavExpanded(expanded);
  }, []);

  // 로그인 페이지로 이동
  const handleGoToLogin = useCallback(() => {
    window.location.href = '/';
  }, []);

  // 로딩 화면 렌더링
  const renderLoadingScreen = () => (
    <div 
      className="min-h-screen flex items-center justify-center theme-transition"
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p style={{ color: 'var(--text-secondary)' }}>인증 상태를 확인하고 있습니다...</p>
      </div>
    </div>
  );

  // 로그인 필요 화면 렌더링
  const renderLoginRequired = () => (
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
        <button 
          onClick={handleGoToLogin}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          로그인 페이지로 이동
        </button>
      </div>
    </div>
  );

  // 메인 레이아웃 렌더링
  const renderMainLayout = () => (
    <div 
      className="h-screen flex theme-transition"
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}
    >
      {/* Desktop Navigation - 전체 높이 */}
      <DesktopNav onExpandChange={handleNavExpand} />
      
      {/* Main Content Area */}
      <div 
        className="flex-1 flex flex-col min-h-0"
        style={{
          marginLeft: isNavExpanded ? '0px' : '0px',
          transition: 'margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Top Bar - 오른쪽 영역에만 */}
        <TopBar />
        
        {/* Main Content */}
        <main 
          className="flex-1 overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-primary)'
          }}
        >
          {children}
        </main>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav />
      
      {/* Toast Container for notifications */}
      <ToastContainer />
    </div>
  );

  // 조건부 렌더링 (Hook 호출 이후)
  if (isCheckingAuth) {
    return renderLoadingScreen();
  }

  if (!isAuthenticated || !user) {
    return renderLoginRequired();
  }

  return renderMainLayout();
}
