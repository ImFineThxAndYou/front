'use client';

import { useRouter } from 'next/navigation';

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
}

export default function WordbookSidebar({
  selectedCategory,
  onCategoryChange,
  onQuizStart,
  stats,
  searchQuery,
  onSearchChange,
  activeView,
  onViewChange
}: WordbookSidebarProps) {
  const router = useRouter();

  const categoryGroups = [
    {
      title: '📊 전체 현황',
      items: [
        {
          id: 'all',
          label: '전체 단어',
          count: stats.total,
          icon: 'ri-book-line',
          color: 'var(--primary)',
          gradient: 'linear-gradient(135deg, var(--primary), var(--secondary))'
        },
        {
          id: 'today',
          label: '오늘 추가',
          count: stats.today,
          icon: 'ri-calendar-line',
          color: 'var(--success)',
          gradient: 'linear-gradient(135deg, #10b981, #059669)'
        },
        {
          id: 'review',
          label: '복습 필요',
          count: stats.review,
          icon: 'ri-refresh-line',
          color: 'var(--warning)',
          gradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
        }
      ]
    },
    {
      title: '🎯 난이도별',
      items: [
        {
          id: 'easy',
          label: '쉬움',
          count: stats.easy,
          icon: 'ri-check-circle-line',
          color: '#10b981',
          gradient: 'linear-gradient(135deg, #10b981, #059669)'
        },
        {
          id: 'medium',
          label: '보통',
          count: stats.medium,
          icon: 'ri-time-line',
          color: '#f59e0b',
          gradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
        },
        {
          id: 'hard',
          label: '어려움',
          count: stats.hard,
          icon: 'ri-alert-circle-line',
          color: '#ef4444',
          gradient: 'linear-gradient(135deg, #ef4444, #dc2626)'
        }
      ]
    },
    {
      title: '📝 품사별',
      items: [
        {
          id: 'noun',
          label: '명사',
          count: stats.nouns,
          icon: 'ri-bookmark-line',
          color: '#8b5cf6',
          gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
        },
        {
          id: 'verb',
          label: '동사',
          count: stats.verbs,
          icon: 'ri-play-line',
          color: '#06b6d4',
          gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)'
        },
        {
          id: 'adjective',
          label: '형용사',
          count: stats.adjectives,
          icon: 'ri-star-line',
          color: '#f97316',
          gradient: 'linear-gradient(135deg, #f97316, #ea580c)'
        },
        {
          id: 'adverb',
          label: '부사',
          count: stats.adverbs,
          icon: 'ri-speed-line',
          color: '#ec4899',
          gradient: 'linear-gradient(135deg, #ec4899, #db2777)'
        }
      ]
    }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor: 'var(--border-secondary)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))'
            }}
          >
            <i className="ri-book-open-line text-xl text-white"></i>
          </div>
          <div>
            <h1 
              className="text-xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              단어장
            </h1>
            <p 
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              {stats.total}개의 단어
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <i 
            className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2"
            style={{ color: 'var(--text-tertiary)' }}
          ></i>
          <input
            type="text"
            placeholder="단어 검색..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all"
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
            단어
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
            퀴즈
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
          새 퀴즈 시작
        </button>
      </div>

      {/* Categories - Only show for words view */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {activeView === 'words' && categoryGroups.map((group) => (
          <div key={group.title}>
            <h3 
              className="text-sm font-semibold mb-3 px-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              {group.title}
            </h3>
            
            <div className="space-y-2">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onCategoryChange(item.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:shadow-lg ${
                    selectedCategory === item.id ? 'shadow-lg scale-105' : 'hover:scale-102'
                  }`}
                  style={{
                    backgroundColor: selectedCategory === item.id 
                      ? `${item.color}15` 
                      : 'var(--surface-secondary)',
                    border: selectedCategory === item.id 
                      ? `2px solid ${item.color}` 
                      : '2px solid transparent'
                  }}
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold"
                    style={{ background: item.gradient }}
                  >
                    <i className={`${item.icon} text-lg`}></i>
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div 
                      className="font-medium text-sm"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {item.label}
                    </div>
                    <div 
                      className="text-xs"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {item.count}개 단어
                    </div>
                  </div>
                  
                  <div 
                    className="text-lg font-bold px-3 py-1 rounded-lg"
                    style={{
                      backgroundColor: selectedCategory === item.id ? item.color : 'var(--surface-primary)',
                      color: selectedCategory === item.id ? 'white' : item.color
                    }}
                  >
                    {item.count}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
        
        {/* Quiz History Filter - Only show for quiz view */}
        {activeView === 'quiz-history' && (
          <div>
            <h3 
              className="text-sm font-semibold mb-3 px-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              🏆 퀴즈 기록
            </h3>
            
            <div className="space-y-2">
              <div 
                className="p-4 rounded-xl border-l-4"
                style={{
                  backgroundColor: 'var(--info)10',
                  borderColor: 'var(--info)'
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <i 
                    className="ri-information-line text-lg"
                    style={{ color: 'var(--info)' }}
                  ></i>
                  <span 
                    className="font-semibold text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    퀴즈 통계
                  </span>
                </div>
                <div className="space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <div>• 총 퀴즈 수: 0개</div>
                  <div>• 완료율: 0%</div>
                  <div>• 평균 점수: 0점</div>
                  <div>• 연속 학습: 0일</div>
                </div>
              </div>
              
              <div 
                className="p-4 rounded-xl border-l-4"
                style={{
                  backgroundColor: 'var(--success)10',
                  borderColor: 'var(--success)'
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <i 
                    className="ri-trophy-line text-lg"
                    style={{ color: 'var(--success)' }}
                  ></i>
                  <span 
                    className="font-semibold text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    최고 기록
                  </span>
                </div>
                <div className="space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <div>• 최고 점수: 0점</div>
                  <div>• 완벽한 퀴즈: 0개</div>
                  <div>• 가장 어려운 레벨: -</div>
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
