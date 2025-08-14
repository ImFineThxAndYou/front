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

  const renderNotification = (notification: NotifyDto) => {
    let payload: any = {};
    try {
      payload = JSON.parse(notification.payload);
    } catch (error) {
      payload = { error: '데이터 파싱 실패' };
    }

    const isRead = !!notification.readAt;
    const isMarking = isMarkingAsRead === notification.id;

    return (
      <div
        key={notification.id}
        className={`p-4 border-b transition-all duration-200 cursor-pointer hover:bg-opacity-50 ${
          isRead ? 'opacity-70 bg-gray-50' : 'opacity-100 bg-white'
        }`}
        style={{
          borderColor: 'var(--border-secondary)',
          backgroundColor: isRead ? 'var(--surface-secondary)' : 'var(--surface-primary)'
        }}
        onClick={() => handleMarkAsRead(notification.id)}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <span className="text-lg">{notificationService.getTypeIcon(notification.type)}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {notificationService.getTypeLabel(notification.type)}
                </span>
                {!isRead && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
            
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {notification.type === 'CHAT' && (
                <div>
                  {payload.message && <p className="truncate">{payload.message}</p>}
                  {payload.senderName && <p className="text-xs text-gray-500">From: {payload.senderName}</p>}
                </div>
              )}
              
              {notification.type === 'SYSTEM' && (
                <p>{payload.message || '시스템 알림'}</p>
              )}
              
              {notification.type === 'CHATREQ' && (
                <div>
                  {payload.requesterName && <p className="font-medium">{payload.requesterName}님이 채팅을 요청했습니다</p>}
                  {payload.message && <p className="text-sm text-gray-600">{payload.message}</p>}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-shrink-0">
            {isMarking ? (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            ) : !isRead ? (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            ) : (
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
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
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {unreadCount}
              </span>
            )}
            {error && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
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
          <div className="p-3 bg-red-50 border-b border-red-200">
            <div className="flex items-center space-x-2">
              <i className="ri-error-warning-line text-red-500"></i>
              <span className="text-sm text-red-700">
                {error}
              </span>
              <button
                onClick={clearError}
                className="ml-auto p-1 hover:bg-red-100 rounded"
                title="오류 메시지 닫기"
              >
                <i className="ri-close-line text-red-500"></i>
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
                <p className="text-xs text-red-500 mt-2">
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
                    className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
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
              <span className="ml-2 text-blue-600">
                (읽지 않은 {unreadCount}개)
              </span>
            )}
          </p>
        </div>
      </div>
    </>
  );
}
