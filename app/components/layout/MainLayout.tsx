'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../../lib/stores/auth';
import { useUIStore } from '../../../lib/stores/ui';
import { useTranslation } from '../../../lib/hooks/useTranslation';
import { sseManager } from '../../../lib/services/sseManager';
import { useChatStore } from '../../../lib/stores/chat';
import DesktopNav from './DesktopNav';
import MobileNav from './MobileNav';
import TopBar from './TopBar';
import { ToastContainer } from '../ui/ToastContainer';
import { useRouter } from 'next/navigation';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [sseStatus, setSseStatus] = useState({
    isConnected: false,
    isConnecting: false,
    connectionError: null as string | null
  });

  // 라이트 모드 고정 설정
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.className = document.documentElement.className.replace(/theme-\w+/, '') + ' theme-light';
  }, []);

  // 인증 상태 확인 - 앱 시작 시 한 번만 실행
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        console.log('🔍 MainLayout: 인증 상태 확인 시작');
        // 인증 상태 확인은 useAuthStore에서 처리
        console.log('🔍 MainLayout: 인증 상태 확인 결과:', user !== null);
        
        // 인증이 성공하고 사용자 정보가 있으면 SSE 연결 (알림용)
        if (user?.membername) {
          console.log('🔗 MainLayout: SSE 연결 시도:', user.membername);
          setSseStatus(prev => ({ ...prev, isConnecting: true }));
          try {
            await sseManager.connect();
            console.log('✅ MainLayout: SSE 연결 성공');
            setSseStatus({
              isConnected: true,
              isConnecting: false,
              connectionError: null
            });
          } catch (error) {
            console.error('❌ MainLayout: SSE 연결 실패:', error);
            setSseStatus({
              isConnected: false,
              isConnecting: false,
              connectionError: error instanceof Error ? error.message : '알 수 없는 오류'
            });
          }
        }
      } catch (error) {
        console.error('❌ MainLayout: 인증 확인 실패:', error);
      } finally {
        // 인증 상태 확인 로직은 useAuthStore에서 처리
      }
    };

    verifyAuth();
  }, [user]); // user 변경시에만 인증 상태 확인

  // 페이지 이동 시 WebSocket 연결 관리
  useEffect(() => {
    if (user?.membername && router.pathname === '/chat') {
      console.log('🔗 MainLayout: 채팅 페이지 진입');
      // WebSocket 연결은 ChatRoom에서 관리하므로 여기서는 연결하지 않음
    } else {
      console.log('ℹ️ MainLayout: 채팅 페이지가 아님, WebSocket 연결 해제');
      // 채팅 페이지가 아니면 WebSocket 연결 해제
      const { disconnectWebSocket } = useChatStore.getState();
      disconnectWebSocket();
    }
  }, [user?.membername, router.pathname]);

  // 컴포넌트 언마운트 시 연결 해제
  useEffect(() => {
    return () => {
      console.log('🔌 MainLayout 언마운트, 연결 해제');
      // SSE 연결 해제
      sseManager.disconnect();
      // WebSocket 연결 해제
      const { disconnectWebSocket } = useChatStore.getState();
      disconnectWebSocket();
    };
  }, []); // 언마운트 시 모든 연결 해제

  // 메인 레이아웃 렌더링
  const renderMainLayout = () => (
    <div 
      className="h-screen flex"
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}
    >
      {/* Desktop Navigation - 전체 높이 */}
      <DesktopNav onExpandChange={setIsNavExpanded} />
      
      {/* Main Content Area */}
      <div 
        className="flex-1 flex flex-col min-h-0"
        style={{
          width: '100%', // 전체 너비 사용
          marginLeft: isNavExpanded ? '288px' : '80px', // DesktopNav 너비만큼 왼쪽 여백
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Top Bar - 오른쪽 영역에만 */}
        <TopBar 
          onMenuClick={() => setSidebarOpen(true)} 
          sseStatus={sseStatus}
          unreadCount={0} // TODO: 실제 unread count 가져오기
        />
        
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
      <MobileNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );

  // 로그인 필요 화면 렌더링
  const renderLoginRequired = () => (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}
    >
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">로그인이 필요합니다</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          로그인이 필요한 페이지에 접근하려고 했습니다.
        </p>
        <button 
          onClick={() => router.push('/')}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          로그인 페이지로 이동
        </button>
      </div>
    </div>
  );

  // 로그인 페이지로 이동
  const handleGoToLogin = () => {
    router.push('/');
  };

  // 로딩 화면 렌더링
  const renderLoadingScreen = () => (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p style={{ color: 'var(--text-secondary)' }}>인증 상태를 확인하는 중입니다...</p>
      </div>
    </div>
  );

  // 조건부 렌더링 (Hook 호출 이후)
  if (!user) {
    return renderLoadingScreen();
  }

  if (!user?.membername) {
    return renderLoginRequired();
  }

  return renderMainLayout();
}
