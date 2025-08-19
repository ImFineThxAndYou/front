'use client';

import { useState, useEffect } from 'react';
import { useNotification } from '../../../lib/hooks/useNotification';
import { useTranslation } from '../../../lib/hooks/useTranslation';
import { notificationService } from '../../../lib/services/notificationService';
import { NotifyDto } from '../../../lib/types/notification';

interface NotificationListProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationList({ isOpen, onClose }: NotificationListProps) {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    hasMore,
    markAsRead, 
    clearAllNotifications,
    loadMoreNotifications,
    refreshNotifications,
    error,
    clearError
  } = useNotification();
  
  const { t } = useTranslation(['notification', 'common']);
  const [isMarkingAsRead, setIsMarkingAsRead] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleMarkAsRead = async (notificationId: string) => {
    if (isMarkingAsRead === notificationId) return;
    
    setIsMarkingAsRead(notificationId);
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('❌ 알림 읽음 표시 실패:', error);
    } finally {
      setIsMarkingAsRead(null);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
    } catch (error) {
      console.error('❌ 모든 알림 지우기 실패:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshNotifications();
    } catch (error) {
      console.error('❌ 알림 새로고침 실패:', error);
    }
  };

  const parsePayload = (payloadString: string) => {
    if (!payloadString || typeof payloadString !== 'string') {
      return { message: '알림 내용을 불러올 수 없습니다.' };
    }

    // 빈 문자열이나 공백만 있는 경우
    const trimmedPayload = payloadString.trim();
    if (!trimmedPayload) {
      return { message: '알림 내용이 없습니다.' };
    }

    try {
      // 백엔드에서 오는 형식: "{key=value, key=value}"
      if (trimmedPayload.startsWith('{') && trimmedPayload.endsWith('}')) {
        // 중괄호 제거
        const content = trimmedPayload.slice(1, -1);
        
        // key=value 쌍으로 분리
        const keyValuePairs = content.split(',');
        const result: any = {};
        
        keyValuePairs.forEach(pair => {
          const trimmedPair = pair.trim();
          if (trimmedPair.includes('=')) {
            const [key, value] = trimmedPair.split('=');
            if (key && value) {
              result[key.trim()] = value.trim();
            }
          }
        });
        
        return result;
      }
      
      // 일반 JSON 형식인 경우 (백업)
      if (trimmedPayload.startsWith('{') && trimmedPayload.endsWith('}')) {
        try {
          const parsed = JSON.parse(trimmedPayload);
          if (parsed && typeof parsed === 'object') {
            return parsed;
          }
        } catch (jsonError) {
          // JSON 파싱 실패 시 위의 key=value 파싱으로 진행
        }
      }
      
      // 단순 문자열인 경우
      return { message: trimmedPayload };
    } catch (error) {
      console.error('Payload 파싱 실패:', error, '원본 payload:', payloadString);
      // 파싱 실패 시 원본 문자열을 message로 반환
      return { message: trimmedPayload || '알림 내용을 불러올 수 없습니다.' };
    }
  };

  const renderNotification = (notification: NotifyDto) => {
    const payload = parsePayload(notification.payload);
    const isRead = !!notification.readAt;
    const isMarking = isMarkingAsRead === notification.id;

    const getNotificationContent = () => {
      switch (notification.type) {
        case 'CHAT':
          return {
            icon: '💬',
            title: '새 메시지',
            content: payload.massage || payload.message || '새로운 메시지가 도착했습니다.',
            sender: payload.senderId ? `발신자 ID: ${payload.senderId}` : null,
            room: payload.chatRoomId ? `채팅방 ID: ${payload.chatRoomId}` : null
          };
        case 'SYSTEM':
          return {
            icon: '🔔',
            title: '시스템 알림',
            content: payload.message || '시스템 알림입니다.',
            sender: null,
            room: null
          };
        case 'CHATREQ':
          return {
            icon: '🤝',
            title: '채팅 요청',
            content: payload.message || '새로운 채팅 요청이 있습니다.',
            sender: payload.requesterName || payload.requesterId ? `요청자: ${payload.requesterName || payload.requesterId}` : null,
            room: null
          };
        default:
          return {
            icon: '📢',
            title: '알림',
            content: payload.message || '새로운 알림이 있습니다.',
            sender: null,
            room: null
          };
      }
    };

    const notificationContent = getNotificationContent();

    return (
      <div
        key={notification.id}
        className={`p-4 border-b transition-all duration-200 cursor-pointer hover:bg-opacity-50 ${
          isRead ? 'opacity-70' : 'opacity-100'
        }`}
        style={{
          borderColor: 'var(--border-secondary)',
          backgroundColor: isRead ? 'var(--surface-secondary)' : 'var(--surface-primary)'
        }}
        onClick={() => handleMarkAsRead(notification.id)}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
              style={{
                backgroundColor: isRead ? 'var(--surface-tertiary)' : 'var(--accent-primary-alpha)'
              }}
            >
              {notificationContent.icon}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {notificationContent.title}
                </span>
                {!isRead && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: 'var(--accent-primary-alpha)',
                      color: 'var(--accent-primary)'
                    }}
                  >
                    새
                  </span>
                )}
              </div>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {new Date(notification.createdAt).toLocaleString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {notificationContent.content}
              </p>
              
              {(notificationContent.sender || notificationContent.room) && (
                <div className="flex flex-wrap gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {notificationContent.sender && (
                    <span className="px-2 py-1 rounded-md" style={{ backgroundColor: 'var(--surface-tertiary)' }}>
                      {notificationContent.sender}
                    </span>
                  )}
                  {notificationContent.room && (
                    <span className="px-2 py-1 rounded-md" style={{ backgroundColor: 'var(--surface-tertiary)' }}>
                      {notificationContent.room}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-shrink-0">
            {isMarking ? (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            ) : !isRead ? (
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--accent-primary)' }}></div>
            ) : (
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--text-tertiary)' }}></div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 알림 패널 */}
      <div 
        className="fixed top-16 right-4 w-96 max-h-[80vh] bg-white rounded-lg shadow-xl border z-50 overflow-hidden"
        style={{
          backgroundColor: 'var(--surface-primary)',
          borderColor: 'var(--border-primary)',
          boxShadow: 'var(--shadow-xl)'
        }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              🔔 알림
            </h3>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: 'var(--accent-primary-alpha)',
                  color: 'var(--accent-primary)'
                }}
              >
                {unreadCount}
              </span>
            )}
            {error && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: 'var(--error-alpha)',
                  color: 'var(--error)'
                }}
              >
                오류
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 hover:bg-opacity-50 rounded-lg transition-colors disabled:opacity-50"
              style={{ color: 'var(--text-secondary)' }}
              title="새로고침"
            >
              <i className={`ri-refresh-line text-lg ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleClearAll}
              disabled={notifications.length === 0}
              className="p-2 hover:bg-opacity-50 rounded-lg transition-colors disabled:opacity-50"
              style={{ color: 'var(--text-secondary)' }}
              title="모든 알림 지우기"
            >
              <i className="ri-delete-bin-line text-lg" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-opacity-50 rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <i className="ri-close-line text-lg" />
            </button>
          </div>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div className="p-3 border-b"
            style={{
              backgroundColor: 'var(--error-alpha)',
              borderColor: 'var(--error)'
            }}
          >
            <div className="flex items-center space-x-2">
              <i className="ri-error-warning-line" style={{ color: 'var(--error)' }}></i>
              <span className="text-sm" style={{ color: 'var(--error)' }}>
                {error}
              </span>
              <button
                onClick={clearError}
                className="ml-auto p-1 hover:bg-opacity-50 rounded"
                title="오류 메시지 닫기"
                style={{ color: 'var(--error)' }}
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
          </div>
        )}

        {/* 알림 목록 */}
        <div className="overflow-y-auto max-h-96">
          {isLoading && notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                알림을 불러오는 중...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">🔕</div>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                {error ? '백엔드 연결 오류로 알림을 불러올 수 없습니다.' : '알림이 없습니다.'}
              </p>
              {error && (
                <p className="text-xs mt-2" style={{ color: 'var(--error)' }}>
                  네트워크 연결을 확인해주세요.
                </p>
              )}
            </div>
          ) : (
            <>
              {notifications.map(renderNotification)}
              
              {/* 더 보기 버튼 */}
              {hasMore && (
                <div className="p-4 text-center">
                  <button
                    onClick={loadMoreNotifications}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm rounded-lg transition-colors disabled:opacity-50"
                    style={{
                      color: 'var(--accent-primary)',
                      backgroundColor: 'var(--accent-primary-alpha)'
                    }}
                  >
                    {isLoading ? '로딩 중...' : '더 보기'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-4 border-t text-center" style={{ borderColor: 'var(--border-secondary)' }}>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            총 {notifications.length}개의 알림
            {unreadCount > 0 && (
              <span className="ml-2" style={{ color: 'var(--accent-primary)' }}>
                (읽지 않은 {unreadCount}개)
              </span>
            )}
          </p>
        </div>
      </div>
    </>
  );
}
