import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';
import { notificationService } from '../services/notificationService';
import { NotifyDto, NotificationPage, NotificationToast } from '../types/notification';

export const useNotification = () => {
  const { user } = useAuthStore();
  const { isSSEConnected, isConnecting, connectionError } = useNotificationStore();
  
  // 알림 관련 상태
  const [notifications, setNotifications] = useState<NotifyDto[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 토스트 관련 상태 (기존 기능 유지)
  const [toasts, setToasts] = useState<NotificationToast[]>([]);

  // 알림 목록 조회
  const fetchNotifications = useCallback(async (page: number = 0, append: boolean = false) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response: NotificationPage = await notificationService.getNotifications(page, 20);
      
      if (append) {
        setNotifications(prev => [...prev, ...response.content]);
      } else {
        setNotifications(response.content);
      }
      
      setCurrentPage(response.number);
      setHasMore(!response.last);
      
      console.log('✅ 알림 목록 조회 성공:', response.content.length);
    } catch (error) {
      console.error('❌ 알림 목록 조회 실패:', error);
      setError('알림 목록을 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // 읽지 않은 알림 개수 조회
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    
    try {
      setError(null);
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
      console.log('✅ 읽지 않은 알림 개수 조회 성공:', count);
    } catch (error) {
      console.error('❌ 읽지 않은 알림 개수 조회 실패:', error);
      setError('읽지 않은 알림 개수를 불러올 수 없습니다.');
    }
  }, [user]);

  // 더 많은 알림 로드
  const loadMoreNotifications = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    const nextPage = currentPage + 1;
    await fetchNotifications(nextPage, true);
  }, [isLoading, hasMore, currentPage, fetchNotifications]);

  // 알림 읽음 표시
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      setError(null);
      await notificationService.markAsRead(notificationId);
      
      // 로컬 상태 업데이트
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, readAt: new Date().toISOString() }
            : n
        )
      );
      
      // 읽지 않은 알림 개수 업데이트
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      console.log('✅ 알림 읽음 표시 성공:', notificationId);
    } catch (error) {
      console.error('❌ 알림 읽음 표시 실패:', error);
      setError('알림 읽음 표시에 실패했습니다.');
      throw error; // 컴포넌트에서 처리할 수 있도록 에러 전파
    }
  }, []);

  // 모든 알림 지우기 (읽음으로 표시)
  const clearAllNotifications = useCallback(async () => {
    try {
      setError(null);
      // 모든 읽지 않은 알림을 읽음으로 표시
      const unreadNotifications = notifications.filter(n => !n.readAt);
      
      await Promise.all(
        unreadNotifications.map(n => notificationService.markAsRead(n.id))
      );
      
      // 로컬 상태 업데이트
      setNotifications(prev => 
        prev.map(n => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
      );
      
      setUnreadCount(0);
      console.log('✅ 모든 알림 읽음 표시 성공');
    } catch (error) {
      console.error('❌ 모든 알림 읽음 표시 실패:', error);
      setError('모든 알림 지우기에 실패했습니다.');
      throw error; // 컴포넌트에서 처리할 수 있도록 에러 전파
    }
  }, [notifications]);

  // 새로고침
  const refreshNotifications = useCallback(async () => {
    setCurrentPage(0);
    setHasMore(true);
    setError(null);
    await Promise.all([
      fetchNotifications(0, false),
      fetchUnreadCount()
    ]);
  }, [fetchNotifications, fetchUnreadCount]);

  // 오류 초기화
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    if (user) {
      refreshNotifications();
    }
  }, [user, refreshNotifications]);

  // 토스트 관련 함수들 (기존 기능 유지)
  const addToast = useCallback((notification: NotifyDto) => {
    // 기존 토스트 로직 유지
    const toast: NotificationToast = {
      id: notification.id,
      type: notification.type as any, // 타입 변환
      title: '알림',
      message: '새로운 알림이 도착했습니다.',
      timestamp: new Date(notification.createdAt),
      isVisible: true
    };

    setToasts(prev => {
      const newToasts = [...prev, toast];
      if (newToasts.length > 5) {
        return newToasts.slice(-5);
      }
      return newToasts;
    });
  }, []);

  const removeToast = useCallback((toastId: string) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    // SSE 연결 상태
    isConnected: isSSEConnected,
    isConnecting,
    connectionError,
    
    // 알림 관련
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    error,
    
    // 알림 액션
    fetchNotifications,
    loadMoreNotifications,
    markAsRead,
    clearAllNotifications,
    refreshNotifications,
    clearError,
    
    // 토스트 관련
    toasts,
    addToast,
    removeToast,
    clearToasts
  };
};
