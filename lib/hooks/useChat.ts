import { useEffect, useCallback } from 'react';
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
    connectWebSocket,
    disconnectWebSocket,
    setCurrentChatRoom,
    joinChatRoom,
    leaveChatRoom,
    sendMessage,
    markAsRead,
    clearConnectionError,
    loadChatRooms
  } = useChatStore();

  // 사용자 인증 시 자동 WebSocket 연결
  useEffect(() => {
    if (user && !isConnected && !isConnecting) {
      connectWebSocket();
    }
  }, [user, isConnected, isConnecting, connectWebSocket]);

  // 컴포넌트 언마운트 시 연결 해제
  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnectWebSocket();
      }
    };
  }, [isConnected, disconnectWebSocket]);

  // 채팅방 입장
  const handleJoinChatRoom = useCallback(async (chatRoomId: string) => {
    if (!isConnected) {
      console.error('WebSocket이 연결되지 않았습니다.');
      return;
    }

    try {
      await joinChatRoom(chatRoomId);
    } catch (error) {
      console.error('채팅방 입장 실패:', error);
    }
  }, [isConnected, joinChatRoom]);

  // 채팅방 나가기
  const handleLeaveChatRoom = useCallback((chatRoomId: string) => {
    leaveChatRoom(chatRoomId);
  }, [leaveChatRoom]);

  // 메시지 전송
  const handleSendMessage = useCallback(async (content: string) => {
    if (!currentChatRoom) {
      console.error('현재 채팅방이 없습니다.');
      return;
    }

    if (!content.trim()) {
      return;
    }

    try {
      await sendMessage(currentChatRoom, content);
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    }
  }, [currentChatRoom, sendMessage]);

  // 현재 채팅방의 메시지들
  const currentMessages = currentChatRoom ? chatMessages.get(currentChatRoom) || [] : [];

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
    
    // 액션
    connectWebSocket,
    disconnectWebSocket,
    setCurrentChatRoom,
    joinChatRoom: handleJoinChatRoom,
    leaveChatRoom: handleLeaveChatRoom,
    sendMessage: handleSendMessage,
    markAsRead,
    clearConnectionError,
    loadChatRooms
  };
};
