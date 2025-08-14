import { apiUtils } from '../utils/api';
import { ChatRoomSummary, CreateChatRoomRequest, CreateChatRoomResponse } from '../types/chat';
import { ChatRequestSummary } from '../types/chatRequest';

export class ChatService {
  // 내 채팅방 목록 조회
  static async getMyChatRooms(): Promise<ChatRoomSummary[]> {
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
      const response = await apiUtils.fetchWithAuth(`/api/chat-room/${roomUuid}/reject`, {
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
  static async getMySentChatRequests(): Promise<ChatRequestSummary[]> {
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
  static async getMyReceivedChatRequests(): Promise<ChatRequestSummary[]> {
    try {
      const response = await apiUtils.fetchWithAuth('/api/chat-room/requests/received');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ 받은 채팅 요청 목록 조회 실패:', error);
      throw error;
    }
  }
}

export const chatService = ChatService;
