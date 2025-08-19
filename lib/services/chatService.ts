import { apiUtils } from '../utils/api';
import { 
  CreateChatRoomRequest, 
  CreateChatRoomResponse,
  ChatRequestSummaryResponse,
  ChatRoomResponse,
  ChatRoomSummaryResponse,
  ChatMessageDocumentResponse,
  ChatRoomStatus
} from '../types/chat';
import { ChatRequestSummary } from '../types/chatRequest';

export class ChatService {
  // 내 채팅방 목록 조회
  static async getMyChatRooms(): Promise<ChatRoomSummaryResponse[]> {
    try {
      const response = await apiUtils.fetchWithAuth('/api/chat-room/my-rooms');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ 채팅방 목록 조회 실패:', error);
      return [];
    }
  }

  // 채팅방 생성
  static async createChatRoom(request: CreateChatRoomRequest): Promise<CreateChatRoomResponse> {
    try {
      const response = await apiUtils.fetchWithAuth('/api/chat-room/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ 채팅방 생성 실패:', error);
      throw error;
    }
  }

  // 채팅방 수락
  static async acceptChatRoom(roomUuid: string, receiverId: number): Promise<void> {
    try {
      const response = await apiUtils.fetchWithAuth(`/api/chat-room/${roomUuid}/accept`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ 채팅방 수락 실패:', error);
      throw error;
    }
  }

  // 채팅방 거절
  static async rejectChatRoom(roomUuid: string, receiverId: number): Promise<void> {
    try {
      const response = await apiUtils.fetchWithAuth(`/api/chat-room/${roomUuid}/reject?receiverId=${receiverId}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ 채팅방 거절 실패:', error);
      throw error;
    }
  }

  // 채팅방 연결 해제 및 삭제
  static async disconnectChatRoom(roomUuid: string): Promise<void> {
    try {
      const response = await apiUtils.fetchWithAuth(`/api/chat-room/${roomUuid}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ 채팅방 연결 해제 실패:', error);
      throw error;
    }
  }

  // 내가 보낸 채팅 요청 목록 조회
  static async getMySentChatRequests(): Promise<ChatRequestSummaryResponse[]> {
    try {
      const response = await apiUtils.fetchWithAuth('/api/chat-room/requests/sent');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ 보낸 채팅 요청 목록 조회 실패:', error);
      return [];
    }
  }

  // 내가 받은 채팅 요청 목록 조회
  static async getMyReceivedChatRequests(): Promise<ChatRequestSummaryResponse[]> {
    try {
      const response = await apiUtils.fetchWithAuth('/api/chat-room/requests/received');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ 받은 채팅 요청 목록 조회 실패:', error);
      return [];
    }
  }

  // 단일 채팅방 조회
  static async getChatRoom(roomUuid: string): Promise<ChatRoomResponse> {
    try {
      const response = await apiUtils.fetchWithAuth(`/api/chat-room/${roomUuid}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ 채팅방 조회 실패:', error);
      throw error;
    }
  }

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

export const chatService = ChatService;
