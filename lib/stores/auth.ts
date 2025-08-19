
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
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

// 안전한 localStorage 접근 함수
const getLocalStorageItem = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('localStorage 접근 오류:', error);
    return null;
  }
};

const setLocalStorageItem = (key: string, value: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error('localStorage 설정 오류:', error);
  }
};

const removeLocalStorageItem = (key: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('localStorage 삭제 오류:', error);
  }
};

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
          const accessToken = getLocalStorageItem('accessToken');
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

      logout: async () => {
        console.log('🚪 useAuthStore: 로그아웃 시작');
        
        try {
          // 백엔드에 로그아웃 요청
          await authService.logout();
          console.log('✅ useAuthStore: 백엔드 로그아웃 성공');
        } catch (error) {
          console.error('❌ useAuthStore: 백엔드 로그아웃 실패:', error);
        } finally {
          // 로컬 상태 정리
          set({ 
            user: null, 
            accessToken: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
          console.log('✅ useAuthStore: 로컬 상태 정리 완료');
        }
      },

      setUser: (user: User) => {
        console.log('👤 useAuthStore: 사용자 설정', user);
        set({ user });
      },

      setAccessToken: (token: string) => {
        console.log('🔑 useAuthStore: 토큰 설정', token.substring(0, 20) + '...');
        set({ accessToken: token, isAuthenticated: true });
      },

      updateProfile: async (data: Partial<User>) => {
        console.log('📝 useAuthStore: 프로필 업데이트 시작', data);
        
        try {
          const response = await authService.updateProfile(data);
          console.log('✅ useAuthStore: 프로필 업데이트 성공', response);
          
          // 현재 사용자 정보와 병합
          const currentUser = get().user;
          if (currentUser) {
            const updatedUser = { ...currentUser, ...data };
            set({ user: updatedUser });
            console.log('✅ useAuthStore: 사용자 정보 업데이트 완료', updatedUser);
          }
        } catch (error) {
          console.error('❌ useAuthStore: 프로필 업데이트 실패:', error);
          throw error;
        }
      },

      checkAuth: async () => {
        console.log('🔍 useAuthStore: 인증 상태 확인 시작');
        
        // 이미 인증된 상태라면 중복 확인 방지
        const currentState = get();
        if (currentState.isAuthenticated && currentState.user && currentState.accessToken) {
          console.log('✅ useAuthStore: 이미 인증된 상태, 중복 확인 방지');
          return true;
        }
        
        try {
          // 로컬 스토리지에서 토큰 확인
          const accessToken = getLocalStorageItem('accessToken');
          if (!accessToken) {
            console.log('❌ useAuthStore: 토큰이 없음');
            set({ isAuthenticated: false, user: null, accessToken: null });
            return false;
          }

          // 토큰이 있으면 프로필 조회로 유효성 확인
          const profile = await authService.getMyProfile();
          if (profile) {
            const user: User = {
              membername: profile.membername,
              email: profile.email,
              nickname: profile.nickname,
              avatarUrl: profile.avatarUrl,
              bio: profile.bio,
              interests: profile.interests,
              isProfileComplete: profile.completed,
              language: profile.language,
              timezone: profile.timezone,
              birthDate: profile.birthDate,
              age: profile.age,
              country: profile.country,
              region: profile.region
            };
            
            set({ 
              user, 
              accessToken, 
              isAuthenticated: true 
            });
            
            console.log('✅ useAuthStore: 인증 상태 확인 성공', user);
            return true;
          }
        } catch (error) {
          console.error('❌ useAuthStore: 인증 상태 확인 실패:', error);
          // 인증 실패 시 상태 정리
          set({ 
            user: null, 
            accessToken: null, 
            isAuthenticated: false 
          });
          
          // 로컬 스토리지도 정리
          removeLocalStorageItem('accessToken');
          removeLocalStorageItem('currentUser');
        }
        
        return false;
      }
    }),
    {
      name: 'auth-storage',
      // 서버 사이드에서 안전하게 처리 (새로운 storage 옵션 사용)
      storage: {
        getItem: (name: string) => {
          if (typeof window === 'undefined') return null;
          try {
            return localStorage.getItem(name);
          } catch (error) {
            console.error('Zustand storage getItem 오류:', error);
            return null;
          }
        },
        setItem: (name: string, value: string) => {
          if (typeof window === 'undefined') return;
          try {
            localStorage.setItem(name, value);
          } catch (error) {
            console.error('Zustand storage setItem 오류:', error);
          }
        },
        removeItem: (name: string) => {
          if (typeof window === 'undefined') return;
          try {
            localStorage.removeItem(name);
          } catch (error) {
            console.error('Zustand storage removeItem 오류:', error);
          }
        }
      }
    }
  )
);
