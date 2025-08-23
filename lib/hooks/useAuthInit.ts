import { useEffect } from 'react';
import { useAuthStore } from '../stores/auth';
import { authService } from '../services/auth';

export const useAuthInit = () => {
  const { checkAuth, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // 페이지 로드 시 인증 상태 확인
    const initAuth = async () => {
      console.log('🚀 인증 초기화 시작');
      
      // 저장된 토큰이 있으면 복원
      const savedToken = authService.getAccessToken();
      if (savedToken) {
        console.log('🔑 저장된 토큰 발견, 복원 중...');
        authService.setAccessToken(savedToken);
      }

      // 인증 상태 확인
      await checkAuth();
      console.log('✅ 인증 초기화 완료');
    };

    // 이미 인증된 상태가 아니라면 초기화 실행
    if (!isAuthenticated && !isLoading) {
      initAuth();
    }
  }, [checkAuth, isAuthenticated, isLoading]);

  return { isAuthenticated, isLoading };
};

