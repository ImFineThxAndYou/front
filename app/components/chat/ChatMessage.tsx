
'use client';

import { useState } from 'react';
import { ChatMessage as ChatMessageType } from '../../../lib/types/chat';
import { useUIStore } from '../../../lib/stores/ui';
import { useTranslation } from '../../../lib/hooks/useTranslation';

interface ChatMessageProps {
  message: ChatMessageType;
  isOwn: boolean;
  showAvatar: boolean;
  showTimestamp: boolean;
  participant: {
    id: string;
    nickname: string;
    avatar: string;
    isOnline: boolean;
  };
}

export default function ChatMessage({
  message,
  isOwn,
  showAvatar,
  showTimestamp,
  participant
}: ChatMessageProps) {
  // 번역 기능은 나중에 구현
  const translateMessage = async () => {};
  const getTranslation = () => null;
  const { showToast, language } = useUIStore();
  const { t } = useTranslation('chat');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showWordModal, setShowWordModal] = useState(false);

  const targetLang = language === 'ko' ? 'en' : 'ko';
  const existingTranslation = getTranslation(message.id, targetLang);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const handleTranslate = async () => {
    if (existingTranslation) {
      setShowTranslation(!showTranslation);
      return;
    }

    setIsTranslating(true);
    try {
      await translateMessage(message.id, targetLang);
      setShowTranslation(true);
    } catch (error) {
      showToast({
        message: t('toast.translationFailed'),
        type: 'error'
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const selected = selection?.toString().trim();

    if (selected && selected.length > 0) {
      setSelectedText(selected);
    }
  };

  const handleAddToWordbook = () => {
    if (!selectedText) return;

    showToast({
      message: `"${selectedText}"${t('toast.wordAdded')}`,
      type: 'success'
    });
    setSelectedText('');
    setShowWordModal(false);
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'} space-x-2`}>
        {/* Avatar */}
        <div className={`${isOwn ? 'ml-2' : 'mr-2'} flex-shrink-0`}>
          {showAvatar && !isOwn && (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {participant.nickname.charAt(0).toUpperCase()}
            </div>
          )}
          {!showAvatar && !isOwn && <div className="w-8 h-8" />}
        </div>

        {/* Message Content */}
        <div className={`${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
          {showTimestamp && !isOwn && (
            <div 
              className="text-xs mb-1 px-1"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {participant.nickname}
            </div>
          )}

          <div className="relative group">
            <div
              className="px-4 py-2 rounded-2xl break-words"
              style={{
                backgroundColor: isOwn ? 'var(--accent-primary)' : 'var(--surface-secondary)',
                color: isOwn ? 'var(--text-on-accent)' : 'var(--text-primary)'
              }}
              onMouseUp={handleTextSelection}
            >
              {message.content}
            </div>

            {/* Translation */}
            {showTranslation && existingTranslation && (
              <div
                className="mt-2 px-4 py-2 rounded-2xl border-2 border-dashed"
                style={{
                  borderColor: isOwn ? 'var(--accent-primary)' : 'var(--border-primary)',
                  backgroundColor: isOwn ? 'var(--accent-primary-alpha)' : 'var(--surface-tertiary)',
                  color: isOwn ? 'var(--text-on-accent)' : 'var(--text-primary)'
                }}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <i className="ri-translate-2 text-xs"></i>
                  <span className="text-xs font-medium">번역</span>
                </div>
                <div className="text-sm">{existingTranslation}</div>
              </div>
            )}

            {/* Action Buttons */}
            <div
              className={`opacity-0 group-hover:opacity-100 absolute top-0 ${
                isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'
              } flex items-center space-x-1 transition-opacity rounded-full border shadow-sm px-2 py-1`}
              style={{
                backgroundColor: 'var(--surface-primary)',
                borderColor: 'var(--border-primary)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <button
                onClick={handleTranslate}
                disabled={isTranslating}
                className="p-1 transition-colors cursor-pointer"
                style={{ color: 'var(--text-secondary)' }}
                title="번역"
              >
                {isTranslating ? (
                  <i className="ri-loader-4-line animate-spin text-sm"></i>
                ) : (
                  <i className={`ri-translate-2 text-sm ${showTranslation ? 'text-blue-500' : ''}`}></i>
                )}
              </button>

              {selectedText && (
                <button
                  onClick={handleAddToWordbook}
                  className="p-1 transition-colors cursor-pointer"
                  style={{ color: 'var(--text-secondary)' }}
                  title="단어장에 추가"
                >
                  <i className="ri-add-circle-line text-sm"></i>
                </button>
              )}
            </div>
          </div>

          {/* Timestamp */}
          {showTimestamp && (
            <div 
              className={`text-xs mt-1 px-1 ${isOwn ? 'text-right' : 'text-left'}`}
              style={{ color: 'var(--text-quaternary)' }}
            >
              {formatTime(message.messageTime)}
              {isOwn && (
                <span className="ml-1">
                  {message.chatMessageStatus === 'READ' ? (
                    <i className="ri-check-double-line" style={{ color: 'var(--accent-primary)' }}></i>
                  ) : (
                    <i className="ri-check-line" style={{ color: 'var(--text-tertiary)' }}></i>
                  )}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
