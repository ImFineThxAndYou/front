import { apiUtils } from '../utils/api';

export interface ChatMessageDocumentResponse {
  id: string;
  chatRoomUuid: string;
  sender: string;
  content: string;
  messageTime: string;
  chatMessageStatus: string;
}

export class ChatMessageService {
  // 최근 메시지 조회
  static async getRecentMessages(chatRoomId: string, count: number = 30): Promise<ChatMessageDocumentResponse[]> {
    try {
      const response = await apiUtils.fetchWithAuth(`/api/chat-message/${chatRoomId}/recent?count=${count}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ 최근 메시지 조회 실패:', error);
      return [];
    }
  }

  // 이전 메시지 페이징 조회
  static async getPreviousMessages(chatRoomId: string, before: string, size: number = 30): Promise<ChatMessageDocumentResponse[]> {
    try {
      const response = await apiUtils.fetchWithAuth(`/api/chat-message/${chatRoomId}/previous?before=${before}&size=${size}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ 이전 메시지 조회 실패:', error);
      return [];
    }
  }

  // 메시지 읽음 처리
  static async markMessagesAsRead(chatRoomId: string): Promise<void> {
    try {
      const response = await apiUtils.fetchWithAuth(`/api/chat-message/${chatRoomId}/read`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ 메시지 읽음 처리 실패:', error);
      throw error;
    }
  }
}

export const chatMessageService = ChatMessageService;

