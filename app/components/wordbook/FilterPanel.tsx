
'use client';

import { useTranslation } from '../../../lib/hooks/useTranslation';
import { useWordbookStore } from '../../../lib/stores/wordbook';

const DIFFICULTY_LEVELS = [1, 2, 3, 4, 5];
const PARTS_OF_SPEECH = ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'interjection'];

export default function FilterPanel() {
  const { t } = useTranslation(['wordbook']);
  const { filters, setDifficultyFilter, setPartOfSpeechFilter } = useWordbookStore();

  const handleDifficultyToggle = (level: number) => {
    const newDifficulty = filters.difficulty.includes(level)
      ? filters.difficulty.filter(d => d !== level)
      : [...filters.difficulty, level];
    setDifficultyFilter(newDifficulty);
  };

  const handlePartOfSpeechToggle = (pos: string) => {
    const newPartOfSpeech = filters.partOfSpeech.includes(pos)
      ? filters.partOfSpeech.filter(p => p !== pos)
      : [...filters.partOfSpeech, pos];
    setPartOfSpeechFilter(newPartOfSpeech);
  };

  const getDifficultyColor = (level: number, isActive: boolean) => {
    const colors = {
      1: isActive ? 'var(--accent-success)' : 'var(--accent-success-bg)',
      2: isActive ? 'var(--accent-primary)' : 'var(--accent-primary-bg)',
      3: isActive ? 'var(--accent-warning)' : 'var(--accent-warning-bg)',
      4: isActive ? 'var(--accent-orange)' : 'var(--accent-orange-bg)',
      5: isActive ? 'var(--accent-danger)' : 'var(--accent-danger-bg)',
    };
    return colors[level as keyof typeof colors] || '';
  };

  const getDifficultyTextColor = (level: number, isActive: boolean) => {
    if (isActive) return 'var(--text-on-accent)';
    
    const colors = {
      1: 'var(--accent-success)',
      2: 'var(--accent-primary)',
      3: 'var(--accent-warning)',
      4: 'var(--accent-orange)',
      5: 'var(--accent-danger)',
    };
    return colors[level as keyof typeof colors] || 'var(--text-secondary)';
  };

  const getDifficultyBorderColor = (level: number, isActive: boolean) => {
    if (isActive) {
      const colors = {
        1: 'var(--accent-success)',
        2: 'var(--accent-primary)',
        3: 'var(--accent-warning)',
        4: 'var(--accent-orange)',
        5: 'var(--accent-danger)',
      };
      return colors[level as keyof typeof colors] || 'var(--border-primary)';
    }
    
    const colors = {
      1: 'var(--accent-success-alpha)',
      2: 'var(--accent-primary-alpha)',
      3: 'var(--accent-warning-alpha)',
      4: 'var(--accent-orange-alpha)',
      5: 'var(--accent-danger-alpha)',
    };
    return colors[level as keyof typeof colors] || 'var(--border-secondary)';
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Difficulty Filter */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <i className="ri-star-fill w-4 h-4" style={{ color: 'var(--accent-warning)' }} />
            <h3 
              className="font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              난이도
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTY_LEVELS.map(level => {
              const isActive = filters.difficulty.includes(level);
              return (
                <button
                  key={level}
                  onClick={() => handleDifficultyToggle(level)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer border"
                  style={{
                    backgroundColor: isActive ? getDifficultyColor(level, true) : getDifficultyColor(level, false),
                    color: getDifficultyTextColor(level, isActive),
                    borderColor: getDifficultyBorderColor(level, isActive)
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = getDifficultyColor(level, false);
                    }
                  }}
                >
                  <div className="flex items-center space-x-1">
                    <i className="ri-star-fill w-3 h-3" />
                    <span>{level}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Part of Speech Filter */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <i className="ri-hash w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
            <h3 
              className="font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              품사
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {PARTS_OF_SPEECH.map(pos => {
              const isActive = filters.partOfSpeech.includes(pos);
              return (
                <button
                  key={pos}
                  onClick={() => handlePartOfSpeechToggle(pos)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer border"
                  style={{
                    backgroundColor: isActive ? 'var(--accent-primary)' : 'var(--surface-secondary)',
                    color: isActive ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                    borderColor: isActive ? 'var(--accent-primary)' : 'var(--border-secondary)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                    }
                  }}
                >
                  {t(`wordbook.partOfSpeech.${pos}`)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
