
'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
}

export default function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    <div 
      className="backdrop-blur-xl border-t p-6 relative"
      style={{
        backgroundColor: 'var(--surface-primary)',
        borderColor: 'var(--border-primary)'
      }}
    >
      {/* Quick Emoji Bar */}
      {showEmojiPicker && (
        <div className="mb-4 p-3 rounded-2xl border backdrop-blur-sm"
             style={{
               backgroundColor: 'var(--surface-secondary)',
               borderColor: 'var(--border-secondary)'
             }}>
          <div className="flex flex-wrap gap-2 justify-center">
            {quickEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEmojiClick(emoji)}
                className="w-10 h-10 text-xl hover:scale-125 transition-transform duration-200 cursor-pointer rounded-lg hover:bg-white/10"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end space-x-4">
        {/* Input Container */}
        <div className="flex-1 relative">
          <div 
            className="relative rounded-2xl border backdrop-blur-sm shadow-lg"
            style={{
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--border-secondary)'
            }}
          >
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              placeholder="메시지를 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
              className="w-full px-6 py-4 pr-24 text-sm bg-transparent border-0 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder-opacity-70"
              style={{
                color: 'var(--text-primary)',
                minHeight: '56px',
                maxHeight: '120px'
              }}
              rows={1}
            />
            
            {/* Input Actions */}
            <div className="absolute right-3 bottom-3 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  showEmojiPicker ? 'bg-indigo-500 text-white scale-110' : 'hover:bg-white/10'
                }`}
                style={{
                  color: showEmojiPicker ? '#ffffff' : 'var(--text-tertiary)'
                }}
                title="이모지"
              >
                <i className="ri-emotion-line text-lg"></i>
              </button>
              
              <button
                type="button"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer hover:bg-white/10"
                style={{ color: 'var(--text-tertiary)' }}
                title="파일 첨부"
              >
                <i className="ri-attachment-line text-lg"></i>
              </button>
            </div>
          </div>
        </div>
        
        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() || isComposing}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg ${
            message.trim() && !isComposing
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white transform hover:scale-110 shadow-indigo-500/25'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
          } whitespace-nowrap`}
        >
          <i className={`${message.trim() && !isComposing ? 'ri-send-plane-fill' : 'ri-send-plane-line'} text-xl`}></i>
        </button>
      </form>
      
      {/* Input Helper */}
      <div 
        className="mt-3 text-xs text-center"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <div className="flex items-center justify-center space-x-4">
          <span className="flex items-center">
            <i className="ri-corner-down-left-line mr-1"></i>
            Enter로 전송
          </span>
          <span className="flex items-center">
            <i className="ri-corner-down-right-line mr-1"></i>
            Shift+Enter로 줄바꿈
          </span>
          <span className="flex items-center">
            <i className="ri-translate-2 mr-1 text-indigo-500"></i>
            길게 눌러서 번역
          </span>
        </div>
      </div>
    </div>
  );
}
