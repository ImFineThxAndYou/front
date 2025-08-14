
'use client';

import { useEffect, useRef } from 'react';

interface NotificationsPanelProps {
  onClose: () => void;
}

const mockNotifications = [
  {
    id: '1',
    type: 'chat_request',
    title: '새로운 채팅 요청',
    message: '민수님이 채팅을 요청했습니다.',
    time: '5분 전',
    unread: true,
    avatar: 'https://readdy.ai/api/search-image?query=friendly%20korean%20male%20student%20avatar%20profile%20picture%20smiling%2C%20modern%20flat%20illustration%20style%2C%20warm%20colors&width=40&height=40&seq=avatar2&orientation=squarish'
  },
  {
    id: '2',
    type: 'word_added',
    title: '새 단어 추가',
    message: '"Beautiful" 단어가 단어장에 추가되었습니다.',
    time: '1시간 전',
    unread: true,
    avatar: null
  },
  {
    id: '3',
    type: 'quiz_complete',
    title: '퀴즈 완료',
    message: '영어 퀴즈에서 85점을 받았습니다!',
    time: '2시간 전',
    unread: false,
    avatar: null
  }
];

export default function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'chat_request':
        return 'ri-chat-3-line';
      case 'word_added':
        return 'ri-book-line';
      case 'quiz_complete':
        return 'ri-trophy-line';
      default:
        return 'ri-notification-line';
    }
  };

  const getNotificationIconColor = (type: string) => {
    switch (type) {
      case 'chat_request':
        return 'var(--info)';
      case 'word_added':
        return 'var(--success)';
      case 'quiz_complete':
        return 'var(--warning)';
      default:
        return 'var(--text-tertiary)';
    }
  };

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-80 backdrop-blur-xl rounded-2xl shadow-2xl border z-[100] overflow-hidden theme-transition"
      style={{
        backgroundColor: 'var(--surface-primary)',
        borderColor: 'var(--border-primary)',
        boxShadow: 'var(--shadow-xl)'
      }}
    >
      {/* Gradient overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          background: `linear-gradient(to bottom, var(--surface-secondary) 0%, transparent 100%)`
        }}
      />
      
      <div 
        className="p-4 border-b relative z-10"
        style={{
          borderColor: 'var(--border-secondary)'
        }}
      >
        <div className="flex items-center justify-between">
          <h3 
            className="font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            알림
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer transition-colors hover:opacity-70"
            style={{ color: 'var(--text-secondary)' }}
          >
            <i className="ri-close-line"></i>
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto relative z-10">
        {mockNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 border-b transition-colors cursor-pointer ${
              notification.unread ? 'opacity-90' : ''
            }`}
            style={{
              borderColor: 'var(--border-tertiary)',
              backgroundColor: notification.unread ? 'var(--surface-secondary)' : 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = notification.unread ? 'var(--surface-secondary)' : 'transparent';
            }}
          >
            <div className="flex items-start space-x-3">
              {notification.avatar ? (
                <img
                  src={notification.avatar}
                  alt="아바타"
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 flex items-center justify-center">
                  <i 
                    className={`${getNotificationIcon(notification.type)} text-lg`}
                    style={{ color: getNotificationIconColor(notification.type) }}
                  ></i>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p 
                    className="font-medium text-sm truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {notification.title}
                  </p>
                  {notification.unread && (
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--info)' }}
                    ></div>
                  )}
                </div>
                <p 
                  className="text-sm line-clamp-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {notification.message}
                </p>
                <p 
                  className="text-xs mt-1"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {notification.time}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div 
        className="p-4 border-t relative z-10"
        style={{
          borderColor: 'var(--border-secondary)'
        }}
      >
        <button 
          className="w-full text-center text-sm cursor-pointer whitespace-nowrap transition-colors hover:opacity-70"
          style={{ color: 'var(--info)' }}
        >
          모든 알림 보기
        </button>
      </div>
    </div>
  );
}
