
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import MainLayout from '../components/layout/MainLayout';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatRoom from '../components/chat/ChatRoom';
import ChatEmptyState from '../components/chat/ChatEmptyState';
import { ChatRoomSummaryResponse } from '../../lib/types/chat';
import { chatService } from '../../lib/services/chatService';
import { useAuthStore } from '../../lib/stores/auth';
import { useChatStore } from '../../lib/stores/chat';
import Toast from '../components/ui/Toast';

type ViewMode = 'rooms' | 'requests';

interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  chatRoomId?: string;
  opponentName?: string;
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { 
    setCurrentChatRoom,
    connectWebSocket, 
    isConnected, 
    isConnecting, 
    connectionError,
    chatRooms,
    loadChatRooms
  } = useChatStore();

  // 채팅방 목록 상태를 useChatStore에서 가져오기
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomSummaryResponse | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('rooms');
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // 채팅방 목록 로드
  const loadRooms = async () => {
    try {
      setLoading(true);
      await loadChatRooms();
    } catch (error) {
      console.error('채팅방 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 채팅방 목록 로드 - 페이지 진입 시 한 번만
  useEffect(() => {
    loadRooms();
  }, []);

  // URL 쿼리 파라미터에서 room ID를 읽어서 자동으로 채팅방 선택
  useEffect(() => {
    const roomId = searchParams.get('room');
    if (roomId && chatRooms && chatRooms.length > 0 && !selectedRoom) {
      const room = chatRooms.find(r => r.chatRoomId === roomId);
      if (room) {
        console.log('🔗 URL에서 채팅방 자동 선택:', roomId);
        setSelectedRoom(room);
        setCurrentChatRoom(roomId);
        // URL에서 room 쿼리 파라미터 제거
        const url = new URL(window.location.href);
        url.searchParams.delete('room');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [searchParams, chatRooms, selectedRoom, setCurrentChatRoom]);

  // 채팅방 목록 로드 완료 후 URL 파라미터 처리
  useEffect(() => {
    if (!loading && chatRooms && chatRooms.length > 0) {
      const roomId = searchParams.get('room');
      if (roomId && !selectedRoom) {
        const room = chatRooms.find(r => r.chatRoomId === roomId);
        if (room) {
          console.log('🔗 채팅방 목록 로드 후 URL에서 채팅방 자동 선택:', roomId);
          setSelectedRoom(room);
          setCurrentChatRoom(roomId);
          // URL에서 room 쿼리 파라미터 제거
          const url = new URL(window.location.href);
          url.searchParams.delete('room');
          window.history.replaceState({}, '', url.toString());
        } else {
          // 채팅방이 존재하지 않는 경우 사용자에게 알림
          console.warn('⚠️ URL의 채팅방 ID가 존재하지 않음:', roomId);
          setToasts(prev => [...prev, {
            id: `toast-${Date.now()}`,
            message: `채팅방 ID ${roomId}를 찾을 수 없습니다.`,
            type: 'warning'
          }]);
          // URL에서 room 쿼리 파라미터 제거
          const url = new URL(window.location.href);
          url.searchParams.delete('room');
          window.history.replaceState({}, '', url.toString());
        }
      }
    }
  }, [loading, chatRooms, searchParams, selectedRoom, setCurrentChatRoom]);

  // 사용자 인증 시 WebSocket 연결 시도
  useEffect(() => {
    if (!user) {
      console.log('🔍 ChatPage: 사용자 정보 없음, 연결 시도 안함');
      return;
    }

    // 이미 연결 중이거나 연결된 경우 중복 시도 방지
    if (isConnected || isConnecting) {
      console.log('🔍 ChatPage: 이미 연결 중이거나 연결됨, 연결 시도 안함');
      return;
    }

    // /chat 페이지에서 WebSocket 연결 시도
    console.log('🔗 ChatPage: WebSocket 연결 시도');
    connectWebSocket();
  }, [user?.id]); // isConnected, isConnecting 의존성 제거하여 무한 루프 방지

  // 새 메시지 알림 처리
  useEffect(() => {
    const handleNewMessage = (event: CustomEvent) => {
      const { chatRoomId, opponentName, content } = event.detail;
      
      // 이미 선택된 채팅방이면 알림 표시하지 않음
      if (selectedRoom?.chatRoomId === chatRoomId) {
        return;
      }

      const toast: ToastNotification = {
        id: `toast-${Date.now()}`,
        message: `${opponentName}: ${content}`,
        type: 'info',
        chatRoomId,
        opponentName
      };

      setToasts(prev => [...prev, toast]);
    };

    // 커스텀 이벤트 리스너 등록
    window.addEventListener('newMessage' as any, handleNewMessage);

    return () => {
      window.removeEventListener('newMessage' as any, handleNewMessage);
    };
  }, [selectedRoom]);

  // 읽음 처리 함수
  const handleMarkAsRead = async (chatRoomId: string) => {
    try {
      await chatService.markMessagesAsRead(chatRoomId);
      // useChat의 updateUnreadCount 호출하여 unreadCount 업데이트
      // updateUnreadCount(chatRoomId, false); // This line was removed as per the new_code
    } catch (error) {
      console.error('읽음 처리 실패:', error);
    }
  };

  const handleRoomSelect = (roomUuid: string) => {
    const selectedRoom = chatRooms.find(room => room.chatRoomId === roomUuid);
    
    if (selectedRoom) {
      // PENDING 상태 채팅방 접근 제한
      if (selectedRoom.roomStatus === 'PENDING') {
        setToasts(prev => [...prev, {
          id: `toast-${Date.now()}`,
          message: '대기중인 채팅방입니다. 상대방이 수락해야 접근할 수 있습니다.',
          type: 'warning'
        }]);
        return;
      }
      
      setSelectedRoom(selectedRoom);
      console.log('채팅방 선택:', selectedRoom);
    }
  };

  const handleBackToRooms = () => {
    console.log('🔙 ChatPage: 채팅방 목록으로 돌아감');
    setSelectedRoom(null);
    // useChatStore와 동기화 - currentChatRoom 초기화
    setCurrentChatRoom(null);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    console.log('🔄 ChatPage: 보기 모드 변경:', mode);
    setViewMode(mode);
    setSelectedRoom(null);
    // useChatStore와 동기화 - currentChatRoom 초기화
    setCurrentChatRoom(null);
  };

  const handleRequestUpdate = () => {
    // 요청 상태가 변경되면 채팅방 목록 새로고침
    loadRooms();
  };

  const handleToastClick = async (toast: ToastNotification) => {
    if (toast.chatRoomId && chatRooms) {
      // 해당 채팅방 찾기
      const room = chatRooms.find(r => r.chatRoomId === toast.chatRoomId);
      if (room) {
        // 채팅방 선택
        handleRoomSelect(room.chatRoomId);
        
        // 읽음 처리
        try {
          await chatService.markMessagesAsRead(toast.chatRoomId);
          // useChat의 updateUnreadCount 호출하여 unreadCount 업데이트
          // updateUnreadCount(toast.chatRoomId, false); // This line was removed as per the new_code
        } catch (error) {
          console.error('읽음 처리 실패:', error);
        }
      }
    }
    
    // 토스트 제거
    removeToast(toast.id);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <>
      <MainLayout>
        <div 
          className="flex h-full"
          style={{
            background: `linear-gradient(135deg, 
              var(--bg-primary) 0%, 
              var(--bg-secondary) 25%, 
              var(--bg-tertiary) 50%, 
              var(--bg-secondary) 75%, 
              var(--bg-primary) 100%)`
          }}
        >
          {/* Chat Sidebar */}
          <div 
            className="w-80 border-r h-full flex-shrink-0 backdrop-blur-xl"
            style={{
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border-primary)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <ChatSidebar 
              selectedRoomUuid={selectedRoom?.chatRoomId}
              onRoomSelect={handleRoomSelect}
              loading={loading}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              onRequestUpdate={handleRequestUpdate}
            />
          </div>

          {/* Chat Content */}
          <div className="flex-1 flex flex-col h-full min-w-0 relative">
            {/* Background Pattern */}
            <div 
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, var(--accent-primary) 0%, transparent 50%),
                                radial-gradient(circle at 80% 20%, var(--accent-secondary) 0%, transparent 50%),
                                radial-gradient(circle at 40% 80%, var(--accent-tertiary) 0%, transparent 50%)`
              }}
            />
            
            {selectedRoom ? (
              <ChatRoom 
                key={selectedRoom.chatRoomId}
                roomUuid={selectedRoom.chatRoomId}
                opponentName={selectedRoom.opponentName}
                roomStatus={selectedRoom.roomStatus}
                onBack={handleBackToRooms}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center relative z-10 h-full">
                <div 
                  className="backdrop-blur-xl rounded-3xl p-12 border shadow-2xl max-w-lg mx-auto relative overflow-hidden"
                  style={{
                    backgroundColor: 'var(--surface-primary)',
                    borderColor: 'var(--border-primary)',
                    boxShadow: 'var(--shadow-xl)'
                  }}
                >
                  {/* Gradient overlay for the empty state card */}
                  <div 
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      background: 'var(--gradient-secondary)'
                    }}
                  />
                  <div className="relative z-10">
                    <ChatEmptyState />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </MainLayout>

      {/* 알림 토스트들 */}
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          index={index}
          onClose={() => removeToast(toast.id)}
          onClick={() => handleToastClick(toast)}
        />
      ))}
    </>
  );
}
