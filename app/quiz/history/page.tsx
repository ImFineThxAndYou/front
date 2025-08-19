'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { quizService, QuizResult, QuizStatus } from '../../../lib/services/quizService';
import MainLayout from '../../../components/layout/MainLayout';
import { useTranslation } from '../../../lib/hooks/useTranslation';
import QuizCard from '../../../components/quiz/QuizCard';

export default function QuizHistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation(['quiz', 'common']);
  const [quizzes, setQuizzes] = useState<QuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<QuizStatus | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    // URL 파라미터에서 상태 확인
    const statusParam = searchParams.get('status');
    if (statusParam && (statusParam === 'ALL' || statusParam === 'PENDING' || statusParam === 'SUBMIT')) {
      setSelectedStatus(statusParam as QuizStatus | 'ALL');
    }
  }, [searchParams]);

  useEffect(() => {
    loadQuizHistory();
  }, [selectedStatus, currentPage]);

  const loadQuizHistory = async () => {
    try {
      setIsLoading(true);
      const status = selectedStatus === 'ALL' ? undefined : selectedStatus;
      const response = await quizService.getMyQuizzes(currentPage, 20, status);
      
      setQuizzes(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('퀴즈 기록 로드 실패:', error);
      alert('퀴즈 기록을 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizClick = (quiz: QuizResult) => {
    if (quiz.status === 'PENDING') {
      router.push(`/quiz/${quiz.quizUUID}`);
    } else {
      router.push(`/quiz/result/${quiz.quizUUID}`);
    }
  };

  const handleRetakeQuiz = async (quiz: QuizResult, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      let newQuiz;
      
      if (quiz.quizType === 'DAILY' && quiz.dailyDate) {
        newQuiz = await quizService.startDailyQuiz(quiz.dailyDate);
      } else {
        newQuiz = await quizService.startRandomQuiz();
      }
      
      router.push(`/quiz/${newQuiz.quizUUID}`);
    } catch (error) {
      console.error('재시험 시작 실패:', error);
      alert('재시험을 시작할 수 없습니다.');
    }
  };







  const filterOptions = [
    { value: 'ALL', label: t('quiz.status.all'), icon: 'ri-list-unordered' },
    { value: 'PENDING', label: t('quiz.status.pending'), icon: 'ri-time-line' },
    { value: 'SUBMIT', label: t('quiz.status.submit'), icon: 'ri-check-circle-line' },
  ];

  return (
    <MainLayout>
      <div 
        className="h-full overflow-y-auto theme-transition"
        style={{
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)'
        }}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-6">
          <div 
            className="backdrop-blur-xl rounded-3xl border shadow-2xl p-6 theme-transition"
            style={{
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border-primary)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)'
                  }}
                >
                  <i className="ri-history-line text-2xl text-white"></i>
                </div>
                <div>
                  <h1 
                    className="text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
                    style={{
                      backgroundImage: 'linear-gradient(135deg, #667eea, #764ba2)'
                    }}
                  >
                    {t('quiz.history')}
                  </h1>
                  <p 
                    className="text-sm font-medium"
                    style={{ 
                      color: 'var(--text-secondary)',
                      filter: 'contrast(1.2)'
                    }}
                  >
                    {t('quiz.totalResults', { count: totalElements })}
                  </p>
                </div>
              </div>

              <button
                onClick={async () => {
                  try {
                    const newQuiz = await quizService.startRandomQuiz();
                    router.push(`/quiz/${newQuiz.quizUUID}`);
                  } catch (error) {
                    console.error('새 퀴즈 시작 실패:', error);
                    alert('새 퀴즈를 시작할 수 없습니다.');
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))'
                }}
              >
                <i className="ri-add-line"></i>
                새 퀴즈
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 p-1 rounded-2xl"
              style={{ backgroundColor: 'var(--surface-secondary)' }}
            >
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedStatus(option.value as QuizStatus | 'ALL');
                    setCurrentPage(0);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedStatus === option.value ? 'shadow-md scale-105' : ''
                  }`}
                  style={{
                    backgroundColor: selectedStatus === option.value ? 'var(--primary)' : 'transparent',
                    color: selectedStatus === option.value ? 'white' : 'var(--text-primary)'
                  }}
                >
                  <i className={option.icon}></i>
                  {option.label}
                  {option.value === 'ALL' && (
                    <span 
                      className="px-2 py-1 rounded-full text-xs"
                      style={{
                        backgroundColor: selectedStatus === option.value ? 'white' : 'var(--surface-primary)',
                        color: selectedStatus === option.value ? 'var(--primary)' : 'var(--text-secondary)'
                      }}
                    >
                      {totalElements}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 pt-0 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-20">
              <div 
                className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin mb-4 mx-auto"
                style={{ borderColor: 'var(--primary)' }}
              />
              <p style={{ color: 'var(--text-secondary)' }}>퀴즈 기록을 불러오는 중...</p>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-20">
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: 'var(--surface-secondary)' }}
              >
                <i 
                  className="ri-file-list-3-line text-4xl"
                  style={{ color: 'var(--text-tertiary)' }}
                ></i>
              </div>
              <h3 
                className="text-xl font-semibold mb-3"
                style={{ color: 'var(--text-primary)' }}
              >
                {selectedStatus === 'ALL' ? '퀴즈 기록이 없습니다' : `${filterOptions.find(o => o.value === selectedStatus)?.label} 퀴즈가 없습니다`}
              </h3>
              <p 
                className="text-sm mb-8"
                style={{ color: 'var(--text-secondary)' }}
              >
                첫 번째 퀴즈를 시작해서
                <br />
                학습 기록을 쌓아보세요!
              </p>
              <button
                onClick={() => router.push('/wordbook')}
                className="px-8 py-3 rounded-2xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))'
                }}
              >
                퀴즈 시작하기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizzes.map((quiz) => (

                return (
                  <div
                    key={quiz.quizUUID}
                    onClick={() => handleQuizClick(quiz)}
                    className="group relative rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border overflow-hidden"
                    style={{
                      backgroundColor: 'var(--surface-primary)',
                      borderColor: 'var(--border-primary)'
                    }}
                  >
                    {/* Quiz Type Indicator */}
                    <div 
                      className="absolute top-0 left-0 w-1 h-full"
                      style={{ backgroundColor: typeInfo.color }}
                    />

                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        {/* Left Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <div 
                              className="w-10 h-10 rounded-xl flex items-center justify-center"
                              style={{
                                backgroundColor: `${typeInfo.color}20`,
                                color: typeInfo.color
                              }}
                            >
                              <i className={`${typeInfo.icon} text-lg`}></i>
                            </div>
                            
                            <div className="min-w-0 flex-1">
                              <h3 
                                className="text-lg font-semibold truncate"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {typeInfo.label}
                              </h3>
                              <p 
                                className="text-sm"
                                style={{ color: 'var(--text-secondary)' }}
                              >
                                {typeInfo.sublabel}
                              </p>
                            </div>

                            <div 
                              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: statusConfig.bg,
                                color: statusConfig.color
                              }}
                            >
                              <i className={`${statusConfig.icon} text-xs`}></i>
                              {statusConfig.label}
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-6 text-sm mb-4">
                            <div className="flex items-center gap-1">
                              <i 
                                className="ri-calendar-line"
                                style={{ color: 'var(--text-tertiary)' }}
                              ></i>
                              <span style={{ color: 'var(--text-secondary)' }}>
                                {formatDate(quiz.createdAt)}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <i 
                                className="ri-file-list-line"
                                style={{ color: 'var(--text-tertiary)' }}
                              ></i>
                              <span style={{ color: 'var(--text-secondary)' }}>
                                {quiz.totalQuestions}문항
                              </span>
                            </div>

                            {quiz.status === 'SUBMIT' && (
                              <>
                                <div className="flex items-center gap-1">
                                  <i 
                                    className="ri-check-circle-line"
                                    style={{ color: 'var(--success)' }}
                                  ></i>
                                  <span style={{ color: 'var(--text-secondary)' }}>
                                    {quiz.correctCount}문제 정답
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <span className="text-lg">{scoreConfig?.emoji}</span>
                                  <span 
                                    className="font-bold"
                                    style={{ color: scoreConfig?.color }}
                                  >
                                    {quiz.score}점
                                  </span>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Progress Bar for Completed Quizzes */}
                          {quiz.status === 'SUBMIT' && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between text-xs mb-2">
                                <span style={{ color: 'var(--text-secondary)' }}>
                                  정답률
                                </span>
                                <span 
                                  className="font-medium"
                                  style={{ color: scoreConfig?.color }}
                                >
                                  {quiz.accuracy?.toFixed(1)}%
                                </span>
                              </div>
                              <div 
                                className="w-full h-2 rounded-full overflow-hidden"
                                style={{ backgroundColor: 'var(--surface-secondary)' }}
                              >
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{ 
                                    width: `${quiz.accuracy}%`,
                                    backgroundColor: scoreConfig?.color
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3 ml-6">
                          {quiz.status === 'PENDING' ? (
                            <div className="text-right">
                              <div 
                                className="text-lg font-bold"
                                style={{ color: 'var(--warning)' }}
                              >
                                계속 풀기
                              </div>
                              <div 
                                className="text-xs"
                                style={{ color: 'var(--text-secondary)' }}
                              >
                                미완료
                              </div>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={(e) => handleRetakeQuiz(quiz, e)}
                                className="px-4 py-2 rounded-xl border-2 hover:shadow-lg transition-all text-sm font-medium group-hover:scale-105"
                                style={{
                                  borderColor: typeInfo.color,
                                  color: typeInfo.color,
                                  backgroundColor: 'transparent'
                                }}
                              >
                                재시험
                              </button>
                              
                              <div className="text-right">
                                <div 
                                  className="text-lg font-bold"
                                  style={{ color: 'var(--text-primary)' }}
                                >
                                  결과 보기
                                </div>
                                <div 
                                  className="text-xs"
                                  style={{ color: 'var(--text-secondary)' }}
                                >
                                  상세 분석
                                </div>
                              </div>
                            </>
                          )}
                          
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div 
                className="flex items-center gap-2 p-2 rounded-2xl"
                style={{ backgroundColor: 'var(--surface-primary)' }}
              >
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <i className="ri-arrow-left-line"></i>
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageIndex = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                    return (
                      <button
                        key={pageIndex}
                        onClick={() => setCurrentPage(pageIndex)}
                        className="w-12 h-12 rounded-xl transition-all font-medium"
                        style={{
                          backgroundColor: currentPage === pageIndex ? 'var(--primary)' : 'var(--surface-secondary)',
                          color: currentPage === pageIndex ? 'white' : 'var(--text-primary)'
                        }}
                      >
                        {pageIndex + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <i className="ri-arrow-right-line"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}