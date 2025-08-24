import { create } from 'zustand';
import { websocketManager } from '../services/websocketManager';
import { chatService } from '../services/chatService';
import { ChatMessage, ChatRoom, ChatRoomSummaryResponse } from '../types/chat';
import { getCurrentInstant } from '../utils/dateUtils';
import { useAuthStore } from './auth';
import { ChatMessageResponse } from '../types/chat';

interface ChatState {
  // WebSocket 연결 상태
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  
  // 현재 채팅방
  currentChatRoom: string | null;
  
  // 채팅방 목록
  chatRooms: ChatRoomSummaryResponse[];
  
  // 메시지 저장소 (chatRoomId -> ChatMessage[])
  messages: Record<string, ChatMessage[]>;
  
  // 읽지 않은 메시지 개수
  unreadCounts: Record<string, number>;
  
  // 메시지 핸들러 등록 상태
  isMessageHandlerRegistered: boolean;
}

export const useChatStore = create<ChatState>((set, get) => {
  // 웹소켓 매니저 연결 상태 콜백 설정
  websocketManager.setConnectionStateCallback((connected: boolean, error?: string) => {
    set({ 
      isConnected: connected, 
      isConnecting: false,
      connectionError: error || null 
    });
  });

  const initialState: ChatState = {
    // WebSocket 연결 상태
    isConnected: false,
    isConnecting: false,
    connectionError: null,
    
    // 현재 채팅방
    currentChatRoom: null,
    
    // 채팅방 목록
    chatRooms: [],
    
    // 메시지 저장소 (chatRoomId -> ChatMessage[])
    messages: {},
    
    // 읽지 않은 메시지 개수
    unreadCounts: {},
    
    // 메시지 핸들러 등록 상태
    isMessageHandlerRegistered: false,
  };

  return {
    // 초기 상태
    isConnected: false,
    isConnecting: false,
    connectionError: null,
    isLoading: false,
    currentChatRoom: null,
    chatRooms: [],
    chatMessages: new Map(),
    unreadCounts: new Map(),
    translations: {},
    translatingMessages: new Set(),

  // WebSocket 연결
  connectWebSocket: async () => {
    const state = get();
    if (state.isConnected || state.isConnecting) {
      console.log('🔍 WebSocket: 이미 연결 중이거나 연결됨');
      return;
    }

    set({ isConnecting: true, connectionError: null });

    try {
      // WebSocket 연결 시도
      console.log('🔗 WebSocket 연결 시도...');
      await websocketManager.connect();
      const isActuallyConnected = websocketManager.isConnected();
      console.log('🔍 WebSocket 연결 후 실제 상태 확인:', isActuallyConnected);
      if (!isActuallyConnected) {
        throw new Error('WebSocket 연결이 완료되지 않았습니다.');
      }

      // 메시지 핸들러 등록 (WebSocket에서 수신된 메시지를 store에 추가)
      console.log('🔔 useChatStore: 메시지 핸들러 등록 시작');
      get().registerMessageHandler();
      console.log('✅ useChatStore: 메시지 핸들러 등록 완료');

      set({ 
        isConnected: true, 
        isConnecting: false, 
        connectionError: null 
      });
      console.log('🔗 WebSocket 연결 성공');
    } catch (error) {
      console.error('❌ WebSocket 연결 실패:', error);
      set({ 
        isConnected: false, 
        isConnecting: false,
        connectionError: error instanceof Error ? error.message : '알 수 없는 오류' 
      });
      throw error;
    }
  },

  // 메시지 핸들러 등록 (별도 함수로 분리)
  registerMessageHandler: () => {
    const state = get();
    if (state.isMessageHandlerRegistered) {
      console.log('🔔 useChatStore: 메시지 핸들러가 이미 등록되어 있음');
      return;
    }

    console.log('🔔 useChatStore: 메시지 핸들러 등록 시작');
    websocketManager.onMessageReceived((message: ChatMessage) => {
      console.log('📨 WebSocket에서 메시지 수신:', message);
      
      // store에 메시지 추가
      get().addMessage(message.chatRoomUuid, message);
      
      // 채팅방 목록의 마지막 메시지 업데이트
      get().updateChatRoomLastMessage(message.chatRoomUuid, message);
      
      // 읽지 않은 메시지 개수 업데이트 (자신이 보낸 메시지가 아닌 경우)
      const currentUser = useAuthStore.getState().user;
      if (message.senderId !== currentUser?.id?.toString()) {
        get().updateUnreadCount(message.chatRoomUuid, true);
      }
    });
    
    set({ isMessageHandlerRegistered: true });
    console.log('✅ useChatStore: 메시지 핸들러 등록 완료');
  },

  // WebSocket 연결 해제
  disconnectWebSocket: () => {
    const state = get();
    
    // WebSocket 연결 해제 (채팅방 구독은 자동으로 해제됨)
    websocketManager.disconnect();
    
    set({ 
      isConnected: false, 
      isConnecting: false,
      currentChatRoom: null,
      connectionError: null 
    });
    
    console.log('🔌 WebSocket 연결 해제 완료');
  },

  // 현재 채팅방 설정
  setCurrentChatRoom: (chatRoomId: string | null) => {
    const state = get();
    
    // 이전 채팅방에서 나가기
    if (state.currentChatRoom) {
      websocketManager.leaveChatRoom();
    }
    
    // 새 채팅방은 enterChatRoom에서 자동으로 구독됨
    set({ currentChatRoom: chatRoomId });
  },

  // 채팅방 입장
  joinChatRoom: async (chatRoomId: string) => {
    const state = get();
    console.log('🚪 chat.ts joinChatRoom 시작:', chatRoomId);
    console.log('🔍 현재 상태:', {
      currentChatRoom: state.currentChatRoom,
      isConnected: state.isConnected,
      isConnecting: state.isConnecting
    });
    
    // 실제 구독 상태 확인 (currentChatRoom만으로는 부족함)
    const isActuallySubscribed = websocketManager.isSubscribedToRoom(chatRoomId);
    console.log('🔍 실제 구독 상태 확인:', {
      chatRoomId,
      currentChatRoom: state.currentChatRoom,
      isActuallySubscribed,
      subscribedRooms: websocketManager.getSubscribedRooms()
    });
    
    // 이미 해당 채팅방에 구독되어 있는 경우 중복 입장 방지
    if (isActuallySubscribed) {
      console.log('🔍 이미 해당 채팅방에 구독됨:', chatRoomId);
      return;
    }
    
    // currentChatRoom만 설정되어 있고 실제 구독은 안된 경우
    if (state.currentChatRoom === chatRoomId && !isActuallySubscribed) {
      console.log('⚠️ currentChatRoom은 설정되어 있지만 실제 구독은 안됨, 구독 진행');
    }

    // WebSocket이 연결되지 않은 경우 연결 시도
    if (!websocketManager.isConnected()) {
      console.log('🔗 WebSocket이 연결되지 않음, 연결 시도...');
      try {
        await websocketManager.connect();
        // 연결 성공 후 상태 업데이트
        set({ isConnected: true, connectionError: null });
        console.log('✅ WebSocket 연결 성공');
      } catch (error) {
        console.error('❌ WebSocket 연결 실패:', error);
        set({ 
          isConnected: false,
          connectionError: `WebSocket 연결에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}` 
        });
        throw error;
      }
    } else {
      console.log('🔗 WebSocket 이미 연결됨');
    }

    // 이전 채팅방에서 나가기
    if (state.currentChatRoom) {
      console.log('🚪 이전 채팅방 나가기:', state.currentChatRoom);
      websocketManager.leaveChatRoom();
    }

    // 즉시 currentChatRoom 설정 (UI 반응성 향상)
    set({ 
      currentChatRoom: chatRoomId,
      isConnecting: true, 
      connectionError: null 
    });
    
    console.log('🔍 currentChatRoom 즉시 설정됨:', chatRoomId);
    
    try {
      // 이미 연결된 WebSocket을 통해 채팅방 구독만
      console.log('🔗 websocketManager.enterChatRoom 호출 시작');
      await websocketManager.enterChatRoom(chatRoomId);
      console.log('✅ websocketManager.enterChatRoom 완료');
      
      // 연결 상태 업데이트
      set({ 
        isConnected: true, 
        isConnecting: false,
        connectionError: null 
      });
      
      console.log('✅ 채팅방 입장 성공:', chatRoomId);
    } catch (error) {
      console.error('❌ 채팅방 입장 실패:', error);
      set({ 
        currentChatRoom: null, // 실패 시 null로 복원
        isConnected: false,
        isConnecting: false,
        connectionError: `채팅방 입장에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}` 
      });
      throw error; // 에러를 다시 던져서 호출자가 처리할 수 있도록
    }
  },

  // 채팅방 나가기
  leaveChatRoom: (chatRoomId: string) => {
    const state = get();
    
    // 구독 해제
    websocketManager.leaveChatRoom();
    
    // 현재 채팅방이면 null로 설정
    if (state.currentChatRoom === chatRoomId) {
      set({ 
        currentChatRoom: null,
        isConnected: false,
        isConnecting: false,
        connectionError: null
      });
      console.log('🚪 채팅방 나가기 완료, 연결 상태 초기화');
    }
  },

  // 메시지 전송 (WebSocket만 사용, 낙관적 업데이트 제거)
  sendMessage: async (chatRoomId: string, content: string) => {
    const state = get();
    
    if (!state.isConnected) {
      console.error('❌ "WebSocket이 연결되지 않았습니다."');
      throw new Error('WebSocket이 연결되지 않았습니다.');
    }

    try {
      // 현재 사용자 정보 가져오기
      const authState = useAuthStore.getState();
      const currentUser = authState.user;
      const senderName = currentUser?.nickname || currentUser?.membername || 'Unknown User';
      
      // WebSocket으로 메시지 전송만 (화면에는 표시 안함)
      websocketManager.sendMessage(chatRoomId, content);
      console.log('📤 WebSocket으로 메시지 전송됨:', content);
      
    } catch (error) {
      console.error('❌ 메시지 전송 실패:', error);
      set({ connectionError: `메시지 전송 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}` });
      throw error;
    }
  },

  // 메시지 추가 (WebSocket에서 수신된 메시지만)
  addMessage: (chatRoomId: string, message: ChatMessage) => {
    const state = get();
    const currentMessages = state.chatMessages.get(chatRoomId) || [];
    
    // 중복 체크: ID 기준으로 유니크한 메시지만 추가
    const isDuplicate = currentMessages.some(m => m.id === message.id);
    
    if (isDuplicate) {
      console.log('🔍 중복 메시지 무시:', message.id);
      return;
    }
    
    // 새 메시지 추가
    const updatedMessages = [...currentMessages, message];
    
    // 시간순으로 정렬
    const sortedMessages = updatedMessages.sort((a, b) => 
      new Date(a.messageTime).getTime() - new Date(b.messageTime).getTime()
    );
    
    const updatedChatMessages = new Map(state.chatMessages);
    updatedChatMessages.set(chatRoomId, sortedMessages);
    
    set({ chatMessages: updatedChatMessages });
    console.log('✅ 메시지 추가 완료:', { chatRoomId, messageId: message.id, totalCount: sortedMessages.length });
  },

  // 여러 메시지 로드 (이전 메시지 기록)
  loadMessages: (chatRoomId: string, messages: ChatMessage[]) => {
    console.log('🔍 chat.ts loadMessages 호출됨:', { chatRoomId, messageCount: messages.length });
    
    const state = get();
    const currentMessages = state.chatMessages.get(chatRoomId) || [];
    const updatedChatMessages = new Map(state.chatMessages);
    
    // 기존 메시지와 새로 로드된 메시지 합치기
    const allMessages = [...currentMessages, ...messages];
    
    // 중복 제거: ID 기준으로 유니크한 메시지만 필터링
    const uniqueMessages = allMessages.filter((message, index, array) => {
      // ID가 유니크한지 확인
      const firstIndex = array.findIndex(m => m.id === message.id);
      if (firstIndex !== index) {
        console.log('🔍 ID 중복 제거:', message.id);
        return false;
      }
      
      // 내용+시간+발신자 조합으로도 중복 체크
      const duplicateByContent = array.findIndex(m => 
        m.content === message.content && 
        m.messageTime === message.messageTime && 
        m.senderName === message.senderName
      );
      
      if (duplicateByContent !== index) {
        console.log('🔍 내용 중복 제거:', message.content);
        return false;
      }
      
      // 임시 메시지와 실제 메시지 중복 체크
      if (message.isSending) {
        const hasRealMessage = array.some(m => 
          !m.isSending && 
          m.content === message.content && 
          m.senderId === message.senderId &&
          Math.abs(new Date(m.messageTime).getTime() - new Date(message.messageTime).getTime()) < 1000 // 1초 이내
        );
        if (hasRealMessage) {
          console.log('🔍 임시 메시지 제거 (실제 메시지 존재):', message.content);
          return false;
        }
      }
      
      return true;
    });
    
    // 시간순으로 정렬 (오래된 순서대로)
    const sortedMessages = uniqueMessages.sort((a, b) => 
      new Date(a.messageTime).getTime() - new Date(b.messageTime).getTime()
    );
    
    updatedChatMessages.set(chatRoomId, sortedMessages);
    set({ chatMessages: updatedChatMessages });
    
    console.log('✅ chat.ts loadMessages 완료:', { 
      chatRoomId, 
      originalCount: messages.length, 
      uniqueCount: uniqueMessages.length, 
      finalCount: sortedMessages.length,
      storeSize: updatedChatMessages.size
    });
  },

  // 메시지 읽음 표시
  markAsRead: (chatRoomId: string) => {
    const state = get();
    const updatedUnreadCounts = new Map(state.unreadCounts);
    updatedUnreadCounts.set(chatRoomId, 0);
    set({ unreadCounts: updatedUnreadCounts });
  },

  // 채팅방 목록 설정
  setChatRooms: (chatRooms: ChatRoomSummaryResponse[]) => {
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
  },

  // 채팅방 마지막 메시지 업데이트
  updateChatRoomLastMessage: (chatRoomId: string, message: ChatMessage) => {
    const state = get();
    const currentChatRooms = state.chatRooms;
    const updatedChatRooms = currentChatRooms.map(room => {
      if (room.chatRoomId === chatRoomId || room.chatRoomId === message.chatRoomUuid) {
        return {
          ...room,
          lastMessageContent: message.content,
          lastMessageTime: message.messageTime
        };
      }
      return room;
    });
    set({ chatRooms: updatedChatRooms });
  },

  // 읽지 않은 메시지 수 업데이트
  updateUnreadCount: (chatRoomId: string, increment: boolean) => {
    const state = get();
    
    // unreadCounts Map 업데이트
    const currentUnreadCounts = state.unreadCounts;
    const currentCount = currentUnreadCounts.get(chatRoomId) || 0;
    const updatedCount = increment ? currentCount + 1 : Math.max(0, currentCount - 1);
    const updatedUnreadCounts = new Map(currentUnreadCounts);
    updatedUnreadCounts.set(chatRoomId, updatedCount);
    
    // chatRooms 배열의 unreadCount도 업데이트
    const updatedChatRooms = state.chatRooms.map(room => {
      if (room.chatRoomId === chatRoomId) {
        return {
          ...room,
          unreadCount: updatedCount
        };
      }
      return room;
    });
    
    set({ 
      unreadCounts: updatedUnreadCounts,
      chatRooms: updatedChatRooms
    });
    
    // 새 메시지 알림 (커스텀 이벤트)
    if (increment) {
      const room = state.chatRooms.find(r => r.chatRoomId === chatRoomId);
      const lastMessage = state.chatMessages.get(chatRoomId)?.slice(-1)[0];
      if (room && lastMessage) {
        const event = new CustomEvent('newMessage', {
          detail: {
            chatRoomId,
            opponentName: room.opponentName,
            content: lastMessage.content
          }
        });
        window.dispatchEvent(event);
      }
    }
  },

  // 현재 채팅방의 메시지들 가져오기
  getCurrentMessages: () => {
    const state = get();
    if (!state.currentChatRoom) return [];
    return state.chatMessages.get(state.currentChatRoom) || [];
  },

  // 현재 채팅방의 읽지 않은 메시지 개수
  getCurrentUnreadCount: () => {
    const state = get();
    if (!state.currentChatRoom) return 0;
    return state.unreadCounts.get(state.currentChatRoom) || 0;
  },

  // 번역 액션
  setTranslation: (messageId, targetLang, translatedText) => {
    const { translations } = get();
    const newTranslations = { ...translations };
    if (!newTranslations[messageId]) {
      newTranslations[messageId] = {};
    }
    newTranslations[messageId][targetLang] = translatedText;
    set({ translations: newTranslations });
  },

  setTranslating: (messageId, isTranslating) => {
    const { translatingMessages } = get();
    const newTranslatingMessages = new Set(translatingMessages);
    if (isTranslating) {
      newTranslatingMessages.add(messageId);
    } else {
      newTranslatingMessages.delete(messageId);
    }
    set({ translatingMessages: newTranslatingMessages });
  },

  getTranslation: (messageId, targetLang) => {
    const { translations } = get();
    return translations[messageId]?.[targetLang] || null;
  },

  isTranslating: (messageId) => {
    const { translatingMessages } = get();
    return translatingMessages.has(messageId);
  }
  };
});