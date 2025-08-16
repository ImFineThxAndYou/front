'use client';

import { useState } from 'react';
import { Word } from '../../../lib/stores/wordbook';

interface WordCardProps {
  word: Word;
  viewMode: 'grid' | 'list';
}

export default function WordCard({ word, viewMode }: WordCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const getDifficultyConfig = (difficulty: number) => {
    if (difficulty <= 2) return { 
      color: 'var(--success)', 
      label: '쉬움', 
      icon: 'ri-check-circle-line',
      bg: 'rgba(34, 197, 94, 0.1)'
    };
    if (difficulty <= 3) return { 
      color: 'var(--warning)', 
      label: '보통', 
      icon: 'ri-time-line',
      bg: 'rgba(245, 158, 11, 0.1)'
    };
    return { 
      color: 'var(--danger)', 
      label: '어려움', 
      icon: 'ri-alert-circle-line',
      bg: 'rgba(239, 68, 68, 0.1)'
    };
  };

  const difficultyConfig = getDifficultyConfig(word.difficulty);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '오늘';
    if (diffDays === 2) return '어제';
    if (diffDays <= 7) return `${diffDays - 1}일 전`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  if (viewMode === 'list') {
    return (
      <div
        className="group flex items-center gap-4 p-4 rounded-2xl border hover:shadow-lg transition-all duration-300 cursor-pointer"
        style={{
          backgroundColor: 'var(--surface-primary)',
          borderColor: 'var(--border-secondary)'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Word Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 
              className="text-lg font-semibold truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {word.word}
            </h3>
            <span 
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: difficultyConfig.bg,
                color: difficultyConfig.color
              }}
            >
              {difficultyConfig.label}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="capitalize font-medium">{word.partOfSpeech}</span>
            <span>{formatDate(word.createdAt)}</span>
            <div className="flex items-center gap-1">
              <i className="ri-bookmark-line"></i>
              <span>{word.meanings.length}개 의미</span>
            </div>
          </div>
        </div>

        {/* Primary Meaning */}
        <div className="text-right">
          <div 
            className="text-base font-medium mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            {word.meanings[0]}
          </div>
          {word.meanings.length > 1 && (
            <div 
              className="text-xs"
              style={{ color: 'var(--text-secondary)' }}
            >
              +{word.meanings.length - 1}개 더
            </div>
          )}
        </div>

        {/* Expand Arrow */}
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-opacity-20 transition-all"
          style={{ backgroundColor: 'var(--surface-secondary)' }}
        >
          <i 
            className={`ri-arrow-down-line transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            style={{ color: 'var(--text-secondary)' }}
          ></i>
        </div>
      </div>
    );
  }

  return (
    <div className="group perspective-1000">
      <div
        className={`relative w-full h-64 transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front Side */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex flex-col"
          style={{
            backgroundColor: 'var(--surface-primary)',
            borderColor: 'var(--border-secondary)',
            transform: 'rotateY(0deg)'
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: difficultyConfig.bg
              }}
            >
              <i 
                className={`${difficultyConfig.icon} text-lg`}
                style={{ color: difficultyConfig.color }}
              ></i>
            </div>
            
            <div className="flex items-center gap-2">
              <span 
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  color: 'var(--text-secondary)'
                }}
              >
                {word.partOfSpeech}
              </span>
              <button className="w-8 h-8 rounded-lg hover:bg-opacity-20 transition-all flex items-center justify-center">
                <i 
                  className="ri-more-line"
                  style={{ color: 'var(--text-secondary)' }}
                ></i>
              </button>
            </div>
          </div>

          {/* Word */}
          <div className="mb-4">
            <h3 
              className="text-2xl font-bold mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              {word.word}
            </h3>
            <div 
              className="text-lg font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              {word.meanings[0]}
            </div>
          </div>

          {/* Tags */}
          {word.tags && word.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {word.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 rounded-lg text-xs font-medium"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between">
            <div 
              className="text-xs"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {formatDate(word.createdAt)}
            </div>
            
            <div className="flex items-center gap-1">
              {word.meanings.length > 1 && (
                <span 
                  className="text-xs"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  +{word.meanings.length - 1}개 더
                </span>
              )}
              <i 
                className="ri-refresh-line text-sm ml-2"
                style={{ color: 'var(--text-tertiary)' }}
              ></i>
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden rounded-2xl border shadow-lg p-6 flex flex-col rotate-y-180"
          style={{
            backgroundColor: 'var(--surface-primary)',
            borderColor: 'var(--border-secondary)',
            transform: 'rotateY(180deg)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 
              className="text-xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {word.word}
            </h3>
            <button 
              className="w-8 h-8 rounded-lg hover:bg-opacity-20 transition-all flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
            >
              <i 
                className="ri-close-line"
                style={{ color: 'var(--text-secondary)' }}
              ></i>
            </button>
          </div>

          {/* All Meanings */}
          <div className="mb-4">
            <h4 
              className="text-sm font-semibold mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              모든 의미
            </h4>
            <div className="space-y-2">
              {word.meanings.map((meaning, index) => (
                <div 
                  key={index}
                  className="text-sm"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {index + 1}. {meaning}
                </div>
              ))}
            </div>
          </div>

          {/* Examples */}
          {word.examples && word.examples.length > 0 && (
            <div className="mb-4">
              <h4 
                className="text-sm font-semibold mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                예문
              </h4>
              <div className="space-y-2">
                {word.examples.slice(0, 2).map((example, index) => (
                  <div 
                    key={index}
                    className="text-sm p-2 rounded-lg"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    "{example}"
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Difficulty & Stats */}
          <div className="mt-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i 
                  className={difficultyConfig.icon}
                  style={{ color: difficultyConfig.color }}
                ></i>
                <span 
                  className="text-sm font-medium"
                  style={{ color: difficultyConfig.color }}
                >
                  {difficultyConfig.label}
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="capitalize">{word.partOfSpeech}</span>
                <span>{formatDate(word.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* CSS for 3D flip effect */
const styles = `
  .perspective-1000 { perspective: 1000px; }
  .transform-style-preserve-3d { transform-style: preserve-3d; }
  .backface-hidden { backface-visibility: hidden; }
  .rotate-y-180 { transform: rotateY(180deg); }
`;
