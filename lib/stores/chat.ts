import { create } from 'zustand';
import { websocketManager } from '../services/websocketManager';
import { chatService } from '../services/chatService';
import { ChatMessage, ChatRoom, ChatRoomSummaryResponse } from '../types/chat';
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
  chatRooms: ChatRoomSummaryResponse[];
  chatMessages: Map<string, ChatMessage[]>;
  
  // 메시지 상태
  unreadCounts: Map<string, number>;
  
  // 번역 상태
  translations: Record<string, Record<string, string>>; // messageId -> { targetLang -> translatedText }
  translatingMessages: Set<string>; // 번역 중인 메시지 ID들
  
  // 액션
  connectWebSocket: () => Promise<void>;
  disconnectWebSocket: () => void;
  setCurrentChatRoom: (chatRoomId: string | null) => void;
  joinChatRoom: (chatRoomId: string) => Promise<void>;
  leaveChatRoom: (chatRoomId: string) => void;
  sendMessage: (chatRoomId: string, content: string) => Promise<void>;
  addMessage: (chatRoomId: string, message: ChatMessage) => void;
  loadMessages: (chatRoomId: string, messages: ChatMessage[]) => void;
  markAsRead: (chatRoomId: string) => void;
  setChatRooms: (chatRooms: ChatRoomSummaryResponse[]) => void;
  setUnreadCount: (chatRoomId: string, count: number) => void;
  clearConnectionError: () => void;
  loadChatRooms: () => Promise<void>;

  // 번역 액션
  setTranslation: (messageId: string, targetLang: string, translatedText: string) => void;
  setTranslating: (messageId: string, isTranslating: boolean) => void;
  getTranslation: (messageId: string, targetLang: string) => string | null;
  isTranslating: (messageId: string) => boolean;
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
    console.log('🚀 chatStore.connectWebSocket() 호출됨');
    const state = get();
    console.log('🔍 현재 chatStore 상태:', {
      isConnected: state.isConnected,
      isConnecting: state.isConnecting,
      connectionError: state.connectionError
    });
    
    if (state.isConnected || state.isConnecting) {
      console.log('🔍 이미 연결 중이거나 연결됨');
      return;
    }

    console.log('📝 연결 상태를 isConnecting=true로 설정');
    set({ isConnecting: true, connectionError: null });

    try {
      // 실제 WebSocket 연결 시도
      console.log('🔗 WebSocket 연결 시도...');
      await websocketManager.connect();
      
      // WebSocket 메시지 수신 핸들러 등록
      console.log('🔔 WebSocket 메시지 핸들러 등록...');
      websocketManager.onMessageReceived((message) => {
        console.log('🔔 WebSocket 메시지 수신됨:', message);
        const state = get();
        const currentUser = useAuthStore.getState().user;
        
        // 현재 채팅방의 메시지인지 확인
        if (state.currentChatRoom === message.chatRoomUuid) {
          // 내가 보낸 메시지인지 확인 (중복 방지)
          const isMyMessage = currentUser && (
            message.senderName === currentUser.nickname ||
            message.senderName === currentUser.membername
          );
          
          if (isMyMessage) {
            console.log('📨 내가 보낸 메시지 WebSocket 수신 - 무시됨 (중복 방지):', {
              senderName: message.senderName,
              currentUserNickname: currentUser.nickname,
              currentUserMembername: currentUser.membername
            });
            return;
          }
          
          console.log('📨 다른 사용자 메시지 - addMessage 호출');
          get().addMessage(message.chatRoomUuid, {
            id: message.id,
            chatRoomUuid: message.chatRoomUuid,
            sender: message.senderName,
            senderId: message.senderId || '',
            senderName: message.senderName,
            content: message.content,
            messageTime: message.messageTime,
            chatMessageStatus: message.status as 'read' | 'UNREAD'
          });
        } else {
          console.log('📨 다른 채팅방 메시지 - 무시됨:', {
            currentRoom: state.currentChatRoom,
            messageRoom: message.chatRoomUuid
          });
        }
      });
      
      // 연결 상태는 websocketManager의 콜백으로 관리됨
      console.log('🔗 WebSocket 연결 성공');
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
    
    // 이미 해당 채팅방에 있는 경우 중복 입장 방지
    if (state.currentChatRoom === chatRoomId) {
      console.log('🔍 이미 해당 채팅방에 있음:', chatRoomId);
      return;
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
      // 채팅방 입장 이벤트 전송 (웹소켓 연결 포함)
      await websocketManager.enterChatRoom(chatRoomId);
      
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
        connectionError: '채팅방 입장에 실패했습니다.' 
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
        isConnected: false 
      });
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
      websocketManager.sendMessage(chatRoomId, content);
      
      // 낙관적 업데이트 (즉시 UI에 반영)
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const optimisticMessage: ChatMessage = {
        id: `temp-${timestamp}-${randomId}-${currentUser?.id || 'unknown'}`, // 더욱 고유한 임시 ID
        chatRoomUuid: chatRoomId,
        sender: senderName,
        senderId: currentUser?.id?.toString() || '',
        senderName: senderName,
        content: content,
        messageTime: getCurrentInstant(),
        chatMessageStatus: 'UNREAD'
      };
      
      console.log('📤 낙관적 업데이트 메시지:', optimisticMessage);
      get().addMessage(chatRoomId, optimisticMessage);
      
    } catch (error) {
      console.error('❌ 메시지 전송 실패:', error);
      set({ connectionError: '메시지 전송에 실패했습니다.' });
    }
  },

  // 메시지 추가
  addMessage: (chatRoomId: string, message: ChatMessage) => {
    console.log('🔍 addMessage 호출됨:', { chatRoomId, messageId: message.id, content: message.content });
    
    // 메시지 데이터 검증
    if (!message.id) {
      console.error('❌ 메시지 ID가 없음:', message);
      return;
    }
    
    const state = get();
    const currentMessages = state.chatMessages.get(chatRoomId) || [];
    console.log('🔍 현재 메시지 개수:', currentMessages.length);
    
    // 더 강화된 중복 메시지 방지 - ID와 내용+시간 조합으로 체크
    const isDuplicate = currentMessages.some(m => 
      m.id === message.id || 
      (m.content === message.content && 
       m.messageTime === message.messageTime && 
       m.sender === message.sender)
    );
    
    if (isDuplicate) {
      console.log('⚠️ 중복 메시지 감지 - 추가하지 않음:', { 
        id: message.id, 
        content: message.content.substring(0, 20),
        sender: message.sender,
        time: message.messageTime
      });
      return;
    }
    
    const updatedMessages = [...currentMessages, message];
    const updatedChatMessages = new Map(state.chatMessages);
    updatedChatMessages.set(chatRoomId, updatedMessages);
    
    console.log('📝 스토어 업데이트 전 메시지 개수:', currentMessages.length);
    console.log('📝 스토어 업데이트 후 메시지 개수:', updatedMessages.length);
    set({ chatMessages: updatedChatMessages });
    
    console.log('✅ addMessage 완료, 새로운 메시지 추가됨');
    
    // 스토어 상태 재확인
    setTimeout(() => {
      const newState = get();
      const newMessages = newState.chatMessages.get(chatRoomId) || [];
      console.log('🔍 addMessage 후 스토어 확인:', { 
        roomId: chatRoomId,
        messageCount: newMessages.length,
        lastMessage: newMessages[newMessages.length - 1]?.content 
      });
    }, 100);
    
    // 읽지 않은 메시지 개수 업데이트
    if (message.chatMessageStatus === 'UNREAD' && message.sender !== 'currentUser') {
      const currentCount = state.unreadCounts.get(chatRoomId) || 0;
      const updatedUnreadCounts = new Map(state.unreadCounts);
      updatedUnreadCounts.set(chatRoomId, currentCount + 1);
      set({ unreadCounts: updatedUnreadCounts });
    }
  },

  // 여러 메시지 로드 (이전 메시지 기록)
  loadMessages: (chatRoomId: string, messages: ChatMessage[]) => {
    console.log('🔍 loadMessages 호출됨:', { chatRoomId, messageCount: messages.length });
    const state = get();
    console.log('🔍 현재 스토어 상태:', { 
      chatMessagesSize: state.chatMessages.size,
      currentRoomMessages: state.chatMessages.get(chatRoomId)?.length || 0
    });
    
    const updatedChatMessages = new Map(state.chatMessages);
    
    // 중복 제거: ID 기준으로 유니크한 메시지만 필터링
    const uniqueMessages = messages.filter((message, index, array) => {
      // ID가 유니크한지 확인
      const firstIndex = array.findIndex(m => m.id === message.id);
      if (firstIndex !== index) {
        console.log('⚠️ loadMessages에서 중복 ID 감지:', { 
          id: message.id, 
          content: message.content.substring(0, 20) 
        });
        return false;
      }
      
      // 내용+시간+발신자 조합으로도 중복 체크
      const duplicateByContent = array.findIndex(m => 
        m.content === message.content && 
        m.messageTime === message.messageTime && 
        m.sender === message.sender
      );
      
      if (duplicateByContent !== index) {
        console.log('⚠️ loadMessages에서 내용 기반 중복 감지:', { 
          content: message.content.substring(0, 20),
          sender: message.sender,
          time: message.messageTime
        });
        return false;
      }
      
      return true;
    });
    
    // 시간순으로 정렬 (오래된 순서대로)
    const sortedMessages = uniqueMessages.sort((a, b) => 
      new Date(a.messageTime).getTime() - new Date(b.messageTime).getTime()
    );
    
    console.log('🔄 정렬된 유니크 메시지들:', sortedMessages.map(m => ({ id: m.id, content: m.content, time: m.messageTime })));
    
    updatedChatMessages.set(chatRoomId, sortedMessages);
    set({ chatMessages: updatedChatMessages });
    
    console.log(`📝 ${chatRoomId}에 ${uniqueMessages.length}개 유니크 메시지 로드됨 (원본: ${messages.length}개)`);
    console.log('🔍 스토어 업데이트 후:', { 
      newSize: updatedChatMessages.size,
      newRoomMessages: updatedChatMessages.get(chatRoomId)?.length || 0
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