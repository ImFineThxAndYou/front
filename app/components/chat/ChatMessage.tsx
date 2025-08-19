
'use client';

import { useState, useCallback } from 'react';
import { ChatMessage as ChatMessageType } from '../../../lib/types/chat';
import { useUIStore } from '../../../lib/stores/ui';
import { useChatStore } from '../../../lib/stores/chat';
import { translations } from '../../../lib/i18n/translations';
import { translateService } from '../../../lib/services/translateService';

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
  const { showToast, language } = useUIStore();
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showWordModal, setShowWordModal] = useState(false);
  const [useGemini, setUseGemini] = useState(false);

  // 채팅 스토어에서 번역 상태 가져오기
  const { 
    getTranslation, 
    setTranslation, 
    setTranslating, 
    isTranslating 
  } = useChatStore();

  // 번역 함수
  const t = useCallback((key: string) => {
    const currentLang = language || 'ko';
    const translationSource = translations[currentLang as keyof typeof translations];
    
    // chat 네임스페이스에서 번역 찾기
    const chatTranslations = translationSource.chat as any;
    if (chatTranslations) {
      const keys = key.split('.');
      let value: any = chatTranslations;
      
      for (const k of keys) {
        value = value?.[k];
      }
      
      if (value) {
        return value;
      }
    }
    
    // common 네임스페이스에서 번역 찾기
    const commonTranslations = translationSource.common as any;
    if (commonTranslations) {
      const keys = key.split('.');
      let value: any = commonTranslations;
      
      for (const k of keys) {
        value = value?.[k];
      }
      
      if (value) {
        return value;
      }
    }
    
    return key;
  }, [language]);

  const targetLang = language === 'ko' ? 'en' : 'ko';
  const translatedText = getTranslation(message.id, targetLang);
  const translating = isTranslating(message.id);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const handleTranslate = async () => {
    // 이미 번역이 표시되어 있으면 토글
    if (showTranslation && translatedText) {
      setShowTranslation(!showTranslation);
      return;
    }

    // 번역 중이면 중단
    if (translating) {
      return;
    }

    setTranslating(message.id, true);
    try {
      console.log('🔄 번역 시작:', { messageId: message.id, content: message.content, targetLang });
      
      const translation = await translateService.translate(
        message.id,
        message.content,
        targetLang,
        useGemini
      );
      
      console.log('✅ 번역 완료:', translation);
      setTranslation(message.id, targetLang, translation);
      setShowTranslation(true);
      
      showToast({
        message: t('toast.translationSuccess'),
        type: 'success'
      });
    } catch (error) {
      console.error('❌ 번역 실패:', error);
      showToast({
        message: t('toast.translationFailed'),
        type: 'error'
      });
    } finally {
      setTranslating(message.id, false);
    }
  };

  const handleRetranslate = async () => {
    // Gemini로 다시 번역
    setUseGemini(true);
    setTranslating(message.id, true);
    try {
      console.log('🔄 AI 재번역 시작:', { messageId: message.id, content: message.content, targetLang });
      
      const translation = await translateService.translate(
        message.id,
        message.content,
        targetLang,
        true
      );
      
      console.log('✅ AI 재번역 완료:', translation);
      setTranslation(message.id, targetLang, translation);
      setShowTranslation(true);
      
      showToast({
        message: t('toast.retranslationSuccess'),
        type: 'success'
      });
    } catch (error) {
      console.error('❌ AI 재번역 실패:', error);
      showToast({
        message: t('toast.retranslationFailed'),
        type: 'error'
      });
    } finally {
      setTranslating(message.id, false);
    }
  };

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    const selected = selection?.toString().trim();

    if (selected && selected.length > 0) {
      console.log('📝 텍스트 선택됨:', selected);
      setSelectedText(selected);
    } else {
      setSelectedText('');
    }
  }, []);

  const handleAddToWordbook = () => {
    if (!selectedText) return;

    console.log('📚 단어장에 추가:', selectedText);
    showToast({
      message: `"${selectedText}"${t('toast.wordAdded')}`,
      type: 'success'
    });
    setSelectedText('');
    setShowWordModal(false);
  };

  const handleCopyTranslation = () => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText);
      showToast({
        message: t('toast.translationCopied'),
        type: 'success'
      });
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
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
              className="px-4 py-2 rounded-2xl break-words cursor-pointer select-text"
              style={{
                backgroundColor: isOwn ? 'var(--accent-primary)' : 'var(--surface-secondary)',
                color: isOwn ? 'var(--text-on-accent)' : 'var(--text-primary)'
              }}
              onMouseUp={handleTextSelection}
              onTouchEnd={handleTextSelection}
            >
              {message.content}
            </div>

            {/* Translation */}
            {showTranslation && translatedText && (
              <div
                className="mt-2 px-4 py-2 rounded-2xl border-2 border-dashed"
                style={{
                  borderColor: isOwn ? 'var(--accent-primary)' : 'var(--border-primary)',
                  backgroundColor: isOwn ? 'var(--accent-primary-alpha)' : 'var(--surface-tertiary)',
                  color: isOwn ? 'var(--text-on-accent)' : 'var(--text-primary)'
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <i className="ri-translate-2 text-xs"></i>
                    <span className="text-xs font-medium">{t('translationLabel')}</span>
                    {useGemini && (
                      <span className="text-xs px-1 py-0.5 rounded bg-blue-100 text-blue-700">
                        AI
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={handleCopyTranslation}
                      className="text-xs hover:underline p-1"
                      style={{ color: 'var(--text-secondary)' }}
                      title={t('copyTranslation')}
                    >
                      <i className="ri-file-copy-line"></i>
                    </button>
                    <button
                      onClick={handleRetranslate}
                      disabled={translating}
                      className="text-xs hover:underline p-1"
                      style={{ color: 'var(--text-secondary)' }}
                      title={t('retranslateWithAI')}
                    >
                      {translating ? (
                        <i className="ri-loader-4-line animate-spin"></i>
                      ) : (
                        <i className="ri-refresh-line"></i>
                      )}
                    </button>
                  </div>
                </div>
                <div className="text-sm">{translatedText}</div>
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
                disabled={translating}
                className="p-1 transition-colors cursor-pointer hover:bg-gray-100 rounded"
                style={{ color: 'var(--text-secondary)' }}
                title={showTranslation ? t('hideTranslation') : t('translate')}
              >
                {translating ? (
                  <i className="ri-loader-4-line animate-spin text-sm"></i>
                ) : (
                  <i className={`ri-translate-2 text-sm ${showTranslation ? 'text-blue-500' : ''}`}></i>
                )}
              </button>

              {selectedText && (
                <button
                  onClick={handleAddToWordbook}
                  className="p-1 transition-colors cursor-pointer hover:bg-gray-100 rounded"
                  style={{ color: 'var(--text-secondary)' }}
                  title={t('addToWordbook')}
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
