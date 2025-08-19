'use client';

import { useState } from 'react';
import { Word } from '../../../lib/stores/wordbook';
import WordDetailCard from './WordDetailCard';
import { useTranslation } from 'react-i18next';

interface WordCardGridProps {
  words: Word[];
  selectedWord: Word | null;
  onWordSelect: (word: Word) => void;
  category: string;
  searchQuery: string;
}

export default function WordCardGrid({
  words,
  selectedWord,
  onWordSelect,
  category,
  searchQuery
}: WordCardGridProps) {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const { t } = useTranslation();

  const getCategoryInfo = () => {
    const categoryMap: Record<string, { title: string; emoji: string; description: string }> = {
      'all': { title: '전체 단어', emoji: '📚', description: '모든 단어를 한눈에 확인하세요' },
      'today': { title: '오늘 추가된 단어', emoji: '📅', description: '오늘 새로 학습한 단어들입니다' },
      'easy': { title: '쉬운 단어', emoji: '🟢', description: '잘 아는 단어들입니다' },
      'medium': { title: '보통 난이도', emoji: '🟡', description: '적당히 어려운 단어들입니다' },
      'hard': { title: '어려운 단어', emoji: '🔴', description: '더 연습이 필요한 단어들입니다' },
      'noun': { title: '명사', emoji: '📖', description: '사물이나 개념을 나타내는 단어들' },
      'verb': { title: '동사', emoji: '🏃', description: '행동이나 상태를 나타내는 단어들' },
      'adjective': { title: '형용사', emoji: '⭐', description: '성질이나 상태를 나타내는 단어들' },
      'adverb': { title: '부사', emoji: '⚡', description: '동작의 방법을 나타내는 단어들' },
      'review': { title: '복습 필요', emoji: '🔥', description: '다시 학습해야 할 단어들입니다' }
    };

    return categoryMap[category] || categoryMap['all'];
  };

  const categoryInfo = getCategoryInfo();

  const getDifficultyConfig = (level: string) => {
    switch (level) {
      case 'a1':
      case 'a2':
        return { color: 'var(--success)', label: t('common.easyLevel') };
      case 'b1':
      case 'b2':
        return { color: 'var(--warning)', label: t('common.mediumLevel') };
      case 'c1':
      case 'c2':
        return { color: 'var(--error)', label: t('common.hardLevel') };
      default:
        return { color: 'var(--text-tertiary)', label: level };
    }
  };

  const getPosConfig = (pos: string) => {
    const posMap: Record<string, { color: string; emoji: string; label: string }> = {
      'noun': { color: 'var(--accent-primary)', emoji: '📖', label: t('common.noun') },
      'verb': { color: 'var(--info)', emoji: '🏃', label: t('common.verb') },
      'adjective': { color: 'var(--accent-orange)', emoji: '⭐', label: t('common.adjective') },
      'adverb': { color: 'var(--accent-secondary)', emoji: '⚡', label: t('common.adverb') },
      'preposition': { color: 'var(--text-tertiary)', emoji: '🔗', label: '전치사' },
      'conjunction': { color: 'var(--text-quaternary)', emoji: '🔀', label: '접속사' }
    };
    return posMap[pos] || { color: 'var(--text-tertiary)', emoji: '📝', label: pos };
  };

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

  return (
    <div className="flex h-full">
      {/* Word Cards Grid */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div 
          className="p-6 border-b backdrop-blur-xl"
          style={{
            backgroundColor: 'var(--surface-primary)',
            borderColor: 'var(--border-secondary)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 
                className="text-2xl font-bold flex items-center gap-3"
                style={{ color: 'var(--text-primary)' }}
              >
                <span className="text-3xl">{categoryInfo.emoji}</span>
                {categoryInfo.title}
              </h2>
              <p 
                className="text-sm mt-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                {categoryInfo.description} • {words.length}개 단어
                {searchQuery && ` • "${searchQuery}" 검색 결과`}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div 
                className="px-4 py-2 rounded-xl text-sm font-medium"
                style={{
                  backgroundColor: 'var(--info)',
                  color: 'white'
                }}
              >
                {words.length}개
              </div>
            </div>
          </div>
        </div>

        {/* Cards Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {words.length === 0 ? (
            /* Empty State */
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: 'var(--surface-secondary)' }}
                >
                  <span className="text-4xl">
                    {searchQuery ? '🔍' : categoryInfo.emoji}
                  </span>
                </div>
                <h3 
                  className="text-xl font-semibold mb-3"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {searchQuery 
                    ? `"${searchQuery}"에 대한 검색 결과가 없습니다` 
                    : `${categoryInfo.title}에 단어가 없습니다`}
                </h3>
                <p 
                  className="text-sm mb-6"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {searchQuery 
                    ? '다른 검색어를 시도해보세요'
                    : '채팅을 통해 새로운 단어를 학습하면 자동으로 추가됩니다'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => window.location.href = '/chat'}
                    className="px-6 py-3 rounded-2xl font-medium text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, var(--primary), var(--secondary))'
                    }}
                  >
                    채팅 시작하기
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Words Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {words.map((word) => {
                const difficultyConfig = getDifficultyConfig(word.difficulty);
                const posConfig = getPosConfig(word.partOfSpeech);
                const isHovered = hoveredWord === word.id;
                const isSelected = selectedWord?.id === word.id;

                return (
                  <div
                    key={word.id}
                    onClick={() => onWordSelect(word)}
                    onMouseEnter={() => setHoveredWord(word.id)}
                    onMouseLeave={() => setHoveredWord(null)}
                    className={`group relative cursor-pointer transition-all duration-300 ${
                      isSelected ? 'scale-105 z-10' : isHovered ? 'scale-102 z-5' : ''
                    }`}
                  >
                    <div
                      className={`h-32 rounded-2xl border-2 p-4 flex flex-col justify-between shadow-lg hover:shadow-xl transition-all duration-300 ${
                        isSelected ? 'ring-2 ring-offset-2' : ''
                      }`}
                      style={{
                        backgroundColor: isSelected 
                          ? 'var(--primary)' 
                          : 'var(--surface-primary)',
                        borderColor: isSelected 
                          ? 'var(--primary)' 
                          : isHovered 
                          ? difficultyConfig.color 
                          : 'var(--border-secondary)',
                        ringColor: isSelected ? 'var(--primary)' : 'transparent'
                      }}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div 
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-xs"
                          style={{
                            backgroundColor: isSelected 
                              ? 'rgba(255, 255, 255, 0.2)' 
                              : difficultyConfig.color + '10',
                            color: isSelected ? 'white' : difficultyConfig.color
                          }}
                        >
                          {difficultyConfig.emoji}
                        </div>
                        
                        <div 
                          className="text-xs px-2 py-1 rounded-lg font-medium"
                          style={{
                            backgroundColor: isSelected 
                              ? 'rgba(255, 255, 255, 0.2)' 
                              : posConfig.color + '20',
                            color: isSelected ? 'white' : posConfig.color
                          }}
                        >
                          {posConfig.emoji}
                        </div>
                      </div>

                      {/* Word */}
                      <div className="text-center">
                        <div 
                          className="font-bold text-lg mb-1 truncate"
                          style={{ 
                            color: isSelected ? 'white' : 'var(--text-primary)' 
                          }}
                          title={word.word}
                        >
                          {word.word}
                        </div>
                        <div 
                          className="text-xs truncate"
                          style={{ 
                            color: isSelected 
                              ? 'rgba(255, 255, 255, 0.8)' 
                              : 'var(--text-secondary)' 
                          }}
                          title={word.meanings[0]}
                        >
                          {word.meanings[0]}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div 
                          className="text-xs"
                          style={{ 
                            color: isSelected 
                              ? 'rgba(255, 255, 255, 0.7)' 
                              : 'var(--text-tertiary)' 
                          }}
                        >
                          {formatDate(word.createdAt)}
                        </div>
                        
                        {word.meanings.length > 1 && (
                          <div 
                            className="text-xs px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: isSelected 
                                ? 'rgba(255, 255, 255, 0.2)' 
                                : 'var(--surface-secondary)',
                              color: isSelected ? 'white' : 'var(--text-secondary)'
                            }}
                          >
                            +{word.meanings.length - 1}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Hover Effect */}
                    {isHovered && !isSelected && (
                      <div 
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{
                          background: `${difficultyConfig.color}10`,
                          border: `2px solid ${difficultyConfig.color}`
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Word Detail Panel */}
      {selectedWord && (
        <div 
          className="w-96 border-l h-full flex-shrink-0"
          style={{
            backgroundColor: 'var(--surface-primary)',
            borderColor: 'var(--border-primary)'
          }}
        >
          <WordDetailCard 
            word={selectedWord}
            onClose={() => onWordSelect(selectedWord)}
          />
        </div>
      )}
    </div>
  );
}

