'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../lib/stores/auth';
import { authService } from '../../../lib/services/auth';
import { useTranslation } from '../../../lib/hooks/useTranslation';

export default function MembernamePage() {
  const [membername, setMembername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { t } = useTranslation('auth');

  // 이미 프로필이 완성된 사용자는 홈으로 리다이렉트
  useEffect(() => {
    if (user?.isProfileComplete) {
      console.log('🔄 MembernamePage: 프로필 완성된 사용자 - 홈으로 리다이렉트');
      router.push('/chat');
    }
  }, [user, router]);

  // 유저네임 유효성 검사
  const validateMembername = (value: string) => {
    if (value.length < 3) return t('membername.validation.tooShort');
    if (value.length > 20) return t('membername.validation.tooLong');
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return t('membername.validation.invalidChars');
    return '';
  };

  const handleMembernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMembername(value);
    setError(validateMembername(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 MembernamePage: 유저네임 설정 제출 시작');
    console.log('📝 MembernamePage: 입력된 유저네임:', membername);
    
    const validationError = validateMembername(membername);
    if (validationError) {
      console.log('❌ MembernamePage: 유저네임 유효성 검사 실패:', validationError);
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      console.log('📤 MembernamePage: 유저네임 설정 API 요청:', { membername });
      
      await authService.setMembername({ membername });
      console.log('✅ MembernamePage: 유저네임 설정 성공');
      
      // 사용자 정보 업데이트
      if (user) {
        setUser({ ...user, membername });
      }
      
      console.log('🔄 MembernamePage: 프로필 페이지로 이동');
      router.push('/signup/profile');
    } catch (error: any) {
      console.error('❌ MembernamePage: 유저네임 설정 실패:', error);
      
      if (error.message?.includes('409')) {
        setError(t('membername.error.alreadyExists'));
      } else {
        setError(t('membername.error.general'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <i className="ri-user-line text-blue-600 text-xl"></i>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('membername.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('membername.subtitle')}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="membername" className="block text-sm font-medium text-gray-700">
              {t('membername.label')}
            </label>
            <div className="mt-1">
              <input
                id="membername"
                name="membername"
                type="text"
                required
                value={membername}
                onChange={handleMembernameChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t('membername.placeholder')}
                disabled={loading}
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              {t('membername.help')}
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !!error || !membername}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                t('membername.next')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
