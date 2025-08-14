import { apiUtils } from '../utils/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export class SseService {
  // SSE 연결 구독
  static async subscribe(): Promise<EventSource> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Access token not found');
      }

      const eventSource = new EventSource(`${API_BASE_URL}/api/notify/sse`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ SSE 연결 시작');
      return eventSource;
    } catch (error) {
      console.error('❌ SSE 연결 실패:', error);
      throw error;
    }
  }

  // 하트비트 응답
  static async sendHeartbeat(): Promise<void> {
    try {
      const response = await apiUtils.fetchWithAuth('/api/notify/heartbeat', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log('💓 하트비트 전송 성공');
    } catch (error) {
      console.error('❌ 하트비트 전송 실패:', error);
      throw error;
    }
  }
}

export const sseService = SseService;

