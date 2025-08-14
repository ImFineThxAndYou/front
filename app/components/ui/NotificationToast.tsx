'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../../lib/hooks/useTranslation';
import type { NotificationToast as NotificationToastType } from '../../../lib/types/notification';

interface NotificationToastProps {
  toast: NotificationToastType;
  onRemove: (id: string) => void;
  index: number;
}

export default function NotificationToast({ toast, onRemove, index }: NotificationToastProps) {
  const { t } = useTranslation(['notification']);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  console.log('🍞 NotificationToast 렌더링 시작');
  console.log('🍞 toast 객체:', toast);
  console.log('🍞 toast.id:', toast.id);
  console.log('🍞 toast.title:', toast.title);
  console.log('🍞 toast.message:', toast.message);
  console.log('🍞 NotificationToast 상태:', { isVisible, isAnimating });

  // 토스트 표시 애니메이션 (순차적으로)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 150); // 순차적으로 나타나도록

    return () => clearTimeout(timer);
  }, [index]);

  // 자동 제거 타이머
  useEffect(() => {
    if (isVisible) {
      timeoutRef.current = setTimeout(() => {
        handleRemove();
      }, 4000); // 4초 후 자동 제거
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isVisible]);

  // 토스트 제거 처리
  const handleRemove = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 200); // 애니메이션 완료 후 제거
  };

  // 호버 시 일시정지
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (isVisible) {
      timeoutRef.current = setTimeout(() => {
        handleRemove();
      }, 2000); // 호버 해제 후 2초 뒤 제거
    }
  };

  // 토스트 타입별 스타일
  const getTypeStyles = () => {
    switch (toast.type) {
      case 'CHAT':
        return 'border-l-4 border-l-blue-500 bg-white dark:bg-gray-800';
      case 'SYSTEM':
        return 'border-l-4 border-l-purple-500 bg-white dark:bg-gray-800';
      case 'CHATREQ':
        return 'border-l-4 border-l-green-500 bg-white dark:bg-gray-800';
      default:
        return 'border-l-4 border-l-gray-500 bg-white dark:bg-gray-800';
    }
  };

  // 토스트 타입별 아이콘
  const getTypeIcon = () => {
    switch (toast.type) {
      case 'CHAT':
        return '💬';
      case 'SYSTEM':
        return '🔔';
      case 'CHATREQ':
        return '🤝';
      default:
        return '📢';
    }
  };

  return (
    <div
      className={`w-80 max-w-sm border shadow-lg rounded-lg p-4 transition-all duration-300 ease-out ${
        isVisible 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
      } ${
        isAnimating 
          ? 'translate-x-full opacity-0' 
          : ''
      } ${getTypeStyles()}`}
      style={{
        position: 'relative',
        zIndex: 10000 - index,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getTypeIcon()}</span>
          <h3 className="font-medium text-gray-900 dark:text-white text-sm">
            {toast.title}
          </h3>
        </div>
        <button
          onClick={handleRemove}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 메시지 */}
      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">
        {toast.message}
      </p>

      {/* 푸터 */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          {toast.timestamp.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
        <span className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>새 메시지</span>
        </span>
      </div>
    </div>
  );
}
