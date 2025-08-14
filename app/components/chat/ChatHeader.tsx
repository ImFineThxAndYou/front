
'use client';

import { useState } from 'react';
import { useUIStore } from '../../../lib/stores/ui';
import { useTranslation } from '../../../lib/hooks/useTranslation';

interface ChatHeaderProps {
  roomId: string;
}

export default function ChatHeader({ roomId }: ChatHeaderProps) {
  const { showToast } = useUIStore();
  const { t } = useTranslation('chat');
  const [showMenu, setShowMenu] = useState(false);

  // 임시 참가자 정보 (실제로는 API에서 가져와야 함)
  const participant = {
    id: 'otherUser',
    nickname: '채팅 상대',
    avatar: '',
    isOnline: true,
    lastSeen: null
  };

  const getStatusText = () => {
    if (participant.isOnline) return t('status.online');
    if (participant.lastSeen) {
      const diff = new Date().getTime() - participant.lastSeen.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return t('status.justNowAccess');
      if (minutes < 60) return `${minutes}${t('status.minutesAgoAccess')}`;
      if (hours < 24) return `${hours}${t('status.hoursAgoAccess')}`;
      return `${days}${t('status.daysAgoAccess')}`;
    }
    return t('status.offline');
  };

  const handleLeaveRoom = async () => {
    showToast({
      message: '채팅방을 나갔습니다.',
      type: 'info'
    });
    setShowMenu(false);
  };

  const handleBlockUser = () => {
    showToast({
      message: t('toast.userBlocked'),
      type: 'info'
    });
    setShowMenu(false);
  };

  const handleMuteNotifications = () => {
    showToast({
      message: t('toast.notificationsMuted'),
      type: 'info'
    });
    setShowMenu(false);
  };

  return (
    <div 
      className="backdrop-blur-xl border-b px-6 py-4 relative"
      style={{
        backgroundColor: 'var(--surface-primary)',
        borderColor: 'var(--border-primary)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {/* Gradient overlay */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `linear-gradient(to right, 
            var(--surface-secondary) 0%, 
            transparent 100%)`
        }}
      />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-4">
          {/* Enhanced Avatar */}
          <div className="relative">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white/20"
              style={{
                background: `linear-gradient(135deg, 
                  ${participant.isOnline ? '#10b981' : '#6b7280'} 0%, 
                  ${participant.isOnline ? '#059669' : '#4b5563'} 100%)`
              }}
            >
              {participant.nickname.charAt(0).toUpperCase()}
            </div>

            {/* Online Status Indicator */}
            <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 border-2 border-white rounded-full ${
              participant.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`}></div>

            {/* Typing Indicator (when active) */}
            {participant.isOnline && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
            )}
          </div>

          <div className="min-w-0">
            <h2 
              className="text-xl font-bold truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {participant.nickname}
            </h2>
            <div className="flex items-center space-x-2">
              <p 
                className={`text-sm font-medium ${
                  participant.isOnline ? 'text-green-600' : ''
                }`}
                style={{
                  color: participant.isOnline ? '#059669' : 'var(--text-tertiary)'
                }}
              >
                {getStatusText()}
              </p>

              {/* Language Badges */}
              <div className="flex space-x-1">
                <span 
                  className="px-2 py-1 text-xs rounded-full border"
                  style={{
                    backgroundColor: 'var(--surface-tertiary)',
                    borderColor: 'var(--border-secondary)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  한국어
                </span>
                <span 
                  className="px-2 py-1 text-xs rounded-full border"
                  style={{
                    backgroundColor: 'var(--surface-tertiary)',
                    borderColor: 'var(--border-secondary)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  English
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Voice Call */}
          <button
            className="w-10 h-10 rounded-xl backdrop-blur-sm flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-110 border"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border-secondary)',
              color: 'var(--text-secondary)'
            }}
          >
            <i className="ri-phone-line text-lg"></i>
          </button>

          {/* Video Call */}
          <button
            className="w-10 h-10 rounded-xl backdrop-blur-sm flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-110 border"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border-secondary)',
              color: 'var(--text-secondary)'
            }}
          >
            <i className="ri-vidicon-line text-lg"></i>
          </button>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 rounded-xl backdrop-blur-sm flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-110 border"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border-secondary)',
                color: 'var(--text-secondary)'
              }}
            >
              <i className="ri-more-line text-lg"></i>
            </button>

            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowMenu(false)}
                />
                <div 
                  className="absolute right-0 top-full mt-2 w-56 backdrop-blur-xl rounded-2xl border py-2 z-50 shadow-2xl"
                  style={{
                    backgroundColor: 'var(--surface-primary)',
                    borderColor: 'var(--border-primary)'
                  }}
                >
                  <button
                    onClick={handleMuteNotifications}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-opacity-50 transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <i className="ri-notification-off-line mr-3 text-lg"></i>
                    알림 음소거
                  </button>

                  <button
                    onClick={handleBlockUser}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-opacity-50 transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <i className="ri-user-forbid-line mr-3 text-lg"></i>
                    사용자 차단
                  </button>

                  <div 
                    className="border-t my-2 mx-4"
                    style={{ borderColor: 'var(--border-secondary)' }}
                  ></div>

                  <button
                    onClick={handleLeaveRoom}
                    className="w-full px-4 py-3 text-left text-sm transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center"
                    style={{ color: 'var(--error)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <i className="ri-logout-circle-line mr-3 text-lg"></i>
                    채팅방 나가기
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
