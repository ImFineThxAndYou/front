'use client';

import { useState, useEffect } from 'react';
import { useWordbookStore } from '../../lib/stores/wordbook';
import { useAuthStore } from '../../lib/stores/auth';
import { useTranslation } from '../../lib/hooks/useTranslation';
import { vocabookService } from '../../lib/services/vocabookService';
import { quizService } from '../../lib/services/quizService';
import MainLayout from '../components/layout/MainLayout';
import WordbookSidebar from '../components/wordbook/WordbookSidebar';
import WordCardGrid from '../components/wordbook/WordCardGrid';
import QuizHistoryGrid from '../components/wordbook/QuizHistoryGrid';
import QuizModal from '../components/wordbook/QuizModal';

import { Word } from '../../lib/stores/wordbook';

export default function WordbookPage() {
  const { 
    words, 
    filters, 
    getFilteredWords, 
    getTodayWords,
    setSearchQuery,
    loadWords,
    isLoading
  } = useWordbookStore();
  
  const { user, isAuthenticated } = useAuthStore();
  
  // 디버깅을 위한 추가 로그
  console.log('🔍 [WordbookPage] 렌더링 - user:', user, 'isAuthenticated:', isAuthenticated);
  
  const { t } = useTranslation(['wordbook', 'common']);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [searchQuery, setLocalSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'words' | 'quiz-history'>('words');
  const [selectedQuizStatus, setSelectedQuizStatus] = useState<'ALL' | 'PENDING' | 'SUBMIT'>('ALL');
  const [quizStats, setQuizStats] = useState<{
    total: number;
    pending: number;
    completed: number;
  } | null>(null);

  const filteredWords = getFilteredWords();
  const todayWords = getTodayWords();

  // 퀴즈 통계 로드
  const loadQuizStats = async () => {
    try {
      const response = await quizService.getMyQuizzes(0, 1000); // 충분히 큰 수로 전체 로드
      const total = response.totalElements;
      const pending = response.content.filter(q => q.status === 'PENDING').length;
      const completed = response.content.filter(q => q.status === 'SUBMIT').length;
      
      setQuizStats({ total, pending, completed });
    } catch (error) {
      console.error('퀴즈 통계 로드 실패:', error);
    }
  };

  // 단어장 API 직접 테스트
  const testVocabookAPI = async () => {
    console.log('🧪 [WordbookPage] 단어장 API 직접 테스트 시작');
    console.log('👤 [WordbookPage] 현재 사용자:', user);
    
    const membernameToUse = user?.membername || 'test'; // 현재 사용자의 membername 사용
    console.log('🎯 [WordbookPage] 사용할 membername:', membernameToUse);
    
    try {
      // 1. Store를 거치지 않고 직접 API 서비스 호출
      console.log('🔄 [WordbookPage] VocabookService 직접 호출 -', membernameToUse);
      const result = await vocabookService.getVocabulariesByMember(membernameToUse);
      console.log('✅ [WordbookPage] VocabookService 직접 호출 성공:', result);
      
      // 2. Store를 통한 호출도 테스트
      console.log('🔄 [WordbookPage] Store를 통한 호출 -', membernameToUse);
      await loadWords(membernameToUse);
      console.log('✅ [WordbookPage] Store를 통한 호출 성공');
      
    } catch (error) {
      console.error('❌ [WordbookPage] API 테스트 실패:', error);
    }
  };

  // 페이지 로드 시 무조건 API 테스트
  useEffect(() => {
    console.log('🔄 [WordbookPage] 페이지 로드됨 - 무조건 API 테스트');
    console.log('👤 [WordbookPage] user 확인:', user);
    
    // 사용자 정보가 있을 때만 API 호출
    if (user?.membername) {
      console.log('✅ [WordbookPage] 사용자 정보 확인됨, 2초 후 API 테스트');
      setTimeout(() => {
        testVocabookAPI();
        loadQuizStats(); // 퀴즈 통계도 함께 로드
      }, 2000);
    } else {
      console.log('⏳ [WordbookPage] 사용자 정보 대기 중...');
    }
  }, [user]); // user 정보가 변경될 때 실행

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      setSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, setSearchQuery]);

  // 카테고리별 단어 필터링
  const getCategoryWords = () => {
    let categoryWords = filteredWords;
    
    switch (selectedCategory) {
      case 'today':
        categoryWords = todayWords;
        break;
      case 'easy':
        categoryWords = filteredWords.filter(w => w.difficulty <= 2);
        break;
      case 'medium':
        categoryWords = filteredWords.filter(w => w.difficulty === 3);
        break;
      case 'hard':
        categoryWords = filteredWords.filter(w => w.difficulty >= 4);
        break;
      case 'noun':
        categoryWords = filteredWords.filter(w => w.partOfSpeech === 'noun');
        break;
      case 'verb':
        categoryWords = filteredWords.filter(w => w.partOfSpeech === 'verb');
        break;
      case 'adjective':
        categoryWords = filteredWords.filter(w => w.partOfSpeech === 'adjective');
        break;
      case 'adverb':
        categoryWords = filteredWords.filter(w => w.partOfSpeech === 'adverb');
        break;
      case 'review':
        categoryWords = filteredWords.filter(w => w.difficulty >= 4);
        break;
      default:
        categoryWords = filteredWords;
    }
    
    return categoryWords;
  };

  const categoryWords = getCategoryWords();

  // 통계 계산
  const stats = {
    total: filteredWords.length,
    today: todayWords.length,
    easy: filteredWords.filter(w => w.difficulty <= 2).length,
    medium: filteredWords.filter(w => w.difficulty === 3).length,
    hard: filteredWords.filter(w => w.difficulty >= 4).length,
    nouns: filteredWords.filter(w => w.partOfSpeech === 'noun').length,
    verbs: filteredWords.filter(w => w.partOfSpeech === 'verb').length,
    adjectives: filteredWords.filter(w => w.partOfSpeech === 'adjective').length,
    adverbs: filteredWords.filter(w => w.partOfSpeech === 'adverb').length,
    review: filteredWords.filter(w => w.difficulty >= 4).length
  };

  const handleWordSelect = (word: Word) => {
    setSelectedWord(word);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedWord(null); // 카테고리 변경 시 선택된 단어 초기화
  };

  const handleQuizStatusChange = (status: 'ALL' | 'PENDING' | 'SUBMIT') => {
    setSelectedQuizStatus(status);
    setActiveView('quiz-history'); // 퀴즈 상태 변경 시 자동으로 퀴즈 히스토리 뷰로 전환
  };

  return (
    <MainLayout>
      <div 
        className="flex h-full theme-transition"
        style={{
          background: `linear-gradient(135deg, 
            var(--bg-primary) 0%, 
            var(--bg-secondary) 25%, 
            var(--bg-tertiary) 50%, 
            var(--bg-secondary) 75%, 
            var(--bg-primary) 100%)`
        }}
      >
        {/* Wordbook Sidebar */}
        <div 
          className="w-80 border-r h-full flex-shrink-0 backdrop-blur-xl theme-transition"
          style={{
            backgroundColor: 'var(--surface-primary)',
            borderColor: 'var(--border-primary)',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <WordbookSidebar 
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            onQuizStart={() => setShowQuizModal(true)}
            stats={stats}
            searchQuery={searchQuery}
            onSearchChange={setLocalSearchQuery}
            activeView={activeView}
            onViewChange={setActiveView}
            quizStats={quizStats}
            selectedQuizStatus={selectedQuizStatus}
            onQuizStatusChange={handleQuizStatusChange}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full min-w-0 relative">
          {/* API 테스트 및 상태 표시 (디버깅용) */}
          <div className="p-4 bg-blue-50 border-b border-blue-200">
            <div className="flex flex-wrap gap-2 items-center">
              <button 
                onClick={testVocabookAPI}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                disabled={isLoading}
              >
                🧪 API 테스트
              </button>
              <button 
                onClick={() => loadWords(user?.membername || 'user1')}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                disabled={isLoading}
              >
                🔄 단어장 새로고침 ({user?.membername || 'user1'})
              </button>
              <div className="flex gap-2 text-sm">
                <span className="px-3 py-1 bg-white rounded border">
                  📊 총 단어: {words.length}개
                </span>
                <span className="px-3 py-1 bg-white rounded border">
                  👤 사용자: {user?.membername || 'user1'}
                </span>
                <span className={`px-3 py-1 rounded border ${isLoading ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  {isLoading ? '⏳ 로딩 중...' : '✅ 준비'}
                </span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
              </div>
            </div>
          ) : activeView === 'words' ? (
            <WordCardGrid 
              words={categoryWords}
              selectedWord={selectedWord}
              onWordSelect={handleWordSelect}
              category={selectedCategory}
              searchQuery={searchQuery}
            />
          ) : (
            <QuizHistoryGrid 
              onQuizStart={() => setShowQuizModal(true)}
              selectedStatus={selectedQuizStatus}
            />
          )}
        </div>

        {/* Quiz Modal */}
        {showQuizModal && (
          <QuizModal onClose={() => setShowQuizModal(false)} />
        )}
      </div>
    </MainLayout>
  );
}