
'use client';

import { useState, useEffect } from 'react';
import { useChat } from '../../../lib/hooks/useChat';
import { useTranslation } from '../../../lib/hooks/useTranslation';
import ChatRoomItem from './ChatRoomItem';
import ChatRequestList from './ChatRequestList';
import { chatService } from '../../../lib/services/chatService';
import { ChatRequestSummary } from '../../../lib/types/chatRequest';

interface ChatSidebarProps {
  selectedRoomId: string | null;
  onRoomSelect: (roomId: string) => void;
}

export default function ChatSidebar({ selectedRoomId, onRoomSelect }: ChatSidebarProps) {
  const { t } = useTranslation('chat');
  const {
    isConnected,
    isConnecting
  } = useChat();

  const [activeTab, setActiveTab] = useState<'chats' | 'requests'>('chats');
  const [receivedRequests, setReceivedRequests] = useState<ChatRequestSummary[]>([]);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);

  // API에서 채팅방 목록 가져오기
  const { chatRooms, isLoading: isLoadingRooms } = useChat();

  // 받은 채팅 요청 목록 로드
  useEffect(() => {
    if (activeTab === 'requests') {
      loadReceivedRequests();
    }
  }, [activeTab]);

  const loadReceivedRequests = async () => {
    try {
      const requests = await chatService.getMyReceivedChatRequests();
      setReceivedRequests(requests);
      // PENDING 상태인 요청 개수 계산
      const pendingCount = requests.filter(req => req.roomStatus === 'PENDING').length;
      setPendingRequestCount(pendingCount);
    } catch (error) {
      console.error('받은 채팅 요청 로드 실패:', error);
    }
  };

  // 채팅 요청 업데이트 후 처리
  const handleRequestUpdate = async () => {
    await loadReceivedRequests();
    // 채팅방 목록도 새로고침
    await loadChatRooms();
    // 채팅 탭으로 전환
    setActiveTab('chats');
  };

  if (isLoadingRooms) {
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
              onClick={() => setActiveTab('chats')}
              className={`flex-1 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden ${
                activeTab === 'chats'
                  ? 'text-white shadow-lg transform scale-105'
                  : ''
              } whitespace-nowrap cursor-pointer`}
              style={{
                backgroundColor: activeTab === 'chats' 
                  ? 'transparent' 
                  : 'transparent',
                color: activeTab === 'chats' 
                  ? '#ffffff' 
                  : 'var(--text-secondary)'
              }}
            >
              {activeTab === 'chats' && (
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl" />
              )}
              <span className="relative z-10 flex items-center justify-center">
                <i className="ri-chat-3-line mr-2"></i>
                {t('chatList')}
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden ${
                activeTab === 'requests'
                  ? 'text-white shadow-lg transform scale-105'
                  : ''
              } whitespace-nowrap cursor-pointer`}
              style={{
                backgroundColor: activeTab === 'requests' 
                  ? 'transparent' 
                  : 'transparent',
                color: activeTab === 'requests' 
                  ? '#ffffff' 
                  : 'var(--text-secondary)'
              }}
            >
              {activeTab === 'requests' && (
                <div 
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'var(--gradient-secondary)' }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center">
                <i className="ri-user-add-line mr-2"></i>
                {t('newRequests')}
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
        {activeTab === 'chats' ? (
          <div className="p-2">
            {chatRooms.length === 0 ? (
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
                <p className="text-xs">백엔드 API에서 데이터를 불러오는 중입니다</p>
              </div>
            ) : (
              <div className="space-y-1">
                {chatRooms.map((room) => (
                  <ChatRoomItem
                    key={room.chatRoomId}
                    room={room}
                    isActive={selectedRoomId === room.chatRoomId}
                    onClick={() => onRoomSelect(room.chatRoomId)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-2">
            <ChatRequestList 
              type="received" 
              onRequestUpdate={handleRequestUpdate}
              onRoomSelect={onRoomSelect}
            />
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
            <span>활성 채팅 {chatRooms.length}개</span>
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
