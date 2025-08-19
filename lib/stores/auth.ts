
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/auth';

interface User {
  membername: string;  // PK 역할
  email?: string;
  nickname?: string;
  avatarUrl?: string;
  bio?: string;
  interests?: string[];
  isProfileComplete: boolean;
  language?: string;
  timezone?: string;
  birthDate?: string;
  age?: number;
  country?: string;
  region?: string;
  provider?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

// 목업 사용자 제거 - 실제 API 응답 사용

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          const response = await authService.login({ email, password });
          console.log('✅ useAuthStore: 로그인 응답', response);
          
          // 응답에서 사용자 정보 추출 (백엔드 응답 구조에 따라 조정 필요)
          const user: User = response.user || {
            membername: 'temp-membername',
            email: email,
            isProfileComplete: false
          };
          
          // 로컬 스토리지에서 토큰 가져오기
          const accessToken = localStorage.getItem('accessToken');
          console.log('🔑 useAuthStore: 저장된 토큰:', accessToken);
          
          set({ 
            user, 
            accessToken,
            isAuthenticated: true, 
            isLoading: false 
          });
          
          console.log('✅ useAuthStore: 로그인 상태 설정 완료', { user, accessToken });
        } catch (error) {
          console.error('❌ useAuthStore: 로그인 실패:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      googleLogin: async () => {
        set({ isLoading: true });
        
        try {
          // Google OAuth는 리다이렉트 방식이므로 여기서는 로딩만 처리
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        // 로컬 스토리지와 axios 헤더 정리
        localStorage.removeItem('accessToken');
        localStorage.removeItem('currentUser');
        console.log('🗑️ useAuthStore: localStorage에서 currentUser 제거');
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      setAccessToken: (token: string) => {
        set({ accessToken: token, isAuthenticated: true });
      },

      updateProfile: async (data: Partial<User>) => {
        const { user } = get();
        if (user) {
          const updatedUser = { ...user, ...data };
          set({ user: updatedUser });
        }
      },

      checkAuth: async () => {
        try {
          const token = localStorage.getItem('accessToken');
          console.log('🔍 useAuthStore: checkAuth 시작, 토큰 존재:', !!token);
          
          if (!token) {
            console.log('❌ useAuthStore: 토큰 없음, 인증 실패');
            set({ isAuthenticated: false, user: null });
            return false;
          }

          // axios 헤더에 토큰 설정
          const { authService } = await import('../services/auth');
          authService.setAccessToken(token);
          
          // 토큰 유효성 검증 (백엔드 API 호출)
          const profile = await authService.getMyProfile();
          console.log('✅ useAuthStore: 토큰 유효성 검증 성공', profile);
          
          // 사용자 정보 설정
          if (profile) {
            console.log('📝 useAuthStore: 프로필 데이터 확인:', profile);
            
            const userData: User = {
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
              provider: 'google' // OAuth에서 온 경우
            };
            
            console.log('📝 useAuthStore: 생성할 사용자 데이터:', userData);
            
            set({ 
              user: userData, 
              accessToken: token,
              isAuthenticated: true 
            });
            
            // localStorage에 currentUser 저장
            localStorage.setItem('currentUser', JSON.stringify(userData));
            console.log('💾 useAuthStore: localStorage에 currentUser 저장:', userData);
            
            console.log('✅ useAuthStore: 사용자 정보 설정 완료', userData);
            console.log('✅ useAuthStore: 상태 업데이트 완료 - user:', !!userData, 'isAuthenticated: true');
          } else {
            console.warn('⚠️ useAuthStore: profile.data가 없음');
          }
          
          return true;
        } catch (error) {
          console.error('❌ useAuthStore: 토큰 유효성 검증 실패:', error);
          // 토큰이 유효하지 않으면 로그아웃
          set({ isAuthenticated: false, user: null, accessToken: null });
          localStorage.removeItem('accessToken');
          localStorage.removeItem('currentUser');
          console.log('🗑️ useAuthStore: 토큰 검증 실패로 currentUser 제거');
          return false;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
);
