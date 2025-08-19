'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setAccessToken, user } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔄 OAuth 콜백: 처리 시작');
        
        // URL 파라미터에서 OAuth 정보 추출
        const oauthSuccess = searchParams.get('oauth_success');
        const provider = searchParams.get('provider');
        const profileCompleted = searchParams.get('profile_completed');

        console.log('📋 OAuth 콜백: URL 파라미터', { oauthSuccess, provider, profileCompleted });

        if (oauthSuccess === 'true') {
          // OAuth 로그인 성공
          console.log('✅ OAuth 콜백: OAuth 로그인 성공:', { provider, profileCompleted });

          // OAuth2 토큰 처리 - 리프래싱으로 Access Token 획득
          try {
            console.log('🔄 OAuth 콜백: OAuth2 토큰 처리 시작');
            
            // 1. 먼저 리프래싱으로 Access Token 획득
            const { authService } = await import('@/lib/services/auth');
            const refreshResult = await authService.refreshToken();
            
            // 2. Access Token 설정
            if (refreshResult.accessToken) {
              authService.setAccessToken(refreshResult.accessToken);
              setAccessToken(refreshResult.accessToken);
              console.log('✅ Access Token 설정 완료');
            }
            
            // 3. 프로필 정보 조회
            const profile = await authService.getMyProfile();
            
            // 사용자 정보 설정
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
              localStorage.setItem('currentUser', JSON.stringify(userData));
              
              console.log('✅ OAuth 콜백: 사용자 정보 설정 완료', userData);
            }
            
            console.log('✅ OAuth 콜백: OAuth2 처리 완료');
          } catch (tokenError) {
            console.error('❌ OAuth 콜백: OAuth2 처리 중 오류:', tokenError);
            setError('인증 처리 중 오류가 발생했습니다.');
            setTimeout(() => { router.push('/'); }, 3000);
            return;
          }

          // 프로필 완성 여부에 따라 리다이렉트
          if (profileCompleted === 'false') {
            // 프로필 미완성 - 유저네임 설정 페이지로
            console.log('🔄 OAuth 콜백: 유저네임 설정 페이지로 리다이렉트');
            router.push('/signup/membername');
          } else {
            // 프로필 완성 - 채팅 페이지로
            console.log('🔄 OAuth 콜백: 프로필 완성, 채팅 페이지로 리다이렉트');
            router.push('/chat');
          }
        } else {
          // OAuth 로그인 실패
          console.error('❌ OAuth 콜백: OAuth 로그인 실패');
          setError('OAuth 로그인에 실패했습니다.');
          setTimeout(() => {
            router.push('/');
          }, 3000);
        }
      } catch (error) {
        console.error('❌ OAuth 콜백: 처리 중 오류:', error);
        setError('인증 처리 중 오류가 발생했습니다.');
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    handleCallback();
  }, [router, searchParams, setUser, setAccessToken]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-red-200">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">인증 실패</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">잠시 후 메인 페이지로 이동합니다...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-blue-200">
          <div className="animate-spin rounded-full h-16 h-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">인증 처리 중</h1>
          <p className="text-gray-600">잠시만 기다려주세요...</p>
        </div>
      </div>
    );
  }

  return null;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-blue-200">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">인증 처리 중</h1>
          <p className="text-gray-600">잠시만 기다려주세요...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
