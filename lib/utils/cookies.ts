// 쿠키 관련 유틸리티 함수들

/**
 * 쿠키에서 값을 가져오는 함수
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  } catch (error) {
    console.error('쿠키 읽기 오류:', error);
    return null;
  }
}

/**
 * 모든 쿠키를 가져오는 함수 (디버깅용)
 */
export function getAllCookies(): Record<string, string> {
  if (typeof document === 'undefined') return {};
  
  try {
    const cookies: Record<string, string> = {};
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = value;
      }
    });
    return cookies;
  } catch (error) {
    console.error('모든 쿠키 읽기 오류:', error);
    return {};
  }
}

/**
 * 쿠키를 설정하는 함수
 */
export function setCookie(name: string, value: string, days: number = 7): void {
  if (typeof document === 'undefined') return;
  
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  } catch (error) {
    console.error('쿠키 설정 오류:', error);
  }
}

/**
 * 쿠키를 삭제하는 함수
 */
export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  
  try {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  } catch (error) {
    console.error('쿠키 삭제 오류:', error);
  }
}
