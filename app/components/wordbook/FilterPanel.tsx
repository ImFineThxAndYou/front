'use client';

import { useWordbookStore } from '../../../lib/stores/wordbook';

export default function FilterPanel() {
  const { filters, setDifficultyFilter, setPartOfSpeechFilter, clearFilters } = useWordbookStore();

  const difficultyOptions = [
    { value: 1, label: '매우 쉬움', color: 'var(--success)', count: 0 },
    { value: 2, label: '쉬움', color: 'var(--info)', count: 0 },
    { value: 3, label: '보통', color: 'var(--warning)', count: 0 },
    { value: 4, label: '어려움', color: 'var(--danger)', count: 0 },
    { value: 5, label: '매우 어려움', color: 'var(--danger)', count: 0 },
  ];

  const posOptions = [
    { value: 'noun', label: '명사', icon: 'ri-bookmark-line' },
    { value: 'verb', label: '동사', icon: 'ri-play-line' },
    { value: 'adjective', label: '형용사', icon: 'ri-star-line' },
    { value: 'adverb', label: '부사', icon: 'ri-speed-line' },
    { value: 'preposition', label: '전치사', icon: 'ri-link' },
    { value: 'conjunction', label: '접속사', icon: 'ri-shuffle-line' },
  ];

  const handleDifficultyChange = (difficulty: number) => {
    const newDifficulties = filters.difficulty.includes(difficulty)
      ? filters.difficulty.filter(d => d !== difficulty)
      : [...filters.difficulty, difficulty];
    setDifficultyFilter(newDifficulties);
  };

  const handlePosChange = (pos: string) => {
    const newPos = filters.partOfSpeech.includes(pos)
      ? filters.partOfSpeech.filter(p => p !== pos)
      : [...filters.partOfSpeech, pos];
    setPartOfSpeechFilter(newPos);
  };

  const hasActiveFilters = filters.difficulty.length > 0 || filters.partOfSpeech.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 
          className="text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          필터
        </h3>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: 'var(--primary)' }}
          >
            초기화
          </button>
        )}
      </div>

      {/* Difficulty Filter */}
      <div>
        <h4 
          className="text-sm font-semibold mb-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          🎯 난이도
        </h4>
        
        <div className="space-y-2">
          {difficultyOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 p-3 rounded-xl hover:shadow-sm transition-all cursor-pointer"
              style={{
                backgroundColor: filters.difficulty.includes(option.value) 
                  ? `${option.color}10` 
                  : 'var(--surface-secondary)'
              }}
            >
              <input
                type="checkbox"
                checked={filters.difficulty.includes(option.value)}
                onChange={() => handleDifficultyChange(option.value)}
                className="sr-only"
              />
              
              <div 
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  filters.difficulty.includes(option.value) ? 'shadow-sm' : ''
                }`}
                style={{
                  borderColor: filters.difficulty.includes(option.value) ? option.color : 'var(--border-secondary)',
                  backgroundColor: filters.difficulty.includes(option.value) ? option.color : 'transparent'
                }}
              >
                {filters.difficulty.includes(option.value) && (
                  <i className="ri-check-line text-xs text-white"></i>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div 
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {option.label}
                </div>
                <div 
                  className="text-xs"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  레벨 {option.value}
                </div>
              </div>
              
              <div 
                className="text-xs px-2 py-1 rounded-full font-medium"
                style={{
                  backgroundColor: 'var(--surface-primary)',
                  color: 'var(--text-secondary)'
                }}
              >
                {option.count}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Part of Speech Filter */}
      <div>
        <h4 
          className="text-sm font-semibold mb-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          📝 품사
        </h4>
        
        <div className="space-y-2">
          {posOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 p-3 rounded-xl hover:shadow-sm transition-all cursor-pointer"
              style={{
                backgroundColor: filters.partOfSpeech.includes(option.value) 
                  ? 'var(--primary)10' 
                  : 'var(--surface-secondary)'
              }}
            >
              <input
                type="checkbox"
                checked={filters.partOfSpeech.includes(option.value)}
                onChange={() => handlePosChange(option.value)}
                className="sr-only"
              />
              
              <div 
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  filters.partOfSpeech.includes(option.value) ? 'shadow-sm' : ''
                }`}
                style={{
                  borderColor: filters.partOfSpeech.includes(option.value) ? 'var(--primary)' : 'var(--border-secondary)',
                  backgroundColor: filters.partOfSpeech.includes(option.value) ? 'var(--primary)' : 'transparent'
                }}
              >
                {filters.partOfSpeech.includes(option.value) && (
                  <i className="ri-check-line text-xs text-white"></i>
                )}
              </div>
              
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: filters.partOfSpeech.includes(option.value) 
                    ? 'var(--primary)' 
                    : 'var(--surface-primary)',
                  color: filters.partOfSpeech.includes(option.value) 
                    ? 'white' 
                    : 'var(--text-secondary)'
                }}
              >
                <i className={`${option.icon} text-sm`}></i>
              </div>
              
              <div className="flex-1 min-w-0">
                <div 
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {option.label}
                </div>
                <div 
                  className="text-xs capitalize"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {option.value}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div 
        className="p-4 rounded-xl border-l-4"
        style={{
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--info)'
        }}
      >
        <div className="flex items-start gap-3">
          <i 
            className="ri-lightbulb-line text-lg mt-0.5"
            style={{ color: 'var(--info)' }}
          ></i>
          <div>
            <h5 
              className="font-semibold text-sm mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              빠른 필터
            </h5>
            <div className="space-y-2">
              <button
                onClick={() => setDifficultyFilter([4, 5])}
                className="block w-full text-left text-xs p-2 rounded-lg hover:shadow-sm transition-all"
                style={{
                  backgroundColor: 'var(--surface-primary)',
                  color: 'var(--text-secondary)'
                }}
              >
                어려운 단어만 보기
              </button>
              <button
                onClick={() => setPartOfSpeechFilter(['noun', 'verb'])}
                className="block w-full text-left text-xs p-2 rounded-lg hover:shadow-sm transition-all"
                style={{
                  backgroundColor: 'var(--surface-primary)',
                  color: 'var(--text-secondary)'
                }}
              >
                명사·동사만 보기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}