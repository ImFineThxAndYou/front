
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/stores/auth';
import { useTranslation } from '../../lib/hooks/useTranslation';

export default function Landing() {
  const { t } = useTranslation('landing');
  const router = useRouter();
  const { login } = useAuthStore();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailForm, setEmailForm] = useState({ email: '', password: '' });

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      console.log('🔗 Landing: 구글 OAuth 로그인 시작');
      
      // 실제 구글 OAuth 로그인 리다이렉트
      const redirectUri = encodeURIComponent(`${window.location.origin}/signup/callback`);
      const googleAuthUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/oauth2/authorization/google?redirect_uri=${redirectUri}`;
      
      console.log('🔗 Landing: 구글 OAuth 리다이렉트 URL:', googleAuthUrl);
      console.log('🔗 Landing: 리다이렉트 시작...');
      
      // 리다이렉트 실행
      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error('❌ Landing: 구글 로그인 실패:', error);
      setIsGoogleLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm.email || !emailForm.password) return;
    
    setIsEmailLoading(true);
    try {
      console.log('🔐 Landing: 이메일 로그인 시작', emailForm);
      
      // useAuthStore의 login 함수 사용
      await login(emailForm.email, emailForm.password);
      
      console.log('✅ Landing: 이메일 로그인 성공');
      
      // 성공 시 채팅 페이지로 이동
      router.push('/chat');
    } catch (error) {
      console.error('❌ Landing: 이메일 로그인 실패:', error);
      // 에러 처리는 useAuthStore에서 처리됨
    } finally {
      setIsEmailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center items-center mb-6">
              <h1 className="text-5xl font-['Pacifico'] text-indigo-600 mr-3">
                howareyou
              </h1>
              <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
                <i className="ri-message-3-line text-white text-xl"></i>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('subtitle')}
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {t('description')}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-chat-3-line text-indigo-600 text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                {t('features.chat.title')}
              </h3>
              <p className="text-gray-600">
                {t('features.chat.description')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-book-3-line text-green-600 text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                {t('features.wordbook.title')}
              </h3>
              <p className="text-gray-600">
                {t('features.wordbook.description')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-gamepad-line text-purple-600 text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                {t('features.quiz.title')}
              </h3>
              <p className="text-gray-600">
                {t('features.quiz.description')}
              </p>
            </div>
          </div>

          {/* Login Section */}
          <div className="text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md mx-auto">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">
                {t('login.title')}
              </h3>
              <div className="space-y-4">
                <button
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className="w-full bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center whitespace-nowrap cursor-pointer disabled:opacity-50"
                >
                  <i className="ri-google-fill text-xl mr-3"></i>
                  {isGoogleLoading ? t('login.loading') : t('login.googleButton')}
                </button>
                
                <div className="flex items-center my-4">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <span className="px-4 text-gray-500 text-sm">
                    {t('login.or')}
                  </span>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>
                
                <button
                  onClick={() => setShowEmailForm(!showEmailForm)}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-mail-line text-xl mr-3"></i>
                  {t('login.emailButton')}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                {t('login.accountInfo')}
              </p>
            </div>
          </div>

          {/* Email Login Form Popup */}
          {showEmailForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {t('login.emailLoginTitle')}
                  </h3>
                  <button
                    onClick={() => setShowEmailForm(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <i className="ri-close-line text-2xl"></i>
                  </button>
                </div>
                
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('login.emailLabel')}
                    </label>
                    <input
                      type="email"
                      value={emailForm.email}
                      onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900"
                      style={{
                        color: '#111827',
                        backgroundColor: '#ffffff',
                        borderColor: '#d1d5db'
                      }}
                      placeholder={t('login.emailPlaceholder')}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('login.passwordLabel')}
                    </label>
                    <input
                      type="password"
                      value={emailForm.password}
                      onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900"
                      style={{
                        color: '#111827',
                        backgroundColor: '#ffffff',
                        borderColor: '#d1d5db'
                      }}
                      placeholder={t('login.passwordPlaceholder')}
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isEmailLoading}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
                  >
                    {isEmailLoading ? t('login.loading') : t('login.loginButton')}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
