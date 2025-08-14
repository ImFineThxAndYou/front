import { LoginRequest, LoginResponse, MembernameRequest, ProfileCreateRequest } from '../types/auth';
import axios from '../utils/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

class AuthService {

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('🔐 AuthService: 로그인 요청 시작', credentials);
    
    try {
      const response = await axios.post<LoginResponse>('/api/auth/login', credentials);
      console.log('✅ AuthService: 로그인 응답 성공', response.data);
      
      // Authorization 헤더에서 access token 추출
      const authHeader = response.headers['authorization'] || response.headers['Authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const accessToken = authHeader.substring(7);
        console.log('🔑 AuthService: Authorization 헤더에서 access token 추출:', accessToken);
        
        // setAccessToken 메서드 사용
        this.setAccessToken(accessToken);
        console.log('💾 AuthService: Access token 설정 완료');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ AuthService: 로그인 실패:', error);
      throw error;
    }
  }

  async googleLogin(): Promise<string> {
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`);
    return `${API_BASE_URL}/oauth2/authorization/google?redirect_uri=${redirectUri}`;
  }

  async kakaoLogin(): Promise<string> {
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`);
    return `${API_BASE_URL}/oauth2/authorization/kakao?redirect_uri=${redirectUri}`;
  }

  async naverLogin(): Promise<string> {
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`);
    return `${API_BASE_URL}/oauth2/authorization/naver?redirect_uri=${redirectUri}`;
  }

  async setMembername(membername: MembernameRequest): Promise<void> {
    console.log('📝 AuthService: 유저네임 설정 요청 시작', membername);
    
    try {
      const response = await axios.post<void>('/api/members/membername', membername);
      console.log('✅ AuthService: 유저네임 설정 성공', response.data);
    } catch (error) {
      console.error('❌ AuthService: 유저네임 설정 실패:', error);
      throw error;
    }
  }

  async updateProfile(profile: ProfileCreateRequest): Promise<void> {
    console.log('📝 AuthService: 프로필 업데이트 요청 시작', profile);
    
    try {
      const response = await axios.put<void>('/api/members/me', profile);
      console.log('✅ AuthService: 프로필 업데이트 성공', response.data);
    } catch (error) {
      console.error('❌ AuthService: 프로필 업데이트 실패:', error);
      throw error;
    }
  }

  async getMyProfile(): Promise<any> {
    console.log('📝 AuthService: 내 프로필 조회 요청 시작');
    
    try {
      const response = await axios.get<any>('/api/members/me');
      console.log('✅ AuthService: 내 프로필 조회 성공', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ AuthService: 내 프로필 조회 실패:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('accessToken');
    try {
      const response = await axios.post<void>('/api/auth/logout');
      console.log('✅ AuthService: 로그아웃 성공');
    } catch (error) {
      console.error('❌ AuthService: 로그아웃 실패:', error);
      // 로그아웃 실패해도 로컬 토큰은 삭제
    }
  }

  setAccessToken(token: string): void {
    console.log('🔑 AuthService: Access token 설정:', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('accessToken', token);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const authService = new AuthService();
