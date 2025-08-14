import { create } from 'zustand';
import { websocketManager } from '../services/websocketManager';
import { chatService } from '../services/chatService';
import { ChatMessage, ChatRoom, ChatRoomSummary } from '../types/chat';
import { getCurrentInstant } from '../utils/dateUtils';
import { useAuthStore } from './auth';

interface ChatState {
  // 연결 상태
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  isLoading: boolean;
  
  // 채팅방 상태
  currentChatRoom: string | null;
  chatRooms: ChatRoomSummary[];
  chatMessages: Map<string, ChatMessage[]>;
  
  // 메시지 상태
  unreadCounts: Map<string, number>;
  
  // 액션
  connectWebSocket: () => Promise<void>;
  disconnectWebSocket: () => void;
  setCurrentChatRoom: (chatRoomId: string | null) => void;
  joinChatRoom: (chatRoomId: string) => Promise<void>;
  leaveChatRoom: (chatRoomId: string) => void;
  sendMessage: (chatRoomId: string, content: string) => Promise<void>;
  addMessage: (chatRoomId: string, message: ChatMessage) => void;
  markAsRead: (chatRoomId: string) => void;
  setChatRooms: (chatRooms: ChatRoomSummary[]) => void;
  setUnreadCount: (chatRoomId: string, count: number) => void;
  clearConnectionError: () => void;
  loadChatRooms: () => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // 초기 상태
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  isLoading: false,
  currentChatRoom: null,
  chatRooms: [],
  chatMessages: new Map(),
  unreadCounts: new Map(),

  // WebSocket 연결
  connectWebSocket: async () => {
    const state = get();
    if (state.isConnected || state.isConnecting) {
      return;
    }

    set({ isConnecting: true, connectionError: null });

    try {
      await websocketManager.connect();
      set({ 
        isConnected: true, 
        isConnecting: false,
        connectionError: null 
      });
    } catch (error) {
      console.error('❌ WebSocket 연결 실패:', error);
      set({ 
        isConnected: false, 
        isConnecting: false,
        connectionError: 'WebSocket 연결에 실패했습니다.' 
      });
    }
  },

  // WebSocket 연결 해제
  disconnectWebSocket: () => {
    websocketManager.disconnect();
    set({ 
      isConnected: false, 
      isConnecting: false,
      currentChatRoom: null,
      chatMessages: new Map(),
      unreadCounts: new Map()
    });
  },

  // 현재 채팅방 설정
  setCurrentChatRoom: (chatRoomId: string | null) => {
    const state = get();
    
    // 이전 채팅방에서 나가기
    if (state.currentChatRoom) {
      websocketManager.unsubscribe(state.currentChatRoom);
    }
    
    // 새 채팅방 입장
    if (chatRoomId) {
      websocketManager.subscribe(chatRoomId, (message: ChatMessage) => {
        get().addMessage(chatRoomId, message);
      });
    }
    
    set({ currentChatRoom: chatRoomId });
  },

  // 채팅방 입장
  joinChatRoom: async (chatRoomId: string) => {
    const state = get();
    
    if (!state.isConnected) {
      set({ connectionError: 'WebSocket이 연결되지 않았습니다.' });
      return;
    }

    try {
      // 현재 사용자 정보 가져오기
      const authState = useAuthStore.getState();
      const currentUser = authState.user;
      const membername = currentUser?.membername || 'unknown';
      
      // 채팅방 입장 이벤트 전송
      websocketManager.enterChatRoom(membername, chatRoomId);
      
      // 현재 채팅방 설정
      get().setCurrentChatRoom(chatRoomId);
      
      console.log('✅ 채팅방 입장 성공:', chatRoomId);
    } catch (error) {
      console.error('❌ 채팅방 입장 실패:', error);
      set({ connectionError: '채팅방 입장에 실패했습니다.' });
    }
  },

  // 채팅방 나가기
  leaveChatRoom: (chatRoomId: string) => {
    const state = get();
    
    // 구독 해제
    websocketManager.unsubscribe(chatRoomId);
    
    // 현재 채팅방이면 null로 설정
    if (state.currentChatRoom === chatRoomId) {
      set({ currentChatRoom: null });
    }
    
    console.log('🚪 채팅방 나가기:', chatRoomId);
  },

  // 메시지 전송
  sendMessage: async (chatRoomId: string, content: string) => {
    const state = get();
    
    if (!state.isConnected) {
      set({ connectionError: 'WebSocket이 연결되지 않았습니다.' });
      return;
    }

    if (!content.trim()) {
      return;
    }

    try {
      // 현재 사용자 정보 가져오기
      const authState = useAuthStore.getState();
      const currentUser = authState.user;
      const senderName = currentUser?.nickname || currentUser?.membername || 'Unknown User';
      
      // WebSocket으로 메시지 전송
      websocketManager.sendMessage(chatRoomId, content, senderName);
      
      // 낙관적 업데이트 (즉시 UI에 반영)
      const optimisticMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        chatRoomUuid: chatRoomId,
        sender: senderName,
        content: content,
        messageTime: getCurrentInstant(),
        chatMessageStatus: 'UNREAD'
      };
      
      get().addMessage(chatRoomId, optimisticMessage);
      
    } catch (error) {
      console.error('❌ 메시지 전송 실패:', error);
      set({ connectionError: '메시지 전송에 실패했습니다.' });
    }
  },

  // 메시지 추가
  addMessage: (chatRoomId: string, message: ChatMessage) => {
    const state = get();
    const currentMessages = state.chatMessages.get(chatRoomId) || [];
    
    // 중복 메시지 방지
    if (currentMessages.some(m => m.id === message.id)) {
      return;
    }
    
    const updatedMessages = [...currentMessages, message];
    const updatedChatMessages = new Map(state.chatMessages);
    updatedChatMessages.set(chatRoomId, updatedMessages);
    
    set({ chatMessages: updatedChatMessages });
    
    // 읽지 않은 메시지 개수 업데이트
    if (message.chatMessageStatus === 'UNREAD' && message.sender !== 'currentUser') {
      const currentCount = state.unreadCounts.get(chatRoomId) || 0;
      const updatedUnreadCounts = new Map(state.unreadCounts);
      updatedUnreadCounts.set(chatRoomId, currentCount + 1);
      set({ unreadCounts: updatedUnreadCounts });
    }
  },

  // 메시지 읽음 표시
  markAsRead: (chatRoomId: string) => {
    const state = get();
    const updatedUnreadCounts = new Map(state.unreadCounts);
    updatedUnreadCounts.set(chatRoomId, 0);
    set({ unreadCounts: updatedUnreadCounts });
  },

  // 채팅방 목록 설정
  setChatRooms: (chatRooms: ChatRoomSummary[]) => {
    set({ chatRooms });
  },

  // 읽지 않은 메시지 개수 설정
  setUnreadCount: (chatRoomId: string, count: number) => {
    const state = get();
    const updatedUnreadCounts = new Map(state.unreadCounts);
    updatedUnreadCounts.set(chatRoomId, count);
    set({ unreadCounts: updatedUnreadCounts });
  },

  // 연결 오류 초기화
  clearConnectionError: () => {
    set({ connectionError: null });
  },

  // 채팅방 목록 로드
  loadChatRooms: async () => {
    set({ isLoading: true });
    
    try {
      const chatRooms = await chatService.getMyChatRooms();
      set({ chatRooms, isLoading: false });
    } catch (error) {
      console.error('❌ 채팅방 목록 로드 실패:', error);
      set({ chatRooms: [], isLoading: false });
    }
  }
}));