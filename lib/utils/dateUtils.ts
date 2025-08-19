/**
 * Instant 타입과 관련된 날짜/시간 유틸리티 함수들
 */

// Instant 문자열을 Date 객체로 변환
export const parseInstant = (instantString: string): Date => {
  try {
    return new Date(instantString);
  } catch (error) {
    console.error('❌ Instant 파싱 실패:', error);
    return new Date();
  }
};

// Instant 문자열이 유효한지 확인
export const isValidInstant = (instantString: string): boolean => {
  try {
    const date = new Date(instantString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};

// Instant 문자열을 상대적 시간으로 포맷 (예: "2분 전", "1시간 전")
export const formatRelativeTime = (instantString: string): string => {
  try {
    const date = parseInstant(instantString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    
    return date.toLocaleDateString('ko-KR');
  } catch (error) {
    console.error('❌ 상대적 시간 포맷 실패:', error);
    return '알 수 없음';
  }
};

// Instant 문자열을 절대 시간으로 포맷 (예: "2024-01-15 14:30")
export const formatAbsoluteTime = (instantString: string): string => {
  try {
    const date = parseInstant(instantString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('❌ 절대 시간 포맷 실패:', error);
    return '알 수 없음';
  }
};

// Instant 문자열을 간단한 시간으로 포맷 (예: "14:30", "어제 14:30")
export const formatSimpleTime = (instantString: string): string => {
  try {
    const date = parseInstant(instantString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (messageDate.getTime() === today.getTime()) {
      // 오늘
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (messageDate.getTime() === yesterday.getTime()) {
      // 어제
      return `어제 ${date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    } else {
      // 그 이전
      return date.toLocaleDateString('ko-KR', {
        month: '2-digit',
        day: '2-digit'
      });
    }
  } catch (error) {
    console.error('❌ 간단한 시간 포맷 실패:', error);
    return '알 수 없음';
  }
};

// 현재 시간을 Instant 형식(ISO 8601)으로 반환
export const getCurrentInstant = (): string => {
  return new Date().toISOString();
};

// Date 객체를 Instant 형식(ISO 8601)으로 변환
export const dateToInstant = (date: Date): string => {
  return date.toISOString();
};

// Instant 형식 문자열이 유효한지 확인하고 정규화
export const normalizeInstant = (instantString: string): string => {
  try {
    const date = new Date(instantString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    return date.toISOString();
  } catch (error) {
    console.error('❌ Instant 정규화 실패:', error);
    return new Date().toISOString();
  }
};

// Date 객체를 상대적 시간으로 포맷 (예: "2분 전", "1시간 전")
export const formatDistanceToNow = (date: Date, options?: { addSuffix?: boolean }): string => {
  try {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    const suffix = options?.addSuffix ? ' 전' : '';
    
    if (minutes < 1) return `방금${suffix}`;
    if (minutes < 60) return `${minutes}분${suffix}`;
    if (hours < 24) return `${hours}시간${suffix}`;
    if (days < 7) return `${days}일${suffix}`;
    if (weeks < 4) return `${weeks}주${suffix}`;
    if (months < 12) return `${months}개월${suffix}`;
    
    return `${years}년${suffix}`;
  } catch (error) {
    console.error('❌ formatDistanceToNow 실패:', error);
    return '알 수 없음';
  }
};
