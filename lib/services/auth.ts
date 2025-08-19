import axios from 'axios';
import { getCookie, getAllCookies } from '../utils/cookies';

// 환경별 API 베이스 URL 설정
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
};

const API_BASE = getApiBaseUrl();

// 인증 관련 타입 정의
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    membername: string;
    email: string;
    nickname?: string;
    avatarUrl?: string;
    bio?: string;
    interests?: string[];
    completed: boolean;
    language?: string;
    timezone?: string;
    birthDate?: string;
    age?: number;
    country?: string;
    region?: string;
  };
}

export interface ProfileResponse {
  membername: string;
  email: string;
  nickname?: string;
  avatarUrl?: string;
  bio?: string;
  interests?: string[];
  completed: boolean;
  language?: string;
  timezone?: string;
  birthDate?: string;
  age?: number;
  country?: string;
  region?: string;
}

export interface MembernameRequest {
  membername: string;
}

class AuthService {
  public axios = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
  });

  constructor() {
    // 서버 사이드에서는 인터셉터 설정하지 않음
    if (typeof window === 'undefined') {
      return;
    }

    // 요청 인터셉터
    this.axios.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('🔑 요청 헤더에 토큰 설정:', token.substring(0, 20) + '...');
          } else {
            console.log('⚠️ 로컬 스토리지에 토큰이 없음');
          }
        }
        console.log('📤 API 요청:', config.method?.toUpperCase(), config.url);
        return config;
      },
      (error) => {
        console.error('❌ 요청 인터셉터 오류:', error);
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터
    this.axios.interceptors.response.use(
      (response) => {
        console.log('✅ API 응답 성공:', response.status, response.config.url);
        return response;
      },
      async (error) => {
        console.error('❌ API 응답 오류:', error.response?.status, error.config?.url, error.response?.data);
        
        if (error.response?.status === 401) {
          console.log('🔄 401 에러 - 토큰 갱신 시도');
          // 인증 오류 시 토큰 갱신 시도
          try {
            await this.refreshToken();
            // 토큰 갱신 성공 시 원래 요청 재시도
            const originalRequest = error.config;
            const token = localStorage.getItem('accessToken');
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              console.log('🔄 토큰 갱신 후 원래 요청 재시도');
              return this.axios(originalRequest);
            }
          } catch (refreshError) {
            console.error('❌ 토큰 갱신 실패:', refreshError);
            // 토큰 갱신 실패 시 로그아웃 처리
            if (typeof window !== 'undefined') {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('currentUser');
              window.location.href = '/';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setAccessToken(token: string) {
    this.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
      console.log('💾 토큰 저장됨:', token.substring(0, 20) + '...');
    }
  }



  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.axios.post('/api/auth/login', credentials);
      
      if (response.data.accessToken) {
        this.setAccessToken(response.data.accessToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        }
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.response?.data?.message || '로그인에 실패했습니다.');
    }
  }

  async googleLogin(): Promise<void> {
    // 서버 사이드에서는 처리하지 않음
    if (typeof window === 'undefined') {
      return;
    }
    // Google OAuth는 리다이렉트 방식이므로 여기서는 처리하지 않음
    window.location.href = `${API_BASE}/oauth2/authorization/google`;
  }

  async logout(): Promise<void> {
    try {
      await this.axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // 로컬 정리는 항상 수행
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('currentUser');
        delete this.axios.defaults.headers.common['Authorization'];
      }
    }
  }

  async getMyProfile(): Promise<ProfileResponse> {
    try {
      console.log('👤 내 프로필 조회 시작');
      const response = await this.axios.get('/api/members/me');
      console.log('✅ 프로필 조회 성공:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ 프로필 조회 실패:', error.response?.status, error.response?.data);
      throw new Error(error.response?.data?.message || '프로필 조회에 실패했습니다.');
    }
  }

  async updateProfile(profileData: Partial<ProfileResponse>): Promise<ProfileResponse> {
    try {
      const response = await this.axios.put('/api/members/me', profileData);
      return response.data;
    } catch (error: any) {
      console.error('Update profile failed:', error);
      throw new Error(error.response?.data?.message || '프로필 업데이트에 실패했습니다.');
    }
  }

  async setMembername(request: MembernameRequest): Promise<void> {
    try {
      const response = await this.axios.post('/api/members/membername', request);
      return response.data;
    } catch (error: any) {
      console.error('Set membername failed:', error);
      throw new Error(error.response?.data?.message || '유저네임 설정에 실패했습니다.');
    }
  }

  async refreshToken(): Promise<{ accessToken: string }> {
    try {
      console.log('🔄 토큰 갱신 시도');
      
      // 현재 사용자 정보에서 membername 가져오기
      const currentUser = localStorage.getItem('currentUser');
      let membername = 'google'; // 기본값
      
      if (currentUser) {
        try {
          const userData = JSON.parse(currentUser);
          membername = userData.membername || 'google';
        } catch (e) {
          console.warn('사용자 정보 파싱 실패, 기본값 사용:', membername);
        }
      }
      
      console.log('👤 membername으로 토큰 갱신:', membername);
      
      const response = await this.axios.post(`/api/auth/refresh?membername=${encodeURIComponent(membername)}`);
      console.log('📡 토큰 갱신 응답:', response.status);
      
      // 응답 헤더에서 Access Token 확인
      const newAccessToken = response.headers['authorization'] || response.headers['Authorization'];
      if (newAccessToken && newAccessToken.startsWith('Bearer ')) {
        const token = newAccessToken.substring(7);
        console.log('✅ Access Token 갱신 성공');
        return { accessToken: token };
      }
      
      throw new Error('토큰 갱신 응답에 Access Token이 없습니다');
    } catch (error: any) {
      console.error('❌ 토큰 갱신 실패:', error);
      throw new Error(error.response?.data?.message || '토큰 갱신에 실패했습니다.');
    }
  }
}

// 싱글톤 인스턴스 생성 (서버 사이드에서도 안전하게)
export const authService = new AuthService();
