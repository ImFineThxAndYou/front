
'use client';

import { useState } from 'react';
import { useAuthStore } from '../../../lib/stores/auth';
import { useUIStore } from '../../../lib/stores/ui';
import { useTranslation } from '../../../lib/hooks/useTranslation';
import NotificationsPanel from './NotificationsPanel';
import Avatar from '../ui/Avatar';
import { useNotification } from '../../../lib/hooks/useNotification';
import { useChat } from '../../../lib/hooks/useChat';
import NotificationList from '../ui/NotificationList';

interface TopBarProps {
  onMenuClick?: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { user, logout } = useAuthStore();
  const { theme, setTheme, language, setLanguage } = useUIStore();
  const { t } = useTranslation('common');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { isConnected, isConnecting, connectionError, notifications, unreadCount } = useNotification();
  const { isConnected: isChatConnected, isConnecting: isChatConnecting, connectionError: chatConnectionError } = useChat();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'ko' ? 'en' : 'ko';
    console.log('TopBar - Toggling language from', language, 'to', newLanguage);
    setLanguage(newLanguage);
  };

  // SSE 연결 상태에 따른 아이콘과 색상 결정
  const getSSEStatusIcon = () => {
    if (isConnecting || isChatConnecting) {
      return {
        icon: 'ri-loader-4-line',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500',
        tooltip: '연결 중...'
      };
    } else if (isConnected && isChatConnected) {
      return {
        icon: 'ri-wifi-line',
        color: 'text-green-500',
        bgColor: 'bg-green-500',
        tooltip: '모든 연결됨'
      };
    } else if (isConnected || isChatConnected) {
      return {
        icon: 'ri-wifi-line',
        color: 'text-orange-500',
        bgColor: 'bg-orange-500',
        tooltip: '부분 연결됨'
      };
    } else {
      return {
        icon: 'ri-wifi-off-line',
        color: 'text-red-500',
        bgColor: 'bg-red-500',
        tooltip: (connectionError || chatConnectionError) || '연결 끊김'
      };
    }
  };

  const sseStatus = getSSEStatusIcon();

  return (
    <header 
      className="backdrop-blur-xl border-b px-8 relative z-50 transition-all duration-300 h-24 flex items-center"
      style={{
        backgroundColor: 'var(--surface-primary)',
        borderColor: 'var(--border-primary)',
        color: 'var(--text-primary)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {/* Gradient overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-50" 
        style={{
          background: `linear-gradient(to right, 
            var(--surface-secondary) 0%, 
            transparent 100%)`
        }}
      />
      
      <div className="flex items-center justify-between relative z-10 w-full">
        <div className="lg:hidden">
          <div className="flex items-center">
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="mr-3 w-10 h-10 rounded-xl backdrop-blur-sm flex items-center justify-center transition-all duration-300 cursor-pointer border hover:scale-105"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderColor: 'var(--border-secondary)',
                  color: 'var(--text-secondary)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <i className="ri-menu-line text-lg"></i>
              </button>
            )}
            <div 
              className="rounded-xl p-2 mr-3 shadow-lg"
              style={{
                background: 'var(--gradient-secondary)'
              }}
            >
              <i className="ri-heart-line text-white text-lg"></i>
            </div>
            <h1 
              className="text-xl font-['Pacifico'] bg-clip-text text-transparent"
              style={{
                background: 'var(--gradient-secondary)'
              }}
            >
              howareyou
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3 ml-auto">
          {/* SSE 연결 상태 표시 */}
          <div className="relative group">
            <div className="w-11 h-11 rounded-2xl backdrop-blur-sm flex items-center justify-center transition-all duration-300 border"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--border-secondary)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <i className={`${sseStatus.icon} ${sseStatus.color} text-lg ${isConnecting ? 'animate-spin' : ''}`}></i>
            </div>
            {/* 툴팁 */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {sseStatus.tooltip}
            </div>
            {/* 연결 상태 표시점 */}
            <div className={`absolute -bottom-1 -right-1 w-2 h-2 ${sseStatus.bgColor} rounded-full animate-pulse`}></div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="group w-11 h-11 rounded-2xl backdrop-blur-sm flex items-center justify-center transition-all duration-300 cursor-pointer border hover:scale-105 relative"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--border-secondary)',
                color: 'var(--text-secondary)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <i className="ri-notification-line transition-colors text-lg"></i>
              {unreadCount > 0 && (
                <div 
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs text-white flex items-center justify-center font-medium shadow-lg animate-pulse"
                  style={{
                    background: 'var(--gradient-warm)'
                  }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              )}
            </button>

            {showNotifications && (
              <NotificationList isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
            )}
          </div>

          <button
            onClick={toggleLanguage}
            className="group w-11 h-11 rounded-2xl backdrop-blur-sm flex items-center justify-center transition-all duration-300 cursor-pointer border hover:scale-105 whitespace-nowrap"
            style={{
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--border-secondary)',
              color: 'var(--text-secondary)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <span className="text-xs font-bold transition-colors">
              {language === 'ko' ? '한' : 'EN'}
            </span>
          </button>

          <button
            onClick={toggleTheme}
            className="group w-11 h-11 rounded-2xl backdrop-blur-sm flex items-center justify-center transition-all duration-300 cursor-pointer border hover:scale-105 relative overflow-hidden"
            style={{
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--border-secondary)',
              color: 'var(--text-secondary)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div className="relative">
              <i className={`${theme === 'light' ? 'ri-sun-line' : 'ri-moon-line'} transition-all duration-500 text-lg ${theme === 'dark' ? 'rotate-180' : 'rotate-0'}`}></i>
            </div>
            {/* 호버 효과 */}
            <div 
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
              style={{
                background: theme === 'light' 
                  ? 'var(--gradient-warm)' 
                  : 'var(--gradient-primary)'
              }}
            />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="group w-11 h-11 rounded-2xl overflow-hidden border-2 hover:border-indigo-400 transition-all duration-300 cursor-pointer hover:scale-105 shadow-lg"
              style={{
                borderColor: 'var(--border-secondary)'
              }}
            >
              <Avatar
                src={user?.avatarUrl}
                alt={t('profile')}
                fallback={user?.nickname || user?.membername || 'User'}
                size="md"
                className="group-hover:scale-110 transition-transform duration-300"
              />
            </button>

            {showProfileMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowProfileMenu(false)}
                />
                <div 
                  className="absolute right-0 top-14 w-56 backdrop-blur-xl rounded-2xl border py-3 z-50 overflow-hidden transition-all duration-300"
                  style={{
                    backgroundColor: 'var(--surface-primary)',
                    borderColor: 'var(--border-primary)',
                    boxShadow: 'var(--shadow-xl)'
                  }}
                >
                  {/* Gradient overlay */}
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-30" 
                    style={{
                      background: `linear-gradient(to bottom, 
                        var(--surface-secondary) 0%, 
                        transparent 100%)`
                    }}
                  />
                  
                  <div 
                    className="px-4 py-3 border-b relative z-10"
                    style={{
                      borderColor: 'var(--border-primary)'
                    }}
                  >
                    <p 
                      className="font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {user?.nickname}
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {user?.email}
                    </p>
                  </div>
                  
                  <div className="relative z-10">
                    <button 
                      className="w-full text-left px-4 py-3 text-sm hover:bg-opacity-50 transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center rounded-lg mx-2"
                      style={{ 
                        color: 'var(--text-secondary)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <i className="ri-user-line mr-3 text-base"></i>
                      {t('profile')}
                    </button>
                    
                    <button 
                      className="w-full text-left px-4 py-3 text-sm hover:bg-opacity-50 transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center rounded-lg mx-2"
                      style={{ 
                        color: 'var(--text-secondary)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <i className="ri-settings-line mr-3 text-base"></i>
                      {t('settings')}
                    </button>
                    
                    <hr style={{ borderColor: 'var(--border-primary)', margin: '8px 16px' }} />
                    
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-3 text-sm transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center rounded-lg mx-2"
                      style={{ color: 'var(--error)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <i className="ri-logout-line mr-3 text-base"></i>
                      {t('logout')}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
