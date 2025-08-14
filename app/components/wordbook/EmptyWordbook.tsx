'use client';

// Remix Icon 사용 (lucide-react 대신)
import { useTranslation } from '../../../lib/hooks/useTranslation';

interface EmptyWordbookProps {
  hasSearch: boolean;
  onAddWord: () => void;
}

export default function EmptyWordbook({ hasSearch, onAddWord }: EmptyWordbookProps) {
  const { t } = useTranslation(['wordbook', 'common']);

  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="text-center max-w-2xl mx-auto">
        {hasSearch ? (
          // No search results
          <div className="space-y-8">
            <div className="relative">
              <div 
                className="w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 shadow-xl"
                style={{
                  background: 'var(--gradient-tertiary)'
                }}
              >
                <i className="ri-search-line w-16 h-16" 
                  style={{ color: 'var(--text-tertiary)' }}
                />
                <div 
                  className="absolute inset-0 rounded-full blur-xl"
                  style={{
                    background: 'linear-gradient(to right, var(--accent-primary-alpha), var(--accent-secondary-alpha))'
                  }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 
                className="text-3xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                검색 결과가 없어요
              </h3>
              <p 
                className="text-xl"
                style={{ color: 'var(--text-secondary)' }}
              >
                다른 키워드로 검색해보시거나 새로운 단어를 추가해보세요
              </p>
            </div>
            
            <button
              onClick={onAddWord}
              className="group px-8 py-4 rounded-2xl hover:shadow-2xl transition-all duration-300 whitespace-nowrap cursor-pointer font-semibold hover:-translate-y-1 border mx-auto inline-flex items-center"
              style={{
                background: 'var(--gradient-primary)',
                color: 'var(--text-on-accent)',
                borderColor: 'var(--accent-primary-alpha)',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <i className="ri-add-line w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-300" />
              새 단어 추가하기
            </button>
          </div>
        ) : (
          // Empty wordbook
          <div className="space-y-12">
            <div className="relative">
              <div 
                className="absolute inset-0 rounded-full blur-3xl"
                style={{
                  background: 'linear-gradient(to right, var(--accent-primary-alpha), var(--accent-secondary-alpha), var(--accent-tertiary-alpha))'
                }}
              ></div>
              <div 
                className="relative w-40 h-40 mx-auto rounded-3xl flex items-center justify-center mb-8 shadow-2xl transform hover:rotate-3 transition-transform duration-500"
                style={{
                  background: 'var(--gradient-primary)'
                }}
              >
                <i className="ri-book-open-line w-20 h-20 text-white" />
                <i className="ri-sparkles-line absolute -top-4 -right-4 w-8 h-8 text-yellow-400 animate-pulse" />
                <i className="ri-flashlight-line absolute -bottom-2 -left-2 w-6 h-6 text-yellow-300 animate-bounce" />
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 
                className="text-4xl font-bold"
                style={{
                  background: 'var(--gradient-text-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                단어장이 비어있어요 ✨
              </h2>
              <p 
                className="text-xl max-w-lg mx-auto leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                첫 번째 단어를 추가하고 영어 학습 여정을 시작해보세요! 
                <br />채팅에서 배운 단어들도 자동으로 추가될 거예요.
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={onAddWord}
                className="group px-10 py-5 rounded-3xl hover:shadow-2xl transition-all duration-500 whitespace-nowrap cursor-pointer font-bold text-lg hover:-translate-y-1 border mx-auto inline-flex items-center"
                style={{
                  background: 'var(--gradient-primary)',
                  color: 'var(--text-on-accent)',
                  borderColor: 'var(--accent-primary-alpha)',
                  boxShadow: 'var(--shadow-xl)'
                }}
              >
                <i className="ri-add-line w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                첫 단어 추가하기
              </button>
              
              <div 
                className="flex items-center justify-center space-x-8 text-sm"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: 'var(--accent-success)' }}
                  ></div>
                  <span>채팅에서 자동 추가</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                  ></div>
                  <span>퀴즈로 복습</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: 'var(--accent-tertiary)' }}
                  ></div>
                  <span>진도 추적</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}