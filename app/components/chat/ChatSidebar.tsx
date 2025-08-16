
'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '../../../lib/hooks/useTranslation';
import ChatRoomItem from './ChatRoomItem';
import ChatRequestList from './ChatRequestList';
import { ChatRoomSummaryResponse } from '../../../lib/types/chat';
import { chatService } from '../../../lib/services/chatService';

type ViewMode = 'rooms' | 'requests';

interface ChatSidebarProps {
  rooms: ChatRoomSummaryResponse[];
  selectedRoom: ChatRoomSummaryResponse | null;
  viewMode: ViewMode;
  onRoomSelect: (room: ChatRoomSummaryResponse) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onRequestUpdate: () => void;
  loading: boolean;
}

export default function ChatSidebar({ 
  rooms, 
  selectedRoom, 
  viewMode, 
  onRoomSelect, 
  onViewModeChange,
  onRequestUpdate,
  loading 
}: ChatSidebarProps) {
  const { t } = useTranslation('chat');
  const [pendingRequestCount, setPendingRequestCount] = useState(0);

  // 받은 채팅 요청 개수 로드
  useEffect(() => {
    const loadPendingCount = async () => {
      try {
        const requests = await chatService.getMyReceivedChatRequests();
        const pendingCount = requests.filter(req => req.roomStatus === 'PENDING').length;
        setPendingRequestCount(pendingCount);
      } catch (error) {
        console.error('받은 채팅 요청 로드 실패:', error);
      }
    };

    loadPendingCount();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        {/* Header Skeleton */}
        <div 
          className="p-6 border-b backdrop-blur-sm"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <div 
            className="h-8 rounded-xl animate-pulse mb-4"
            style={{ backgroundColor: 'var(--surface-tertiary)' }}
          ></div>
          <div 
            className="flex rounded-2xl p-1"
            style={{ backgroundColor: 'var(--surface-secondary)' }}
          >
            <div 
              className="flex-1 h-10 rounded-xl animate-pulse"
              style={{ backgroundColor: 'var(--surface-tertiary)' }}
            ></div>
          </div>
        </div>
        
        {/* Chat List Skeleton */}
        <div className="flex-1 p-4">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-3 rounded-2xl">
                <div 
                  className="w-12 h-12 rounded-full animate-pulse"
                  style={{ backgroundColor: 'var(--surface-tertiary)' }}
                ></div>
                <div className="flex-1">
                  <div 
                    className="h-4 rounded animate-pulse mb-2"
                    style={{ backgroundColor: 'var(--surface-tertiary)' }}
                  ></div>
                  <div 
                    className="h-3 rounded animate-pulse w-3/4"
                    style={{ backgroundColor: 'var(--surface-tertiary)' }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Header with Gradient */}
      <div 
        className="p-6 border-b backdrop-blur-sm relative"
        style={{ borderColor: 'var(--border-primary)' }}
      >
        {/* Gradient Background */}
        <div 
          className="absolute inset-0 opacity-50 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, 
              var(--surface-secondary) 0%, 
              transparent 100%)`
          }}
        />
        
        <div className="relative z-10">
          <h1 
            className="text-2xl font-bold mb-4"
            style={{
              background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary), var(--accent-tertiary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            메시지
          </h1>
          
          {/* Enhanced Tab Switcher */}
          <div 
            className="flex rounded-2xl p-1 backdrop-blur-sm border"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border-secondary)'
            }}
          >
            <button
              onClick={() => onViewModeChange('rooms')}
              className={`flex-1 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden ${
                viewMode === 'rooms'
                  ? 'text-white shadow-lg transform scale-105'
                  : ''
              } whitespace-nowrap cursor-pointer`}
              style={{
                backgroundColor: viewMode === 'rooms' 
                  ? 'transparent' 
                  : 'transparent',
                color: viewMode === 'rooms' 
                  ? '#ffffff' 
                  : 'var(--text-secondary)'
              }}
            >
              {viewMode === 'rooms' && (
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl" />
              )}
              <span className="relative z-10 flex items-center justify-center">
                <i className="ri-chat-3-line mr-2"></i>
                채팅
              </span>
            </button>
            
            <button
              onClick={() => onViewModeChange('requests')}
              className={`flex-1 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden ${
                viewMode === 'requests'
                  ? 'text-white shadow-lg transform scale-105'
                  : ''
              } whitespace-nowrap cursor-pointer`}
              style={{
                backgroundColor: viewMode === 'requests' 
                  ? 'transparent' 
                  : 'transparent',
                color: viewMode === 'requests' 
                  ? '#ffffff' 
                  : 'var(--text-secondary)'
              }}
            >
              {viewMode === 'requests' && (
                <div 
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'var(--gradient-secondary)' }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center">
                <i className="ri-user-add-line mr-2"></i>
                요청
                {pendingRequestCount > 0 && (
                  <span 
                    className="ml-2 w-5 h-5 text-xs rounded-full flex items-center justify-center animate-pulse"
                    style={{
                      backgroundColor: 'var(--accent-danger)',
                      color: 'var(--text-on-accent)'
                    }}
                  >
                    {pendingRequestCount}
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {viewMode === 'rooms' && (
          <div className="p-2">
            {rooms.length === 0 ? (
              <div 
                className="p-8 text-center rounded-2xl m-4 border"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border-secondary)',
                  color: 'var(--text-tertiary)'
                }}
              >
                <div 
                  className="w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4"
                  style={{ backgroundColor: 'var(--surface-tertiary)' }}
                >
                  <i className="ri-chat-3-line text-2xl"></i>
                </div>
                <p className="text-sm font-medium mb-2">채팅방이 없습니다</p>
                <p className="text-xs">새로운 대화를 시작해보세요</p>
              </div>
            ) : (
              <div className="space-y-1">
                {rooms.map((room) => (
                  <ChatRoomItem
                    key={room.chatRoomId}
                    room={room}
                    isActive={selectedRoom?.chatRoomId === room.chatRoomId}
                    onClick={() => onRoomSelect(room)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        {viewMode === 'requests' && (
          <div className="p-2">
            <ChatRequestList onRequestUpdate={onRequestUpdate} />
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div 
        className="p-4 border-t backdrop-blur-sm"
        style={{ borderColor: 'var(--border-primary)' }}
      >
        <div 
          className="flex items-center justify-between text-xs rounded-xl p-3"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            color: 'var(--text-tertiary)'
          }}
        >
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span>활성 채팅 {rooms.length}개</span>
          </div>
          <div className="flex items-center">
            <i className="ri-notification-line mr-1"></i>
            <span>새 요청 {pendingRequestCount}개</span>
          </div>
        </div>
      </div>
    </div>
  );
}
