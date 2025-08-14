
'use client';

import { useTranslation } from '../../../lib/hooks/useTranslation';
import { useWordbookStore } from '../../../lib/stores/wordbook';

export default function BulkActions() {
  const { t } = useTranslation(['wordbook', 'common']);
  const { selectedWords, selectAllWords, clearSelection, deleteWords, startQuiz } = useWordbookStore();

  const handleStartQuiz = () => {
    startQuiz({
      count: Math.min(selectedWords.length, 20),
      difficulty: [],
      type: 'mixed'
    });
  };

  const handleDelete = async () => {
    if (confirm('선택한 단어들을 삭제하시겠습니까?')) {
      await deleteWords(selectedWords);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <i className="ri-user-line w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
            <span className="font-medium" style={{ color: 'var(--accent-primary)' }}>
              {selectedWords.length}개 선택됨
            </span>
          </div>
          
          <div className="flex items-center space-x-3 text-sm">
            <button
              onClick={selectAllWords}
              className="font-medium hover:underline cursor-pointer"
              style={{ color: 'var(--accent-primary)' }}
            >
              전체 선택
            </button>
            <span style={{ color: 'var(--border-primary)' }}>|</span>
            <button
              onClick={clearSelection}
              className="font-medium hover:underline cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            >
              선택 해제
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleStartQuiz}
            className="flex items-center px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer font-medium text-sm"
            style={{
              backgroundColor: 'var(--accent-success)',
              color: 'var(--text-on-accent)'
            }}
          >
            <i className="ri-play-line w-4 h-4 mr-1" />
            퀴즈 시작
          </button>
          
          <button className="flex items-center px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer font-medium text-sm"
            style={{
              backgroundColor: 'var(--text-secondary)',
              color: 'var(--text-on-accent)'
            }}>
            <i className="ri-download-line w-4 h-4 mr-1" />
            내보내기
          </button>
          
          <button
            onClick={handleDelete}
            className="flex items-center px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer font-medium text-sm"
            style={{
              backgroundColor: 'var(--accent-destructive)',
              color: 'var(--text-on-accent)'
            }}
          >
            <i className="ri-delete-bin-line w-4 h-4 mr-1" />
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
