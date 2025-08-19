'use client';

import { useState } from 'react';
import { Word } from '../../../lib/stores/wordbook';
import { useTranslation } from 'react-i18next';

interface WordDetailCardProps {
  word: Word;
  onClose: () => void;
}

export default function WordDetailCard({ word, onClose }: WordDetailCardProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'examples' | 'quiz'>('info');
  const { t } = useTranslation();

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
    const posMap: Record<string, { color: string; emoji: string; label: string; description: string }> = {
      'noun': { color: 'var(--accent-primary)', emoji: '📖', label: t('common.noun'), description: t('common.nounDesc') },
      'verb': { color: 'var(--info)', emoji: '🏃', label: t('common.verb'), description: t('common.verbDesc') },
      'adjective': { color: 'var(--accent-orange)', emoji: '⭐', label: t('common.adjective'), description: t('common.adjectiveDesc') },
      'adverb': { color: 'var(--accent-secondary)', emoji: '⚡', label: t('common.adverb'), description: t('common.adverbDesc') },
      'preposition': { color: 'var(--text-tertiary)', emoji: '🔗', label: t('common.preposition'), description: t('common.prepositionDesc') },
      'conjunction': { color: 'var(--text-quaternary)', emoji: '🔀', label: t('common.conjunction'), description: t('common.conjunctionDesc') }
    };
    return posMap[pos] || { color: 'var(--text-tertiary)', emoji: '📝', label: pos, description: t('common.posInfo') };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const difficultyConfig = getDifficultyConfig(word.difficulty);
  const posConfig = getPosConfig(word.partOfSpeech);

  const tabs = [
    { id: 'info', label: t('wordbook.detail.basicInfo'), icon: 'ri-information-line' },
    { id: 'examples', label: t('wordbook.detail.examples'), icon: 'ri-chat-quote-line' },
    { id: 'quiz', label: t('wordbook.detail.quizHistory'), icon: 'ri-trophy-line' }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div 
        className="p-6 border-b"
        style={{ borderColor: 'var(--border-secondary)' }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h2 
                className="text-2xl font-bold truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {word.word}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-opacity-20 transition-all flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--surface-secondary)' }}
              >
                <i 
                  className="ri-close-line"
                  style={{ color: 'var(--text-secondary)' }}
                ></i>
              </button>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <div 
                className="flex items-center gap-2 px-3 py-1 rounded-lg"
                style={{
                  backgroundColor: difficultyConfig.color,
                  color: 'white'
                }}
              >
                <span>{difficultyConfig.emoji}</span>
                <span className="text-sm font-medium">{difficultyConfig.label}</span>
              </div>
              
              <div 
                className="flex items-center gap-2 px-3 py-1 rounded-lg"
                style={{
                  backgroundColor: posConfig.color + '20',
                  color: posConfig.color
                }}
              >
                <span>{posConfig.emoji}</span>
                <span className="text-sm font-medium">{posConfig.label}</span>
              </div>
            </div>
            
            <div 
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              📅 {formatDate(word.createdAt)}에 추가됨
            </div>
          </div>
        </div>

        {/* Primary Meaning */}
        <div 
          className="p-4 rounded-xl"
          style={{ backgroundColor: 'var(--surface-secondary)' }}
        >
          <div 
            className="text-lg font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            {word.meanings[0]}
          </div>
          {word.meanings.length > 1 && (
            <div 
              className="text-sm mt-1"
              style={{ color: 'var(--text-secondary)' }}
            >
              +{word.meanings.length - 1}개의 다른 의미
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div 
        className="flex border-b"
        style={{ borderColor: 'var(--border-secondary)' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all ${
              activeTab === tab.id ? 'border-b-2' : ''
            }`}
            style={{
              borderColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
              backgroundColor: activeTab === tab.id ? 'var(--primary)05' : 'transparent'
            }}
          >
            <i className={tab.icon}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* All Meanings */}
            <div>
              <h3 
                className="text-sm font-semibold mb-3 flex items-center gap-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                📖 모든 의미
              </h3>
              <div className="space-y-2">
                {word.meanings.map((meaning, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--surface-secondary)' }}
                  >
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        backgroundColor: 'var(--primary)',
                        color: 'white'
                      }}
                    >
                      {index + 1}
                    </div>
                    <div 
                      className="text-sm"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {meaning}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            {word.tags && word.tags.length > 0 && (
              <div>
                <h3 
                  className="text-sm font-semibold mb-3 flex items-center gap-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  🏷️ 태그
                </h3>
                <div className="flex flex-wrap gap-2">
                  {word.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-lg text-xs font-medium"
                      style={{
                        backgroundColor: 'var(--info)20',
                        color: 'var(--info)'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Difficulty & Part of Speech Info */}
            <div className="space-y-4">
              <div 
                className="p-4 rounded-xl border-l-4"
                style={{
                  backgroundColor: difficultyConfig.color,
                  borderColor: difficultyConfig.color
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{difficultyConfig.emoji}</span>
                  <span 
                    className="font-semibold text-sm"
                    style={{ color: difficultyConfig.color }}
                  >
                    난이도: {difficultyConfig.label}
                  </span>
                </div>
                <p 
                  className="text-xs"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {difficultyConfig.description}
                </p>
              </div>

              <div 
                className="p-4 rounded-xl border-l-4"
                style={{
                  backgroundColor: posConfig.color + '10',
                  borderColor: posConfig.color
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{posConfig.emoji}</span>
                  <span 
                    className="font-semibold text-sm"
                    style={{ color: posConfig.color }}
                  >
                    품사: {posConfig.label}
                  </span>
                </div>
                <p 
                  className="text-xs"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {posConfig.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="space-y-4">
            <h3 
              className="text-sm font-semibold flex items-center gap-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              💬 예문
            </h3>
            
            {word.examples && word.examples.length > 0 ? (
              <div className="space-y-3">
                {word.examples.map((example, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-xl border-l-4"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      borderColor: 'var(--info)'
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{
                          backgroundColor: 'var(--info)',
                          color: 'white'
                        }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p 
                          className="text-sm font-medium italic mb-1"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          "{example}"
                        </p>
                        <p 
                          className="text-xs"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {word.word} 사용 예시
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📝</div>
                <p 
                  className="text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  등록된 예문이 없습니다
                </p>
                <p 
                  className="text-xs"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  채팅에서 이 단어를 사용하면
                  <br />
                  예문이 자동으로 추가됩니다
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="space-y-4">
            <h3 
              className="text-sm font-semibold flex items-center gap-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              🏆 퀴즈 기록
            </h3>
            
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📊</div>
              <p 
                className="text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                퀴즈 기록이 없습니다
              </p>
              <p 
                className="text-xs mb-4"
                style={{ color: 'var(--text-secondary)' }}
              >
                이 단어로 퀴즈를 풀어보세요!
                <br />
                정답률과 학습 기록을 확인할 수 있습니다
              </p>
              <button
                className="px-4 py-2 rounded-xl font-medium text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, var(--success), var(--info))'
                }}
              >
                퀴즈 시작하기
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div 
        className="p-4 border-t"
        style={{ borderColor: 'var(--border-secondary)' }}
      >
        <div className="flex gap-2">
          <button
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium border hover:shadow-lg transition-all"
            style={{
              borderColor: 'var(--border-secondary)',
              backgroundColor: 'var(--surface-secondary)',
              color: 'var(--text-primary)'
            }}
          >
            <i className="ri-heart-line"></i>
            즐겨찾기
          </button>
          
          <button
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, var(--success), var(--info))'
            }}
          >
            <i className="ri-play-circle-line"></i>
            퀴즈
          </button>
        </div>
      </div>
    </div>
  );
}

