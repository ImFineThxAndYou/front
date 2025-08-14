import { apiUtils } from '../utils/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export interface NotifyDto {
  id: string;
  type: 'CHAT' | 'SYSTEM' | 'CHATREQ';
  createdAt: string; // Instant를 ISO string으로 받음
  readAt: string | null; // Instant를 ISO string으로 받음, null일 수 있음
  payload: string; // JSON string
}

export interface NotificationPage {
  content: NotifyDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface UnreadCountResponse {
  unread: number;
}

class NotificationService {
  /**
   * 알림 목록을 페이징으로 조회
   */
  async getNotifications(page: number = 0, size: number = 20): Promise<NotificationPage> {
    try {
      const response = await apiUtils.fetchWithAuth(
        `${API_BASE_URL}/api/notify?page=${page}&size=${size}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ 알림 목록 조회 실패:', error);
      // API 오류 시 빈 페이지 반환
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size,
        number: page,
        first: page === 0,
        last: true
      };
    }
  }

  /**
   * 읽지 않은 알림 개수 조회
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiUtils.fetchWithAuth(
        `${API_BASE_URL}/api/notify/unread-count`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch unread count: ${response.status}`);
      }
      
      const data: UnreadCountResponse = await response.json();
      return data.unread;
    } catch (error) {
      console.error('❌ 읽지 않은 알림 개수 조회 실패:', error);
      // API 오류 시 0 반환
      return 0;
    }
  }

  /**
   * 알림을 읽음으로 표시
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const response = await apiUtils.fetchWithAuth(
        `${API_BASE_URL}/api/notify/${notificationId}/read`,
        {
          method: 'PATCH'
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.status}`);
      }
      
      console.log('✅ 알림 읽음 표시 성공:', notificationId);
    } catch (error) {
      console.error('❌ 알림 읽음 표시 실패:', error);
      // API 오류 시에도 로컬 상태는 업데이트 (사용자 경험 향상)
      throw error;
    }
  }

  /**
   * 페이로드를 파싱하여 안전하게 객체로 변환
   */
  parsePayload(payload: string): any {
    try {
      return JSON.parse(payload);
    } catch (error) {
      console.error('❌ 페이로드 파싱 실패:', error);
      return { error: '데이터 파싱 실패' };
    }
  }

  /**
   * 알림 타입에 따른 아이콘 반환
   */
  getTypeIcon(type: string): string {
    switch (type) {
      case 'CHAT':
        return '💬';
      case 'SYSTEM':
        return '🔔';
      case 'CHATREQ':
        return '🤝';
      default:
        return '📢';
    }
  }

  /**
   * 알림 타입에 따른 라벨 반환
   */
  getTypeLabel(type: string): string {
    switch (type) {
      case 'CHAT':
        return '채팅';
      case 'SYSTEM':
        return '시스템';
      case 'CHATREQ':
        return '채팅 요청';
      default:
        return '알림';
    }
  }
}

export const notificationService = new NotificationService();
