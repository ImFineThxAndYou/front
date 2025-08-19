import { useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../stores/auth';
import { useChatStore } from '../stores/chat';

export const useChat = () => {
  const { user } = useAuthStore();
  const { 
    isConnected, 
    isConnecting,
    connectionError,
    currentChatRoom, 
    chatRooms, 
    chatMessages,
    unreadCounts,
    isLoading,
    connectWebSocket: storeConnectWebSocket,
    disconnectWebSocket: storeDisconnectWebSocket,
    setCurrentChatRoom,
    joinChatRoom: storeJoinChatRoom,
    leaveChatRoom: storeLeaveChatRoom,
    sendMessage: storeSendMessage,
    markAsRead,
    clearConnectionError,
    loadChatRooms
  } = useChatStore();

  // 안정적인 함수 참조를 위한 ref
  const storeRefs = useRef({
    connectWebSocket: storeConnectWebSocket,
    disconnectWebSocket: storeDisconnectWebSocket,
    joinChatRoom: storeJoinChatRoom,
    leaveChatRoom: storeLeaveChatRoom,
    sendMessage: storeSendMessage
  });

  // store 함수들의 최신 참조 유지
  storeRefs.current = {
    connectWebSocket: storeConnectWebSocket,
    disconnectWebSocket: storeDisconnectWebSocket,
    joinChatRoom: storeJoinChatRoom,
    leaveChatRoom: storeLeaveChatRoom,
    sendMessage: storeSendMessage
  };

  // WebSocket 연결 - 완전히 안정화된 함수
  const connectWebSocket = useCallback(async () => {
    console.log('🔗 useChat: WebSocket 연결 시도');
    await storeRefs.current.connectWebSocket();
  }, []);

  // WebSocket 연결 해제 - 완전히 안정화된 함수
  const disconnectWebSocket = useCallback(() => {
    console.log('🔌 useChat: WebSocket 연결 해제');
    storeRefs.current.disconnectWebSocket();
  }, []);

  // 채팅방 입장 - 완전히 안정화된 함수
  const joinChatRoom = useCallback(async (chatRoomId: string) => {
    console.log('🔍 useChat: 채팅방 입장:', chatRoomId);
    
    try {
      // WebSocket 연결 확인 및 연결
      if (!isConnected && !isConnecting) {
        console.log('🔗 WebSocket 연결 필요, 연결 시도...');
        await connectWebSocket();
      }

      // 채팅방 입장
      await storeRefs.current.joinChatRoom(chatRoomId);
    } catch (error) {
      console.error('❌ useChat: 채팅방 입장 실패:', error);
    }
  }, [isConnected, isConnecting, connectWebSocket]);

  // 채팅방 나가기 - 완전히 안정화된 함수
  const leaveChatRoom = useCallback((chatRoomId: string) => {
    console.log('🚪 useChat: 채팅방 나가기:', chatRoomId);
    storeRefs.current.leaveChatRoom(chatRoomId);
  }, []);

  // 메시지 전송 - 완전히 안정화된 함수
  const sendMessage = useCallback(async (content: string) => {
    console.log('🔍 useChat: 메시지 전송, currentChatRoom:', currentChatRoom);
    
    if (!currentChatRoom) {
      console.error('❌ 현재 채팅방이 없습니다.');
      return;
    }

    if (!content.trim()) {
      console.warn('⚠️ 빈 메시지는 전송할 수 없습니다.');
      return;
    }

    try {
      await storeRefs.current.sendMessage(currentChatRoom, content);
      console.log('✅ 메시지 전송 성공');
    } catch (error) {
      console.error('❌ 메시지 전송 실패:', error);
    }
  }, [currentChatRoom]);

  // 자동 연결 제거 - 채팅 페이지에서만 수동으로 연결
  // useEffect(() => {
  //   console.log('🔍 useChat useEffect 실행:', {
  //     hasUser: !!user,
  //     userId: user?.id,
  //     isConnected,
  //     isConnecting,
  //     shouldConnect: user && !isConnected && !isConnecting
  //   });
  //   
  //   if (user && !isConnected && !isConnecting) {
  //     console.log('🔗 useChat: 사용자 인증됨, WebSocket 연결 시도');
  //     connectWebSocket();
  //   }
  // }, [user?.id, connectWebSocket]); // user.id만 의존성으로 사용

  // 현재 채팅방의 메시지들
  const currentMessages = currentChatRoom ? chatMessages.get(currentChatRoom) || [] : [];
  
  // 메시지 변경 디버깅
  useEffect(() => {
    console.log('🔍 useChat currentMessages 변경됨:', { 
      currentChatRoom, 
      messageCount: currentMessages.length,
      messages: currentMessages.map(m => ({ id: m.id, content: m.content, sender: m.sender }))
    });
  }, [currentMessages, currentChatRoom]);

  // 현재 채팅방의 읽지 않은 메시지 개수
  const currentUnreadCount = currentChatRoom ? unreadCounts.get(currentChatRoom) || 0 : 0;

  // 전체 읽지 않은 메시지 개수
  const totalUnreadCount = Array.from(unreadCounts.values()).reduce((sum, count) => sum + count, 0);

  return {
    // 연결 상태
    isConnected,
    isConnecting,
    connectionError,
    
    // 채팅방 상태
    currentChatRoom,
    chatRooms,
    currentMessages,
    isLoading,
    
    // 메시지 상태
    unreadCounts,
    currentUnreadCount,
    totalUnreadCount,
    
    // 액션 (모두 안정화된 함수)
    connectWebSocket,
    disconnectWebSocket,
    setCurrentChatRoom,
    joinChatRoom,
    leaveChatRoom,
    sendMessage,
    markAsRead,
    clearConnectionError,
    loadChatRooms
  };
};
