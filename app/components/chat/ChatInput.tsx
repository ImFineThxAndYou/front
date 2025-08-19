
'use client';

import { useState, useRef, useEffect } from 'react';
import { useUIStore } from '../../../lib/stores/ui';
import { translations } from '../../../lib/i18n/translations';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
}

export default function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { language } = useUIStore();

  // 번역 함수
  const t = (key: string) => {
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
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 120; // 약 5줄 정도
      textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isComposing) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      if (message.trim()) {
        onSendMessage(message);
        setMessage('');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const quickEmojis = ['😊', '👍', '❤️', '😂', '🤔', '👋', '🙏', '✨'];

  const handleEmojiClick = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="p-4 border-t" style={{ backgroundColor: 'var(--surface-primary)', borderColor: 'var(--border-primary)' }}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div 
            className="p-3 rounded-lg border"
            style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border-secondary)' }}
          >
            <div className="grid grid-cols-8 gap-2">
              {quickEmojis.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                  className="p-2 text-xl hover:bg-gray-100 rounded transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              placeholder={t('messagePlaceholder')}
              className="w-full px-4 py-3 rounded-2xl resize-none border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--text-primary)',
                minHeight: '44px'
              }}
              rows={1}
              maxLength={500}
            />
          </div>
          
          {/* Emoji Button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-3 rounded-2xl transition-colors"
            style={{ 
              backgroundColor: 'var(--surface-secondary)',
              color: 'var(--text-secondary)'
            }}
            title={t('addEmoji')}
          >
            <i className="ri-emotion-line text-lg" />
          </button>
          
          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim() || isComposing}
            className="p-3 rounded-2xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={t('sendMessage')}
          >
            <i className="ri-send-plane-fill text-lg" />
          </button>
        </div>
      </form>
      
      {/* Input Helper */}
      <div 
        className="mt-3 text-xs text-center"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <div className="flex items-center justify-center space-x-4">
          <span className="flex items-center">
            <i className="ri-corner-down-left-line mr-1"></i>
            {t('enterToSend')}
          </span>
          <span className="flex items-center">
            <i className="ri-corner-down-right-line mr-1"></i>
            {t('shiftEnterForNewLine')}
          </span>
          <span className="flex items-center">
            <i className="ri-translate-2 mr-1 text-indigo-500"></i>
            {t('hoverToTranslate')}
          </span>
        </div>
      </div>
    </div>
  );
}
