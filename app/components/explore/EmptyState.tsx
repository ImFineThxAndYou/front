'use client';

import { useTranslation } from '../../../lib/hooks/useTranslation';

interface EmptyStateProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export default function EmptyState({ hasFilters = false, onClearFilters }: EmptyStateProps) {
  const { t } = useTranslation('explore');

  return (
    <div className="text-center py-16">
      <div 
        className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 transition-all duration-300"
        style={{
          backgroundColor: 'var(--surface-secondary)',
          boxShadow: 'var(--shadow-xl)'
        }}
      >
        <i 
          className="ri-user-search-line text-4xl"
          style={{ color: 'var(--text-tertiary)' }}
        ></i>
      </div>
      
      <h3 
        className="text-2xl font-bold mb-4"
        style={{ color: 'var(--text-primary)' }}
      >
        {hasFilters ? '검색 결과가 없습니다' : '사용자를 찾을 수 없습니다'}
      </h3>
      
      <p 
        className="mb-8 max-w-md mx-auto text-lg"
        style={{ color: 'var(--text-secondary)' }}
      >
        {hasFilters ? '다른 관심사로 검색해보세요' : '백엔드 API에서 데이터를 불러오는 중입니다'}
      </p>
      
      {hasFilters && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 mb-12 whitespace-nowrap cursor-pointer transform hover:scale-105 hover:-translate-y-1 shadow-lg"
          style={{
            background: 'var(--gradient-secondary)',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          {t('empty.clearFilters') || 'Clear Filters'}
        </button>
      )}
      
      <div 
        className="rounded-3xl border backdrop-blur-sm p-8 max-w-2xl mx-auto transition-all duration-300"
        style={{
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border-secondary)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div className="flex items-center justify-center mb-6">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center mr-4"
            style={{
              background: 'var(--gradient-secondary)'
            }}
          >
            <i className="ri-lightbulb-line text-white text-xl"></i>
          </div>
          <h4 
            className="text-xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Exploration Tips
          </h4>
        </div>
        
        <div className="space-y-4 text-left">
          <div 
            className="flex items-start rounded-2xl p-4 backdrop-blur-sm border transition-all duration-300"
            style={{
              backgroundColor: 'var(--surface-tertiary)',
              borderColor: 'var(--border-tertiary)'
            }}
          >
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center mr-4 mt-1 flex-shrink-0"
              style={{
                background: 'var(--gradient-primary)'
              }}
            >
              <i className="ri-search-2-line text-white text-sm"></i>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>
              {t('empty.tip1') || 'Use different search terms to find more users'}
            </p>
          </div>
          
          <div 
            className="flex items-start rounded-2xl p-4 backdrop-blur-sm border transition-all duration-300"
            style={{
              backgroundColor: 'var(--surface-tertiary)',
              borderColor: 'var(--border-tertiary)'
            }}
          >
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center mr-4 mt-1 flex-shrink-0"
              style={{
                background: 'var(--gradient-primary)'
              }}
            >
              <i className="ri-user-settings-line text-white text-sm"></i>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>
              {t('empty.tip2') || 'Update your profile to attract more connections'}
            </p>
          </div>
          
          <div 
            className="flex items-start rounded-2xl p-4 backdrop-blur-sm border transition-all duration-300"
            style={{
              backgroundColor: 'var(--surface-tertiary)',
              borderColor: 'var(--border-tertiary)'
            }}
          >
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center mr-4 mt-1 flex-shrink-0"
              style={{
                background: 'var(--gradient-warm)'
              }}
            >
              <i className="ri-chat-smile-line text-white text-sm"></i>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>
              {t('empty.tip3') || 'Be friendly and start conversations naturally'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}