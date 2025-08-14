
'use client';

import { useState } from 'react';
// Remix Icon 사용 (lucide-react 대신)
import { useTranslation } from '../../../lib/hooks/useTranslation';
import type { Word } from '../../lib/stores/wordbook';

interface WordRowProps {
  word: Word;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
}

export default function WordRow({ word, isSelected, onSelect, onEdit }: WordRowProps) {
  const { t } = useTranslation(['wordbook', 'common']);
  const [showActions, setShowActions] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return { bg: 'var(--accent-success-bg)', text: 'var(--accent-success)', dot: 'var(--accent-success)' };
      case 2: return { bg: 'var(--accent-primary-alpha)', text: 'var(--accent-primary)', dot: 'var(--accent-primary)' };
      case 3: return { bg: 'var(--accent-warning-bg)', text: 'var(--accent-warning)', dot: 'var(--accent-warning)' };
      case 4: return { bg: 'var(--accent-orange-bg)', text: 'var(--accent-orange)', dot: 'var(--accent-orange)' };
      case 5: return { bg: 'var(--accent-danger-bg)', text: 'var(--accent-danger)', dot: 'var(--accent-danger)' };
      default: return { bg: 'var(--surface-tertiary)', text: 'var(--text-tertiary)', dot: 'var(--text-tertiary)' };
    }
  };

  const difficultyStyle = getDifficultyColor(word.difficulty);

  return (
    <div 
      className="group transition-all duration-200 border rounded-xl hover:shadow-md cursor-pointer"
      style={{
        backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--surface-primary)',
        borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-primary)'
      }}
    >
      
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Checkbox & Word Info */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              aria-label={`Select word ${word.word}`}
              className="w-4 h-4 rounded cursor-pointer"
              style={{
                color: 'var(--accent-primary)',
                borderColor: 'var(--border-primary)'
              }}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-1">
                <h3 
                  className="font-semibold text-lg transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {word.word}
                </h3>
                
                <span 
                  className="px-2 py-1 rounded-md text-xs font-medium"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  {word.partOfSpeech}
                </span>
                
                <div 
                  className="flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium"
                  style={{
                    backgroundColor: difficultyStyle.bg,
                    color: difficultyStyle.text
                  }}
                >
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: difficultyStyle.dot }}
                  ></div>
                  <span>{word.difficulty}</span>
                </div>
              </div>
              
              {/* Primary meaning - always visible */}
              <p 
                className="text-sm truncate"
                style={{ color: 'var(--text-secondary)' }}
              >
                {word.meanings[0]}
                {word.meanings.length > 1 && (
                  <span 
                    className="ml-1"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    +{word.meanings.length - 1}{t('common.words')}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-1 ml-4">
            <button 
              title={t('common.pronunciation')}
              className="p-2 rounded-lg transition-all cursor-pointer"
              style={{
                color: 'var(--text-secondary)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--accent-success)';
                e.currentTarget.style.backgroundColor = 'var(--accent-success)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
                              <i className="ri-volume-up-line w-4 h-4 text-base" />
            </button>
            
            {word.sourceChatId && (
              <button 
                title={t('wordbook.viewInChat')}
                className="p-2 rounded-lg transition-all cursor-pointer"
                style={{
                  color: 'var(--text-secondary)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--accent-primary)';
                  e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <i className="ri-message-3-line w-4 h-4 text-base" />
              </button>
            )}
            
            <button
              onClick={onEdit}
              title={t('common.edit')}
              className="p-2 rounded-lg transition-all cursor-pointer"
              style={{
                color: 'var(--text-secondary)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--accent-warning)';
                e.currentTarget.style.backgroundColor = 'var(--accent-warning)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
                              <i className="ri-edit-line w-4 h-4 text-base" />
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? t('common.collapse') : t('common.expand')}
              className="p-2 rounded-lg transition-all cursor-pointer"
              style={{
                color: 'var(--text-secondary)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
                              {isExpanded ? <i className="ri-chevron-up-line w-4 h-4 text-base" /> : <i className="ri-chevron-down-line w-4 h-4 text-base" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 rounded-lg transition-all cursor-pointer"
                style={{
                  color: 'var(--text-secondary)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <i className="ri-more-2-line w-4 h-4 text-base" />
              </button>

              {showActions && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowActions(false)}
                  />
                  <div 
                    className="absolute right-0 top-full mt-2 w-48 border rounded-lg shadow-lg z-20 overflow-hidden"
                    style={{
                      backgroundColor: 'var(--surface-primary)',
                      borderColor: 'var(--border-primary)',
                      boxShadow: 'var(--shadow-lg)'
                    }}
                  >
                    <button 
                      className="w-full text-left px-4 py-3 text-sm transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {t('common.similarWords')}
                    </button>
                    <button 
                      className="w-full text-left px-4 py-3 text-sm transition-colors"
                      style={{ color: 'var(--accent-destructive)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--accent-destructive)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <i className="ri-delete-bin-line w-4 h-4 inline mr-2 text-base" />
                      {t('common.delete')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div 
            className="mt-4 pt-4 space-y-3 animate-in slide-in-from-top duration-200"
            style={{ borderTop: '1px solid var(--border-secondary)' }}
          >
            {/* All meanings */}
            {word.meanings.length > 1 && (
              <div>
                <h4 
                  className="text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                                      {t('common.meanings')}
                </h4>
                <div className="space-y-1">
                  {word.meanings.map((meaning, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <span 
                        className="text-sm font-medium mt-0.5"
                        style={{ color: 'var(--accent-primary)' }}
                      >
                        {idx + 1}.
                      </span>
                      <span 
                        className="text-sm"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {meaning}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Examples */}
            {word.examples.length > 0 && (
              <div>
                <h4 
                  className="text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                                      {t('common.examples')}
                </h4>
                <div 
                  className="rounded-lg p-3"
                  style={{ backgroundColor: 'var(--surface-tertiary)' }}
                >
                  {word.examples.map((example, idx) => (
                    <div key={idx} className="flex items-start space-x-2 mb-2 last:mb-0">
                      <i className="ri-book-open-line w-3 h-3 mt-1 flex-shrink-0" 
                        style={{ color: 'var(--text-tertiary)' }}
                      />
                      <p 
                        className="text-sm italic"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        "{example}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Tags */}
            {word.tags.length > 0 && (
              <div>
                <h4 
                  className="text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                                      {t('common.tags')}
                </h4>
                <div className="flex flex-wrap gap-1">
                  {word.tags.map(tag => (
                    <span 
                      key={tag}
                      className="px-2 py-1 text-xs rounded-md font-medium"
                      style={{
                        backgroundColor: 'var(--accent-secondary)',
                        color: 'var(--text-on-accent)'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div 
              className="flex items-center justify-between text-xs pt-2"
              style={{ color: 'var(--text-tertiary)' }}
            >
                                      <span>{new Date(word.createdAt).toLocaleDateString()} {t('common.added')}</span>
              {word.sourceChatId && (
                <span 
                  className="flex items-center space-x-1 px-2 py-1 rounded-md"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--text-on-accent)'
                  }}
                >
                  <i className="ri-message-3-line w-3 h-3 text-sm" />
                  <span>{t('wordbook.fromChat')}</span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
