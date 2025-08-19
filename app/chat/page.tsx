
'use client';

import { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatRoom from '../components/chat/ChatRoom';
import ChatEmptyState from '../components/chat/ChatEmptyState';
import { ChatRoomSummaryResponse } from '../../lib/types/chat';
import { chatService } from '../../lib/services/chatService';
import { useAuthStore } from '../../lib/stores/auth';
import { useChatStore } from '../../lib/stores/chat';
import { useChat } from '../../lib/hooks/useChat';

type ViewMode = 'rooms' | 'requests';

export default function ChatPage() {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomSummaryResponse | null>(null);
  const [rooms, setRooms] = useState<ChatRoomSummaryResponse[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('rooms');
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const { setCurrentChatRoom } = useChatStore();
  const { connectWebSocket, isConnected, isConnecting } = useChat();

  // 채팅방 목록 로드
  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await chatService.getMyChatRooms();
      setRooms(data);
    } catch (error) {
      console.error('채팅방 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 채팅방 목록 로드 - 페이지 진입 시 한 번만
  useEffect(() => {
    loadRooms();
  }, []); // 빈 의존성 배열 - 페이지 진입 시 한 번만 실행

  const handleRoomSelect = (room: ChatRoomSummaryResponse) => {
    console.log('🎯 ChatPage: 채팅방 선택됨:', room.chatRoomId);
    setSelectedRoom(room);
    // useChatStore와 동기화 - 즉시 currentChatRoom 설정
    setCurrentChatRoom(room.chatRoomId);
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

  return (
    <MainLayout>
      <div 
        className="flex h-full theme-transition"
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
          className="w-80 border-r h-full flex-shrink-0 backdrop-blur-xl theme-transition"
          style={{
            backgroundColor: 'var(--surface-primary)',
            borderColor: 'var(--border-primary)',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <ChatSidebar 
            rooms={rooms}
            selectedRoom={selectedRoom}
            viewMode={viewMode}
            onRoomSelect={handleRoomSelect}
            onViewModeChange={handleViewModeChange}
            onRequestUpdate={handleRequestUpdate}
            loading={loading}
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
              onBack={handleBackToRooms}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center relative z-10 h-full">
              <div 
                className="backdrop-blur-xl rounded-3xl p-12 border shadow-2xl max-w-lg mx-auto relative overflow-hidden theme-transition"
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
  );
}
