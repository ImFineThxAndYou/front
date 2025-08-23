import axios from 'axios';
import { authService } from '../services/auth';

// axios 기본 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
console.log('🌐 API Base URL:', API_BASE_URL);
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

// 토큰 갱신 중인지 확인하는 플래그
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

// 토큰 갱신 함수
const refreshToken = async (): Promise<string> => {
  if (isRefreshing && refreshPromise) {
    console.log('⏳ 기존 토큰 갱신 대기...');
    return await refreshPromise;
  }

  isRefreshing = true;
  console.log('🔄 새로운 토큰 갱신 시작...');
  
  refreshPromise = axios.post("/api/auth/refresh", null, { 
    withCredentials: true 
  }).then(response => {
    console.log('🔄 인터셉터: 토큰 갱신 응답 전체:', response);
    console.log('🔄 인터셉터: 토큰 갱신 응답 데이터:', response.data);
    console.log('🔄 인터셉터: 토큰 갱신 응답 헤더:', response.headers);
    
    // 응답 헤더에서 Authorization 헤더 확인
    const authHeader = response.headers['authorization'] || response.headers['Authorization'];
    console.log('🔑 인터셉터: 응답 헤더에서 Authorization 확인:', authHeader);
    
    let accessToken: string;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // 헤더에서 토큰 추출
      accessToken = authHeader.substring(7); // "Bearer " 제거
      console.log('🔑 인터셉터: 헤더에서 access token 추출:', accessToken);
    } else if (response.data && response.data.access) {
      // 응답 본문에서 토큰 추출 (백업)
      accessToken = response.data.access;
      console.log('🔑 인터셉터: 응답 본문에서 access token 추출:', accessToken);
    } else {
      console.error('❌ 인터셉터: access token을 찾을 수 없습니다');
      console.error('❌ 인터셉터: 헤더:', authHeader);
      console.error('❌ 인터셉터: 데이터:', response.data);
      throw new Error('Access token not found in response headers or body');
    }
    
    console.log('✅ 인터셉터: 토큰 갱신 성공:', accessToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    
    // auth service를 통해 토큰 저장
    authService.setAccessToken(accessToken);
    console.log('💾 인터셉터: Access token을 auth service에 저장');
    
    return accessToken;
  }).finally(() => {
    isRefreshing = false;
    refreshPromise = null;
  });

  return await refreshPromise;
};

// 요청 인터셉터 - 토큰 자동 갱신
axios.interceptors.request.use(async (config) => {
  console.log('📤 API 요청:', config.method?.toUpperCase(), config.url);
  console.log('📤 요청 헤더:', config.headers);
  console.log('📤 전역 Authorization 헤더:', axios.defaults.headers.common['Authorization']);
  
  // 토큰 갱신 요청 자체는 인터셉터를 건너뛰기
  if (config.url === '/api/auth/refresh') {
    console.log('🔄 토큰 갱신 요청 - 인터셉터 스킵');
    return config;
  }
  
  // Authorization 헤더가 없는 경우에만 토큰 갱신 시도
  if (!config.headers['Authorization'] && !axios.defaults.headers.common['Authorization']) {
    try {
      console.log('🔐 인터셉터: Authorization 헤더 없음 - 토큰 갱신 시도');
      const token = await refreshToken();
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 인터셉터: Authorization 헤더 설정 완료');
    } catch (error) {
      console.error('❌ 인터셉터: 토큰 갱신 실패:', error);
      // 토큰 갱신 실패 시 리다이렉트하지 않고 에러만 로그
    }
  } else if (!config.headers['Authorization'] && axios.defaults.headers.common['Authorization']) {
    // 전역 헤더에 토큰이 있으면 요청 헤더에 복사
    config.headers['Authorization'] = axios.defaults.headers.common['Authorization'];
    console.log('🔑 인터셉터: 전역 헤더에서 Authorization 복사');
  }
  
  return config;
});

// 응답 인터셉터 - 401 에러 처리
axios.interceptors.response.use(
  (response) => {
    console.log('📥 API 응답 성공:', response.config.method?.toUpperCase(), response.config.url);
    console.log('📥 응답 상태:', response.status);
    console.log('📥 응답 데이터:', response.data);
    return response;
  },
  async (error) => {
    console.error('❌ API 응답 실패:', error.config?.method?.toUpperCase(), error.config?.url);
    console.error('❌ 에러 상태:', error.response?.status);
    console.error('❌ 에러 데이터:', error.response?.data);
    
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('🔄 401 에러 - 토큰 갱신 시도...');
      
      try {
        const token = await refreshToken();
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        console.log('🔄 토큰 갱신 후 요청 재시도');
        return axios(originalRequest);
      } catch (refreshError) {
        console.error('❌ 토큰 갱신 실패:', refreshError);
        // 토큰 갱신 실패 시 리다이렉트하지 않고 에러만 반환
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axios;

// API 유틸리티 함수들
export const apiUtils = {
  // Bearer 토큰이 포함된 fetch 요청
  fetchWithAuth: async (url: string, options: RequestInit = {}) => {
    const token = authService.getAccessToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // API_BASE_URL을 사용하여 전체 URL 구성
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    console.log('🌐 fetchWithAuth 요청 URL:', fullUrl);

    return fetch(fullUrl, {
      ...options,
      headers,
      credentials: 'include', // 쿠키 포함 설정 추가
    });
  },

  // SSE 연결용 fetch (헤더 지원)
  fetchSSE: async (url: string, options: RequestInit = {}) => {
    const token = authService.getAccessToken();
    const headers = {
      'Accept': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // API_BASE_URL을 사용하여 전체 URL 구성
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    console.log('🌐 fetchSSE 요청 URL:', fullUrl);

    return fetch(fullUrl, {
      ...options,
      headers,
      credentials: 'include', // 쿠키 포함 설정 추가
    });
  },

  // 하트비트 응답 전송
  sendHeartbeat: async () => {
    const token = authService.getAccessToken();
    if (!token) {
      throw new Error('Access token not found');
    }

    const fullUrl = `${API_BASE_URL}/api/notify/heartbeat`;
    console.log('🌐 sendHeartbeat 요청 URL:', fullUrl);

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include', // 쿠키 포함 설정 추가
    });

    if (!response.ok) {
      throw new Error(`Heartbeat failed: ${response.status}`);
    }

    return response;
  }
};
