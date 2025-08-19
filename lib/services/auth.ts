import axios from 'axios';

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

class AuthService {
  public axios = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
  });

  constructor() {
    // 요청 인터셉터
    this.axios.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터
    this.axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // 인증 오류 시 로그아웃 처리
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('currentUser');
            window.location.href = '/';
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
      const response = await this.axios.get('/api/auth/me');
      return response.data;
    } catch (error: any) {
      console.error('Get profile failed:', error);
      throw new Error(error.response?.data?.message || '프로필 조회에 실패했습니다.');
    }
  }

  async updateProfile(profileData: Partial<ProfileResponse>): Promise<ProfileResponse> {
    try {
      const response = await this.axios.put('/api/auth/profile', profileData);
      return response.data;
    } catch (error: any) {
      console.error('Update profile failed:', error);
      throw new Error(error.response?.data?.message || '프로필 업데이트에 실패했습니다.');
    }
  }

  async refreshToken(): Promise<{ accessToken: string }> {
    try {
      const response = await this.axios.post('/api/auth/refresh');
      if (response.data.accessToken) {
        this.setAccessToken(response.data.accessToken);
      }
      return response.data;
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      throw new Error(error.response?.data?.message || '토큰 갱신에 실패했습니다.');
    }
  }
}

export const authService = new AuthService();
