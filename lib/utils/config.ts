/**
 * 환경변수 설정 유틸리티
 */

// API 베이스 URL
export const getApiBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
};

// WebSocket 베이스 URL
export const getWsBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_WS_BASE_URL || 'http://localhost:8080';
};

// 애플리케이션 이름
export const getAppName = (): string => {
  return process.env.NEXT_PUBLIC_APP_NAME || 'HowAreYou';
};

// 애플리케이션 버전
export const getAppVersion = (): string => {
  return process.env.NEXT_PUBLIC_APP_VERSION || '2.0.0';
};

// 환경
export const getEnvironment = (): string => {
  return process.env.NEXT_PUBLIC_ENVIRONMENT || 'development';
};

// 분석 활성화 여부
export const isAnalyticsEnabled = (): boolean => {
  return process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';
};

// 에러 추적 활성화 여부
export const isErrorTrackingEnabled = (): boolean => {
  return process.env.NEXT_PUBLIC_ENABLE_ERROR_TRACKING === 'true';
};

// 개발 환경 여부
export const isDevelopment = (): boolean => {
  return getEnvironment() === 'development';
};

// 프로덕션 환경 여부
export const isProduction = (): boolean => {
  return getEnvironment() === 'production';
};
