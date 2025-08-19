'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { getCookie, getAllCookies } from '@/lib/utils/cookies';

function LoginSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setAccessToken } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleLoginSuccess = async () => {
      try {
        console.log('🎉 로그인 성공 페이지: 처리 시작');
        
        // URL 파라미터에서 OAuth 정보 추출
        const oauthSuccess = searchParams.get('oauth_success');
        const provider = searchParams.get('provider');
        const profileCompleted = searchParams.get('profile_completed');
        const accessToken = searchParams.get('access_token'); // URL 파라미터로 전송된 토큰

        console.log('📋 로그인 성공: URL 파라미터', { oauthSuccess, provider, profileCompleted, hasAccessToken: !!accessToken });

        if (oauthSuccess === 'true') {
          // OAuth 로그인 성공
          console.log('✅ 로그인 성공: OAuth 로그인 성공:', { provider, profileCompleted });

          // 디버깅: 모든 쿠키 확인
          const allCookies = getAllCookies();
          console.log('🍪 모든 쿠키:', allCookies);
          
          // Refresh Token 확인
          const refreshToken = getCookie('Refresh');
          console.log('🍪 Refresh Token 존재:', !!refreshToken);
          if (refreshToken) {
            console.log('🍪 Refresh Token (일부):', refreshToken.substring(0, 20) + '...');
          }

          // OAuth2 토큰 처리 - 최적화된 버전
          try {
            console.log('🔄 로그인 성공: OAuth2 토큰 처리 시작');
            
            // 1. 빠른 리프레싱 요청 (membername 포함)
            const response = await fetch('http://localhost:8080/api/auth/refresh?membername=' + encodeURIComponent(provider || 'google'), {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
            });
            
            if (!response.ok) {
              throw new Error(`리프레싱 실패: ${response.status}`);
            }
            
            // 2. Access Token 저장
            const accessToken = response.headers.get('Authorization');
            if (accessToken && accessToken.startsWith('Bearer ')) {
              const token = accessToken.substring(7);
              localStorage.setItem('accessToken', token);
              setAccessToken(token);
              console.log('✅ Access Token 저장됨');
            } else {
              throw new Error('Access Token을 받지 못했습니다');
            }
            
            // 3. 기본 사용자 정보 설정 (프로필 조회 생략)
            const userData = {
              membername: provider || 'google',
              email: '',
              nickname: '',
              avatarUrl: '',
              bio: '',
              interests: [],
              isProfileComplete: profileCompleted === 'true',
              language: 'ko',
              timezone: 'Asia/Seoul',
              birthDate: '',
              age: 0,
              country: '',
              region: '',
              provider: provider || 'google'
            };
            
            setUser(userData);
            localStorage.setItem('currentUser', JSON.stringify(userData));
            
            console.log('✅ 로그인 성공: 빠른 처리 완료');
          } catch (tokenError) {
            console.error('❌ 로그인 성공: OAuth2 처리 중 오류:', tokenError);
            setError('인증 처리 중 오류가 발생했습니다.');
            setTimeout(() => { router.push('/'); }, 3000);
            return;
          }

          // 프로필 완성 여부에 따라 리다이렉트
          if (profileCompleted === 'true') {
            // 프로필 완성 - 채팅 페이지로
            console.log('🔄 로그인 성공: 프로필 완성, 채팅 페이지로 리다이렉트');
            
            // 즉시 리다이렉트
            router.push('/chat');
          } else {
            // 프로필 미완성 - 유저네임 설정 페이지로
            console.log('🔄 로그인 성공: 프로필 미완성, 유저네임 설정 페이지로 리다이렉트');
            router.push('/signup/membername');
          }
        } else {
          // OAuth 로그인 실패
          console.error('❌ 로그인 성공: OAuth 로그인 실패');
          setError('OAuth 로그인에 실패했습니다.');
          setTimeout(() => {
            router.push('/');
          }, 3000);
        }
      } catch (error) {
        console.error('❌ 로그인 성공: 처리 중 오류:', error);
        setError('인증 처리 중 오류가 발생했습니다.');
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    handleLoginSuccess();
  }, [router, searchParams, setUser, setAccessToken]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-red-200">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">로그인 실패</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">잠시 후 메인 페이지로 이동합니다...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-green-200">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">로그인 성공!</h1>
          <p className="text-gray-600">잠시만 기다려주세요...</p>
        </div>
      </div>
    );
  }

  return null;
}

export default function LoginSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-green-200">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">로그인 성공!</h1>
          <p className="text-gray-600">잠시만 기다려주세요...</p>
        </div>
      </div>
    }>
      <LoginSuccessContent />
    </Suspense>
  );
}
