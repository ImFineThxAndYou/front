
'use client';

import { useState } from 'react';
import { useUIStore } from '../../../lib/stores/ui';
import { useTranslation } from '../../../lib/hooks/useTranslation';

interface ChatRequestItemProps {
  request: any;
}

export default function ChatRequestItem({ request }: ChatRequestItemProps) {
  // 임시로 빈 함수들로 대체
  const acceptChatRequest = async (id: string) => {
    console.log('Accept chat request:', id);
  };
  
  const rejectChatRequest = async (id: string) => {
    console.log('Reject chat request:', id);
  };
  const { showToast } = useUIStore();
  const { t } = useTranslation('chat');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      await acceptChatRequest(request.id);
      showToast({
        message: t('toast.requestAccepted'),
        type: 'success'
      });
    } catch (error) {
      showToast({
        message: t('toast.requestError'),
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      await rejectChatRequest(request.id);
      showToast({
        message: t('toast.requestRejected'),
        type: 'info'
      });
    } catch (error) {
      showToast({
        message: t('toast.requestError'),
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return t('status.justNow');
    if (minutes < 60) return `${minutes}${t('status.minutesAgo')}`;
    if (hours < 24) return `${hours}${t('status.hoursAgo')}`;

    return date.toLocaleDateString();
  };

  return (
    <div className="p-4">
      <div className="flex items-start space-x-3">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center font-semibold flex-shrink-0"
          style={{
            background: 'var(--gradient-warm)',
            color: 'var(--text-on-accent)'
          }}
        >
          {request?.fromUserProfile?.nickname?.charAt(0).toUpperCase() || 'U'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 
              className="text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              {request?.fromUserProfile?.nickname || 'Unknown User'}
            </h3>
            <span 
              className="text-xs"
              style={{ color: 'var(--text-quaternary)' }}
            >
              {formatTime(request.createdAt)}
            </span>
          </div>

          <div className="flex items-center space-x-2 mb-2">
            <span 
              className="text-xs"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <i className="ri-map-pin-line mr-1"></i>
              {request.fromUserProfile.region}
            </span>
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            {request.fromUserProfile.languages.slice(0, 2).map((lang) => (
              <span
                key={lang}
                className="px-2 py-1 text-xs rounded-full"
                style={{
                  backgroundColor: 'var(--accent-primary-alpha)',
                  color: 'var(--accent-primary)'
                }}
              >
                {lang}
              </span>
            ))}
          </div>

          <p 
            className="text-sm mb-4 line-clamp-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            {request.message}
          </p>

          <div className="flex space-x-2">
            <button
              onClick={handleAccept}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              style={{
                backgroundColor: isProcessing ? 'var(--surface-tertiary)' : 'var(--accent-primary)',
                color: isProcessing ? 'var(--text-tertiary)' : 'var(--text-on-accent)'
              }}
              onMouseEnter={(e) => {
                if (!isProcessing) {
                  e.currentTarget.style.backgroundColor = 'var(--accent-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isProcessing) {
                  e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                }
              }}
            >
              {isProcessing ? (
                <i className="ri-loader-4-line animate-spin"></i>
              ) : (
                '수락'
              )}
            </button>
            <button
              onClick={handleReject}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              style={{
                backgroundColor: isProcessing ? 'var(--surface-tertiary)' : 'var(--surface-secondary)',
                color: isProcessing ? 'var(--text-tertiary)' : 'var(--text-secondary)'
              }}
              onMouseEnter={(e) => {
                if (!isProcessing) {
                  e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isProcessing) {
                  e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                }
              }}
            >
              거절
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
