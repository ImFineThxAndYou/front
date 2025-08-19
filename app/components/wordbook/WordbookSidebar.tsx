'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from '../../../lib/hooks/useTranslation';

interface WordbookSidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onQuizStart: () => void;
  stats: {
    total: number;
    today: number;
    easy: number;
    medium: number;
    hard: number;
    nouns: number;
    verbs: number;
    adjectives: number;
    adverbs: number;
    review: number;
  };
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeView: 'words' | 'quiz-history';
  onViewChange: (view: 'words' | 'quiz-history') => void;
  quizStats?: {
    total: number;
    pending: number;
    completed: number;
  };
  selectedQuizStatus?: 'ALL' | 'PENDING' | 'SUBMIT';
  onQuizStatusChange?: (status: 'ALL' | 'PENDING' | 'SUBMIT') => void;
}

export default function WordbookSidebar({
  selectedCategory,
  onCategoryChange,
  onQuizStart,
  stats,
  searchQuery,
  onSearchChange,
  activeView,
  onViewChange,
  quizStats,
  selectedQuizStatus,
  onQuizStatusChange,
}: WordbookSidebarProps) {
  const router = useRouter();
  const { t } = useTranslation(['wordbook', 'common', 'quiz']);
  
  // 기본값 설정으로 안전한 접근 보장
  const safeQuizStats = quizStats || { total: 0, pending: 0, completed: 0 };
  const safeSelectedQuizStatus = selectedQuizStatus || 'ALL';

  const categoryGroups = [
    {
      title: '📊 전체 현황',
      items: [
        {
          id: 'all',
          label: t('common.totalWords'),
          count: stats.total,
          icon: 'ri-book-line',
          color: 'var(--primary)',
          gradient: 'linear-gradient(135deg, var(--primary), var(--secondary))'
        },
        {
          id: 'today',
          label: t('common.todayAdded'),
          count: stats.today,
          icon: 'ri-calendar-line',
          color: 'var(--success)',
          gradient: 'linear-gradient(135deg, var(--success), var(--info))'
        },
        {
          id: 'review',
          label: t('common.reviewNeeded'),
          count: stats.review,
          icon: 'ri-refresh-line',
          color: 'var(--warning)',
          gradient: 'linear-gradient(135deg, var(--warning), var(--accent-orange))'
        }
      ]
    },
    {
      title: '🎯 난이도별',
      items: [
        {
          id: 'easy',
          label: t('common.easyLevel'),
          count: stats.easy,
          icon: 'ri-check-circle-line',
          color: 'var(--success)',
          gradient: 'linear-gradient(135deg, var(--success), var(--accent-success))'
        },
        {
          id: 'medium',
          label: t('common.mediumLevel'),
          count: stats.medium,
          icon: 'ri-time-line',
          color: 'var(--warning)',
          gradient: 'linear-gradient(135deg, var(--warning), var(--accent-warning))'
        },
        {
          id: 'hard',
          label: t('common.hardLevel'),
          count: stats.hard,
          icon: 'ri-alert-circle-line',
          color: 'var(--error)',
          gradient: 'linear-gradient(135deg, var(--error), var(--accent-danger))'
        }
      ]
    },
    {
      title: '📝 품사별',
      items: [
        {
          id: 'noun',
          label: t('common.noun'),
          count: stats.nouns,
          icon: 'ri-bookmark-line',
          color: 'var(--accent-primary)',
          gradient: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
        },
        {
          id: 'verb',
          label: t('common.verb'),
          count: stats.verbs,
          icon: 'ri-play-line',
          color: 'var(--info)',
          gradient: 'linear-gradient(135deg, var(--info), var(--accent-primary))'
        },
        {
          id: 'adjective',
          label: t('common.adjective'),
          count: stats.adjectives,
          icon: 'ri-star-line',
          color: 'var(--accent-orange)',
          gradient: 'linear-gradient(135deg, var(--accent-orange), var(--warning))'
        },
        {
          id: 'adverb',
          label: t('common.adverb'),
          count: stats.adverbs,
          icon: 'ri-flashlight-line',
          color: 'var(--accent-success)',
          gradient: 'linear-gradient(135deg, var(--accent-success), var(--success))'
        }
      ]
    }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b backdrop-blur-xl" style={{ borderColor: 'var(--border-secondary)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
              <span className="text-3xl">📚</span>
              {t('wordbook.title')}
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {stats.total}{t('common.words')}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }}></i>
          <input
            placeholder={t('wordbook.search.placeholder')}
            className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border-secondary)',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        {/* View Toggle */}
        <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ backgroundColor: 'var(--surface-secondary)' }}>
          <button
            onClick={() => onViewChange('words')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeView === 'words' ? 'shadow-md scale-105' : ''
            }`}
            style={{
              backgroundColor: activeView === 'words' ? 'var(--primary)' : 'transparent',
              color: activeView === 'words' ? 'white' : 'var(--text-primary)'
            }}
          >
            <i className="ri-book-line"></i>
            {t('wordbook.words')}
          </button>
          <button
            onClick={() => onViewChange('quiz-history')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeView === 'quiz-history' ? 'shadow-md scale-105' : ''
            }`}
            style={{
              backgroundColor: activeView === 'quiz-history' ? 'var(--primary)' : 'transparent',
              color: activeView === 'quiz-history' ? 'white' : 'var(--text-primary)'
            }}
          >
            <i className="ri-trophy-line"></i>
            {t('nav.quiz')}
          </button>
        </div>

        {/* Action Button */}
        <button 
          onClick={onQuizStart}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 mb-4"
          style={{
            background: 'linear-gradient(135deg, var(--success), var(--info))'
          }}
        >
          <i className="ri-play-circle-line"></i>
          {t('quiz.actions.newQuiz')}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {/* Words View */}
        {activeView === 'words' && (
          <>
            {categoryGroups.map((group) => (
              <div key={group.title} className="space-y-3">
                <h3 
                  className="text-sm font-semibold px-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onCategoryChange(item.id)}
                      className={`w-full p-3 rounded-xl border-l-4 transition-all duration-200 hover:shadow-lg ${
                        selectedCategory === item.id ? 'shadow-md scale-105' : ''
                      }`}
                      style={{
                        backgroundColor: selectedCategory === item.id ? 'var(--surface-secondary)' : 'var(--surface-primary)',
                        borderColor: selectedCategory === item.id ? item.color : 'var(--border-secondary)'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                            style={{ background: item.gradient }}
                          >
                            <i className={item.icon}></i>
                          </div>
                          <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                            {item.label}
                          </span>
                        </div>
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${item.color}20`,
                            color: item.color
                          }}
                        >
                          {item.count}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
        
        {/* Quiz History View */}
        {activeView === 'quiz-history' && (
          <div>
            <div className="flex items-center justify-between mb-3 px-2">
              <h3 
                className="text-sm font-semibold"
                style={{ color: 'var(--text-secondary)' }}
              >
                🏆 {t('quiz.history')}
              </h3>
              <button
                onClick={() => router.push('/quiz/history')}
                className="px-2 py-1 rounded-lg text-xs font-medium hover:shadow-md transition-all"
                style={{
                  backgroundColor: 'var(--primary)20',
                  color: 'var(--primary)'
                }}
              >
                {t('common.viewAll')}
              </button>
            </div>
            
            <div className="space-y-2">
              {/* 전체 퀴즈 */}
              <div 
                onClick={() => onQuizStatusChange?.('ALL')}
                className={`p-3 rounded-xl border-l-4 transition-all duration-200 hover:shadow-lg cursor-pointer ${
                  safeSelectedQuizStatus === 'ALL' ? 'ring-2 ring-offset-2' : ''
                }`}
                style={{
                  backgroundColor: safeSelectedQuizStatus === 'ALL' ? 'var(--surface-primary)' : 'var(--surface-secondary)',
                  borderColor: 'var(--primary)'
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                      style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
                    >
                      <i className="ri-apps-line"></i>
                    </div>
                    <span 
                      className="font-medium text-sm"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {t('quiz.status.all')}
                    </span>
                  </div>
                  <span 
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: 'var(--primary)20',
                      color: 'var(--primary)'
                    }}
                  >
                    {safeQuizStats.total}
                  </span>
                </div>
              </div>
              
              {/* 진행 중 퀴즈 */}
              <div 
                onClick={() => onQuizStatusChange?.('PENDING')}
                className={`p-3 rounded-xl border-l-4 transition-all duration-200 hover:shadow-lg cursor-pointer ${
                  safeSelectedQuizStatus === 'PENDING' ? 'ring-2 ring-offset-2' : ''
                }`}
                style={{
                  backgroundColor: safeSelectedQuizStatus === 'PENDING' ? 'var(--surface-primary)' : 'var(--surface-secondary)',
                  borderColor: 'var(--warning)'
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                      style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                    >
                      <i className="ri-time-line"></i>
                    </div>
                    <span 
                      className="font-medium text-sm"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {t('quiz.status.pending')}
                    </span>
                  </div>
                  <span 
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: 'rgba(245, 158, 11, 0.2)',
                      color: 'var(--warning)'
                    }}
                  >
                    {safeQuizStats.pending}
                  </span>
                </div>
              </div>
              
              {/* 완료된 퀴즈 */}
              <div 
                onClick={() => onQuizStatusChange?.('SUBMIT')}
                className={`p-3 rounded-xl border-l-4 transition-all duration-200 hover:shadow-lg cursor-pointer ${
                  safeSelectedQuizStatus === 'SUBMIT' ? 'ring-2 ring-offset-2' : ''
                }`}
                style={{
                  backgroundColor: safeSelectedQuizStatus === 'SUBMIT' ? 'var(--surface-primary)' : 'var(--surface-secondary)',
                  borderColor: 'var(--success)'
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                      style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                    >
                      <i className="ri-check-circle-line"></i>
                    </div>
                    <span 
                      className="font-medium text-sm"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {t('quiz.status.submit')}
                    </span>
                  </div>
                  <span 
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: 'rgba(34, 197, 94, 0.2)',
                      color: 'var(--success)'
                    }}
                  >
                    {safeQuizStats.completed}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div 
        className="p-4 border-t"
        style={{ borderColor: 'var(--border-secondary)' }}
      >
        <div 
          className="p-3 rounded-xl border-l-4"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--info)'
          }}
        >
          <div className="flex items-start gap-2">
            <i 
              className="ri-lightbulb-line text-lg mt-0.5"
              style={{ color: 'var(--info)' }}
            ></i>
            <div>
              <div 
                className="text-xs font-semibold mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                💡 학습 팁
              </div>
              <div 
                className="text-xs"
                style={{ color: 'var(--text-secondary)' }}
              >
                카드를 클릭하면 상세 정보를 볼 수 있어요!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
