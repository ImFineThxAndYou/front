'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { quizService, QuizResult, QuizWord } from '../../../../lib/services/quizService';
import MainLayout from '../../../components/layout/MainLayout';

export default function QuizResultPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [filterType, setFilterType] = useState<'all' | 'correct' | 'incorrect'>('all');

  useEffect(() => {
    loadQuizResult();
  }, [quizId]);

  const loadQuizResult = async () => {
    try {
      setIsLoading(true);
      const quizData = await quizService.getQuiz(quizId);
      setQuiz(quizData);
    } catch (error) {
      console.error('퀴즈 결과 로드 실패:', error);
      alert('퀴즈 결과를 불러올 수 없습니다.');
      router.push('/quiz/history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetakeQuiz = async () => {
    if (!quiz) return;
    
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

  const toggleQuestionExpanded = (questionNo: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionNo)) {
      newExpanded.delete(questionNo);
    } else {
      newExpanded.add(questionNo);
    }
    setExpandedQuestions(newExpanded);
  };

  const getFilteredWords = () => {
    if (!quiz) return [];
    
    return quiz.words.filter(word => {
      if (filterType === 'correct') return word.isCorrect === true;
      if (filterType === 'incorrect') return word.isCorrect === false;
      return true;
    });
  };

  const getChoiceColor = (word: QuizWord, choiceIndex: number) => {
    const choiceNum = choiceIndex + 1;
    
    if (choiceNum === word.correctAnswer) {
      return {
        backgroundColor: 'var(--success)',
        color: 'white',
        opacity: 0.9
      };
    }
    
    if (choiceNum === word.userAnswer && choiceNum !== word.correctAnswer) {
      return {
        backgroundColor: 'var(--danger)',
        color: 'white',
        opacity: 0.9
      };
    }
    
    return {
      backgroundColor: 'var(--surface-secondary)',
      color: 'var(--text-primary)',
      border: `1px solid var(--border-secondary)`
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'var(--success)';
    if (score >= 70) return 'var(--info)';
    if (score >= 50) return 'var(--warning)';
    return 'var(--danger)';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: 'A', emoji: '🏆', message: '훌륭해요!' };
    if (score >= 70) return { grade: 'B', emoji: '👍', message: '잘했어요!' };
    if (score >= 50) return { grade: 'C', emoji: '📚', message: '조금 더 노력해요!' };
    return { grade: 'D', emoji: '💪', message: '다시 도전해보세요!' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p style={{ color: 'var(--text-secondary)' }}>퀴즈 결과를 불러오는 중...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!quiz) {
    return (
      <MainLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p style={{ color: 'var(--text-secondary)' }} className="mb-4">퀴즈 결과를 찾을 수 없습니다.</p>
            <button
              onClick={() => router.push('/quiz/history')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              퀴즈 기록으로 돌아가기
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const scoreGrade = getScoreGrade(quiz.score);
  const filteredWords = getFilteredWords();

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
            className="backdrop-blur-sm rounded-2xl border shadow-lg p-6 theme-transition"
            style={{
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border-primary)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, var(--info), var(--success))'
                  }}
                >
                  <i className="ri-trophy-line text-xl text-white"></i>
                </div>
                <div>
                  <h1 
                    className="text-2xl font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    퀴즈 결과
                  </h1>
                  <p 
                    className="text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {quiz.quizType === 'DAILY' ? `오늘의 퀴즈 (${quiz.dailyDate})` : '랜덤 퀴즈'} • {formatDate(quiz.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/quiz/history')}
                  className="px-4 py-2 border rounded-xl transition-all font-medium"
                  style={{
                    borderColor: 'var(--border-secondary)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--surface-secondary)'
                  }}
                >
                  기록 목록
                </button>
                <button
                  onClick={handleRetakeQuiz}
                  className="px-4 py-2 rounded-xl transition-all font-medium"
                  style={{
                    backgroundColor: 'var(--info)',
                    color: 'white'
                  }}
                >
                  재시험 보기
                </button>
              </div>
            </div>

            {/* Score Summary */}
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{scoreGrade.emoji}</div>
              <div 
                className="text-5xl font-bold mb-2"
                style={{ color: getScoreColor(quiz.score) }}
              >
                {quiz.score}점
              </div>
              <div 
                className="text-xl font-medium mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                {scoreGrade.message}
              </div>
              
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div 
                    className="text-2xl font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {quiz.totalQuestions}
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    총 문항 수
                  </div>
                </div>
                <div className="text-center">
                  <div 
                    className="text-2xl font-bold"
                    style={{ color: 'var(--success)' }}
                  >
                    {quiz.correctCount}
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    정답 수
                  </div>
                </div>
                <div className="text-center">
                  <div 
                    className="text-2xl font-bold"
                    style={{ color: 'var(--info)' }}
                  >
                    {quiz.accuracy?.toFixed(1)}%
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    정답률
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div 
                  className="flex items-center justify-between text-sm mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span>정답률</span>
                  <span>{quiz.accuracy?.toFixed(1)}%</span>
                </div>
                <div 
                  className="w-full rounded-full h-3"
                  style={{ backgroundColor: 'var(--surface-secondary)' }}
                >
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{ 
                      width: `${quiz.accuracy}%`,
                      backgroundColor: getScoreColor(quiz.score)
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex-shrink-0 p-6 pt-0">
          <div 
            className="backdrop-blur-sm rounded-xl border p-4 theme-transition"
            style={{
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span 
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  문제 필터:
                </span>
                <div className="flex gap-2">
                  {[
                    { value: 'all', label: '전체', count: quiz.words.length },
                    { value: 'correct', label: '정답', count: quiz.words.filter(w => w.isCorrect === true).length },
                    { value: 'incorrect', label: '오답', count: quiz.words.filter(w => w.isCorrect === false).length },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFilterType(option.value as any)}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor: filterType === option.value ? 'var(--info)' : 'var(--surface-secondary)',
                        color: filterType === option.value ? 'white' : 'var(--text-primary)',
                        border: `1px solid ${filterType === option.value ? 'var(--info)' : 'var(--border-secondary)'}`
                      }}
                    >
                      {option.label} ({option.count})
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={() => {
                  if (expandedQuestions.size === filteredWords.length) {
                    setExpandedQuestions(new Set());
                  } else {
                    setExpandedQuestions(new Set(filteredWords.map(w => w.questionNo)));
                  }
                }}
                className="text-sm"
                style={{ color: 'var(--info)' }}
              >
                {expandedQuestions.size === filteredWords.length ? '모두 접기' : '모두 펼치기'}
              </button>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="flex-1 p-6 pt-0">
          <div className="space-y-4">
            {filteredWords.map((word) => (
              <div
                key={word.questionNo}
                className="rounded-xl shadow-lg border-l-4"
                style={{
                  backgroundColor: 'var(--surface-primary)',
                  borderColor: 
                    word.isCorrect === true ? 'var(--success)' :
                    word.isCorrect === false ? 'var(--danger)' : 'var(--border-secondary)'
                }}
              >
                <div
                  onClick={() => toggleQuestionExpanded(word.questionNo)}
                  className="p-6 cursor-pointer hover:bg-opacity-50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{
                          backgroundColor: 
                            word.isCorrect === true ? 'var(--success)' :
                            word.isCorrect === false ? 'var(--danger)' : 'var(--surface-secondary)',
                          color: word.isCorrect !== null ? 'white' : 'var(--text-primary)'
                        }}
                      >
                        {word.questionNo}
                      </div>
                      <div>
                        <h3 
                          className="text-lg font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {word.word}
                        </h3>
                        <div 
                          className="flex items-center gap-4 text-sm"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          <span>품사: {word.pos || '미분류'}</span>
                          <span>레벨: {word.level || '미분류'}</span>
                          {word.isCorrect === true && <span style={{ color: 'var(--success)' }}>✅ 정답</span>}
                          {word.isCorrect === false && <span style={{ color: 'var(--danger)' }}>❌ 오답</span>}
                          {word.isCorrect === null && <span style={{ color: 'var(--text-secondary)' }}>⚪ 미응답</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {word.isCorrect === true && <span className="text-2xl">✅</span>}
                      {word.isCorrect === false && <span className="text-2xl">❌</span>}
                      {word.isCorrect === null && <span className="text-2xl">⚪</span>}
                      <i 
                        className={`ri-arrow-down-line transition-transform ${
                          expandedQuestions.has(word.questionNo) ? 'rotate-180' : ''
                        }`}
                        style={{ color: 'var(--text-secondary)' }}
                      ></i>
                    </div>
                  </div>
                </div>

                {expandedQuestions.has(word.questionNo) && (
                  <div 
                    className="px-6 pb-6 border-t"
                    style={{ borderColor: 'var(--border-secondary)' }}
                  >
                    <div className="mt-4">
                      <h4 
                        className="font-medium mb-3"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        선택지
                      </h4>
                      <div className="space-y-2">
                        {[word.choice1, word.choice2, word.choice3, word.choice4].map((choice, index) => (
                          <div
                            key={index}
                            className="p-3 rounded-lg border-2"
                            style={getChoiceColor(word, index)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                {index + 1}. {choice}
                              </span>
                              <div className="flex items-center gap-2">
                                {index + 1 === word.correctAnswer && (
                                  <span className="text-white font-medium">정답</span>
                                )}
                                {index + 1 === word.userAnswer && index + 1 !== word.correctAnswer && (
                                  <span className="text-white font-medium">선택한 답</span>
                                )}
                                {index + 1 === word.userAnswer && index + 1 === word.correctAnswer && (
                                  <span className="text-white font-medium">선택한 답 (정답)</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {word.userAnswer === null && (
                        <div 
                          className="mt-3 p-3 rounded-lg"
                          style={{
                            backgroundColor: 'var(--surface-secondary)',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          <span>미응답</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredWords.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 
                className="text-xl font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                해당하는 문제가 없습니다
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                다른 필터를 선택해보세요.
              </p>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="text-center mt-12 pb-8">
            <div className="flex justify-center gap-4">
              <button
                onClick={() => router.push('/quiz')}
                className="px-8 py-3 rounded-xl font-medium"
                style={{
                  backgroundColor: 'var(--success)',
                  color: 'white'
                }}
              >
                새 퀴즈 시작
              </button>
              <button
                onClick={handleRetakeQuiz}
                className="px-8 py-3 rounded-xl font-medium"
                style={{
                  backgroundColor: 'var(--info)',
                  color: 'white'
                }}
              >
                같은 유형 재시험
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}