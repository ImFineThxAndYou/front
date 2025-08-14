
'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from '../../../lib/hooks/useChat';
import { useUIStore } from '../../../lib/stores/ui';
import { useTranslation } from '../../../lib/hooks/useTranslation';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

interface ChatRoomProps {
  roomId: string;
}

export default function ChatRoom({ roomId }: ChatRoomProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const { t } = useTranslation('chat');

  const {
    currentChatRoom,
    currentMessages,
    joinChatRoom,
    leaveChatRoom,
    sendMessage,
    markAsRead,
    isConnected
  } = useChat();

  const { showToast } = useUIStore();

  // 채팅방 입장/퇴장
  useEffect(() => {
    if (roomId && isConnected) {
      joinChatRoom(roomId);
    }
    
    return () => {
      if (roomId) {
        leaveChatRoom(roomId);
      }
    };
  }, [roomId, isConnected, joinChatRoom, leaveChatRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  useEffect(() => {
    // 메시지를 읽음으로 표시
    if (roomId && currentMessages.length > 0) {
      markAsRead(roomId);
    }
  }, [roomId, currentMessages, markAsRead]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollButton(false);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    sendMessage(content);
  };

  if (!isConnected) {
    return (
      <div 
        className="h-full flex items-center justify-center"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <div className="text-center">
          <div className="text-4xl mb-4">🔌</div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            WebSocket 연결 중...
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            채팅 서버에 연결하고 있습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Header */}
      <ChatHeader roomId={roomId} />

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4 relative scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
        onScroll={handleScroll}
        style={{ 
          minHeight: 0,
          maxHeight: 'calc(100vh - 200px)'
        }}
      >
        {/* Background Pattern for Messages */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px'
          }}
        />

        {currentMessages.length === 0 ? (
          <div 
            className="flex items-center justify-center h-full min-h-96 relative z-10"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <div className="text-center">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border shadow-lg"
                style={{ 
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border-secondary)'
                }}
              >
                <i className="ri-chat-smile-2-line text-3xl text-indigo-500"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                대화를 시작해보세요!
              </h3>
              <p className="text-sm mb-4">첫 메시지를 보내서 인사해보세요.</p>
              <div 
                className="inline-flex items-center px-4 py-2 rounded-full text-xs border"
                style={{
                  backgroundColor: 'var(--surface-tertiary)',
                  borderColor: 'var(--border-secondary)',
                  color: 'var(--text-secondary)'
                }}
              >
                <i className="ri-lightbulb-line mr-2"></i>
                💡 메시지를 길게 눌러 번역하고 단어장에 추가하세요
              </div>
            </div>
          </div>
        ) : (
          <div className="relative z-10">
            {currentMessages.map((message, index) => {
              const isLastMessage = index === currentMessages.length - 1;
              const isFromSameUser = index > 0 && currentMessages[index - 1].sender === message.sender;
              const timeDiff = index > 0 ? new Date(message.messageTime).getTime() - new Date(currentMessages[index - 1].messageTime).getTime() : 0;
              const showTimestamp = !isFromSameUser || timeDiff > 300000; // 5 minutes

              return (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isOwn={message.sender === 'currentUser'}
                  showAvatar={!isFromSameUser || showTimestamp}
                  showTimestamp={showTimestamp}
                  participant={{
                    id: message.sender,
                    nickname: message.sender === 'currentUser' ? '나' : message.sender,
                    avatar: '',
                    isOnline: true
                  }}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-32 right-8 w-12 h-12 text-white rounded-full shadow-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-300 z-50 backdrop-blur-sm border-2 border-white/20"
            style={{ 
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--info) 100%)'
            }}
          >
            <i className="ri-arrow-down-line text-lg"></i>
          </button>
        )}
      </div>

      {/* Input Area */}
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
}
