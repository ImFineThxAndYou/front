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

          // OAuth2 토큰 처리
          try {
            console.log('🔄 로그인 성공: OAuth2 토큰 처리 시작');
            
            // 1. fetch로 리프레싱 요청 (쿠키 자동 포함, 헤더에서 토큰 받기)
            const response = await fetch('http://localhost:8080/api/auth/refresh', {
              method: 'POST',
              credentials: 'include', // 쿠키 포함
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            if (!response.ok) {
              throw new Error(`리프레싱 실패: ${response.status}`);
            }
            
            // 2. 응답 헤더에서 Access Token 추출
            const accessToken = response.headers.get('Authorization');
            if (accessToken && accessToken.startsWith('Bearer ')) {
              const token = accessToken.substring(7);
              localStorage.setItem('accessToken', token);
              console.log('✅ Access Token 저장됨');
            } else {
              throw new Error('Access Token을 받지 못했습니다');
            }
            
            // 3. 사용자 정보 조회
            try {
              const { authService } = await import('@/lib/services/auth');
              const profile = await authService.getMyProfile();
                
              if (profile) {
                const userData = {
                  membername: profile.membername,
                  email: profile.email,
                  nickname: profile.nickname,
                  avatarUrl: profile.avatarUrl,
                  bio: profile.bio,
                  interests: profile.interests ? (Array.isArray(profile.interests) ? profile.interests : []) : [],
                  isProfileComplete: profile.completed || false,
                  language: profile.language,
                  timezone: profile.timezone,
                  birthDate: profile.birthDate,
                  age: profile.age,
                  country: profile.country,
                  region: profile.region,
                  provider: provider || 'google'
                };
                
                setUser(userData);
                
                // 로컬 스토리지에서 토큰 가져와서 설정
                const token = localStorage.getItem('accessToken');
                if (token) {
                  setAccessToken(token);
                }
                
                console.log('✅ 로그인 성공: 사용자 정보 설정 완료', userData);
              }
            } catch (profileError) {
              console.warn('⚠️ 로그인 성공: 프로필 조회 실패 (계속 진행)', profileError);
            }
            
            console.log('✅ 로그인 성공: OAuth2 처리 완료');
          } catch (tokenError) {
            console.error('❌ 로그인 성공: OAuth2 처리 중 오류:', tokenError);
            setError('인증 처리 중 오류가 발생했습니다.');
            setTimeout(() => {
              router.push('/');
            }, 3000);
            return;
          }

          // 프로필 완성 여부에 따라 리다이렉트
          if (profileCompleted === 'true') {
            // 프로필 완성 - 채팅 페이지로
            console.log('🔄 로그인 성공: 프로필 완성, 채팅 페이지로 리다이렉트');
            
            // 상태 업데이트가 완료될 때까지 잠시 대기
            setTimeout(() => {
              router.push('/chat');
            }, 100);
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
