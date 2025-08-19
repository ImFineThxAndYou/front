'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { quizService, QuizResult, QuizStatus } from '../../../lib/services/quizService';

interface QuizHistoryGridProps {
  onQuizStart: () => void;
  selectedStatus?: 'ALL' | 'PENDING' | 'SUBMIT';
}

export default function QuizHistoryGrid({ onQuizStart, selectedStatus: propSelectedStatus }: QuizHistoryGridProps) {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<QuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<QuizStatus | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    if (propSelectedStatus && propSelectedStatus !== selectedStatus) {
      setSelectedStatus(propSelectedStatus);
      setCurrentPage(0); // 상태 변경 시 첫 페이지로
    }
  }, [propSelectedStatus, selectedStatus]);

  useEffect(() => {
    loadQuizHistory();
  }, [selectedStatus, currentPage]);

  const loadQuizHistory = async () => {
    try {
      setIsLoading(true);
      const status = selectedStatus === 'ALL' ? undefined : selectedStatus;
      const response = await quizService.getMyQuizzes(currentPage, 12, status); // 12개씩 로드
      
      setQuizzes(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('퀴즈 기록 로드 실패:', error);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '오늘';
    if (diffDays === 2) return '어제';
    if (diffDays <= 7) return `${diffDays - 1}일 전`;
    
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getQuizTypeInfo = (quiz: QuizResult) => {
    if (quiz.quizType === 'DAILY') {
      return {
        label: '날짜별 퀴즈',
        sublabel: quiz.dailyDate,
        icon: 'ri-calendar-check-line',
        color: 'var(--info)',
        emoji: '📅'
      };
    }
    return {
      label: '랜덤 퀴즈',
      sublabel: '전체 단어',
      icon: 'ri-shuffle-line',
      color: 'var(--primary)',
      emoji: '🎲'
    };
  };

  const getStatusConfig = (status: QuizStatus) => {
    if (status === 'PENDING') {
      return {
        label: '진행 중',
        color: 'var(--warning)',
        bg: 'rgba(245, 158, 11, 0.1)',
        icon: 'ri-time-line'
      };
    }
    return {
      label: '완료',
      color: 'var(--success)',
      bg: 'rgba(34, 197, 94, 0.1)',
      icon: 'ri-check-circle-line'
    };
  };

  const getScoreConfig = (score: number) => {
    if (score >= 90) return { 
      color: 'var(--success)', 
      grade: 'A', 
      emoji: '🏆'
    };
    if (score >= 70) return { 
      color: 'var(--info)', 
      grade: 'B', 
      emoji: '👍'
    };
    if (score >= 50) return { 
      color: 'var(--warning)', 
      grade: 'C', 
      emoji: '📚'
    };
    return { 
      color: 'var(--danger)', 
      grade: 'D', 
      emoji: '💪'
    };
  };



  return (
    <div className="flex flex-col h-full">
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
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
              <span className="text-4xl">📝</span>
            </div>
            <h3 
              className="text-xl font-semibold mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              {selectedStatus === 'ALL' ? '퀴즈 기록이 없습니다' : 
                selectedStatus === 'PENDING' ? '진행 중인 퀴즈가 없습니다' : 
                '완료된 퀴즈가 없습니다'}
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
              onClick={onQuizStart}
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
            {quizzes.map((quiz) => {
              const typeInfo = getQuizTypeInfo(quiz);
              const statusConfig = getStatusConfig(quiz.status);
              const scoreConfig = quiz.status === 'SUBMIT' ? getScoreConfig(quiz.score) : null;

              return (
                <div
                  key={quiz.quizUUID}
                  onClick={() => handleQuizClick(quiz)}
                  className="group cursor-pointer transition-all duration-300 hover:scale-105"
                >
                  <div
                    className="h-48 rounded-2xl border-2 p-4 flex flex-col justify-between shadow-lg hover:shadow-xl transition-all duration-300"
                    style={{
                      backgroundColor: 'var(--surface-primary)',
                      borderColor: 'var(--border-secondary)'
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          backgroundColor: `${typeInfo.color}20`,
                          color: typeInfo.color
                        }}
                      >
                        <span className="text-lg">{typeInfo.emoji}</span>
                      </div>
                      
                      <div 
                        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: statusConfig.bg,
                          color: statusConfig.color
                        }}
                      >
                        <i className={`${statusConfig.icon} text-xs`}></i>
                        {statusConfig.label}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="text-center flex-1 flex flex-col justify-center">
                      <h3 
                        className="font-bold text-lg mb-1"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {typeInfo.label}
                      </h3>
                      <p 
                        className="text-sm mb-3"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {typeInfo.sublabel}
                      </p>

                      {quiz.status === 'SUBMIT' && scoreConfig && (
                        <div className="mb-2">
                          <div 
                            className="text-2xl font-bold mb-1"
                            style={{ color: scoreConfig.color }}
                          >
                            {scoreConfig.emoji} {quiz.score}점
                          </div>
                          <div 
                            className="text-xs"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {quiz.correctCount}/{quiz.totalQuestions} 정답
                          </div>
                        </div>
                      )}

                      {quiz.status === 'PENDING' && (
                        <div className="mb-2">
                          <div 
                            className="text-xl font-bold mb-1"
                            style={{ color: 'var(--warning)' }}
                          >
                            ⏸️ 진행 중
                          </div>
                          <div 
                            className="text-xs"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {quiz.totalQuestions}문항 중 일부 완료
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div 
                        className="text-xs"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        {formatDate(quiz.createdAt)}
                      </div>
                      
                      {quiz.status === 'SUBMIT' && (
                        <button
                          onClick={(e) => handleRetakeQuiz(quiz, e)}
                          className="px-3 py-1 rounded-lg text-xs font-medium hover:shadow-lg transition-all"
                          style={{
                            backgroundColor: typeInfo.color + '20',
                            color: typeInfo.color
                          }}
                        >
                          재시험
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
  );
}

