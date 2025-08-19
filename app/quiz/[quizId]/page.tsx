'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { quizService, QuizQuestion, QuizResult } from '../../../lib/services/quizService';
import MainLayout from '../../components/layout/MainLayout';
import { useTranslation } from '../../../lib/hooks/useTranslation';



export default function QuizExecutePage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<QuizResult | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { t } = useTranslation(['quiz', 'common']);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      setIsLoading(true);
      const quizData = await quizService.getQuiz(quizId);
      
      setQuiz(quizData);
      
      if (quizData.status === 'SUBMIT') {
        router.push(`/quiz/result/${quizId}`);
        return;
      }

      const quizQuestions: QuizQuestion[] = quizData.words.map(word => ({
        question: word.word,
        choices: [word.choice1, word.choice2, word.choice3, word.choice4],
        questionNo: word.questionNo
      }));

      setQuestions(quizQuestions);
      
      const existingAnswers = quizData.words.map(word => {
        if (word.userAnswer !== null && word.userAnswer !== undefined) {
          return word.userAnswer - 1;
        }
        return -1;
      });
      setUserAnswers(existingAnswers);

      const lastAnsweredIndex = existingAnswers.findLastIndex(answer => answer !== -1);
      if (lastAnsweredIndex !== -1 && lastAnsweredIndex < existingAnswers.length - 1) {
        setCurrentQuestionIndex(lastAnsweredIndex + 1);
      }

    } catch (error) {
      console.error('퀴즈 로드 실패:', error);
      alert(t('quiz.errors.loadFailed'));
      router.push('/quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    
    // 답 선택 시 즉시 응답 기록
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...userAnswers];
      newAnswers[currentQuestionIndex] = selectedAnswer;
      setUserAnswers(newAnswers);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex + 1] ?? null);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex - 1] ?? null);
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      setIsSubmitting(true);
      
      const finalAnswers = [...userAnswers];
      if (selectedAnswer !== null) {
        finalAnswers[currentQuestionIndex] = selectedAnswer;
      }

      const submitAnswers = finalAnswers.map(answer => answer === -1 ? -1 : answer + 1);

      await quizService.submitQuiz(quizId, submitAnswers);
      router.push(`/quiz/result/${quizId}`);
    } catch (error) {
      console.error('퀴즈 제출 실패:', error);
      alert(t('quiz.errors.submitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgress = () => {
    const answered = userAnswers.filter(answer => answer !== -1).length;
    return (answered / questions.length) * 100;
  };

  const getQuestionStatus = (index: number) => {
    if (index === currentQuestionIndex) return 'current';
    if (userAnswers[index] !== -1) return 'answered';
    return 'unanswered';
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin mb-4 mx-auto"
              style={{ borderColor: 'var(--primary)' }}
            />
            <p style={{ color: 'var(--text-secondary)' }}>{t('quiz.loading')}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <MainLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center max-w-md">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: 'var(--surface-secondary)' }}
            >
              <i 
                className="ri-question-line text-3xl"
                style={{ color: 'var(--text-tertiary)' }}
              ></i>
            </div>
            <h3 
              className="text-xl font-semibold mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              {t('quiz.errors.notFound')}
            </h3>
            <p 
              className="text-sm mb-6"
              style={{ color: 'var(--text-secondary)' }}
            >
              {t('quiz.errors.notFoundDesc')}
            </p>
            <button
              onClick={() => router.push('/wordbook')}
              className="px-6 py-3 rounded-2xl font-medium text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))'
              }}
            >
              {t('quiz.actions.backToWordbook')}
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <MainLayout>
      <div 
        className="h-full flex flex-col overflow-hidden theme-transition"
        style={{
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)'
        }}
      >
        {/* Compact Header */}
        <div className="flex-shrink-0 p-4">
          <div 
            className="backdrop-blur-xl rounded-2xl border shadow-lg p-4 theme-transition"
            style={{
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border-primary)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Top Bar - Compact */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/wordbook')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:shadow-md transition-all"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <i className="ri-arrow-left-line"></i>
                  {t('wordbook.title')}
                </button>
                
                <div>
                  <h1 
                    className="text-lg font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {quiz.quizType === 'DAILY' ? t('quiz.types.daily') : t('quiz.types.random')}
                  </h1>
                  <p 
                    className="text-xs"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {t('quiz.questionNumber', { current: currentQuestionIndex + 1, total: questions.length })}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div 
                  className="text-xl font-bold"
                  style={{ color: 'var(--success)' }}
                >
                  {Math.round(getProgress())}%
                </div>
                <div 
                  className="text-xs"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t('quiz.progress')}
                </div>
              </div>
            </div>

            {/* Progress Bar - Compact */}
            <div className="mb-3">
              <div 
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--surface-secondary)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${getProgress()}%`,
                    background: 'linear-gradient(135deg, var(--success), var(--info))'
                  }}
                />
              </div>
            </div>

            {/* Question Navigation - Compact */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {questions.map((_, index) => {
                const status = getQuestionStatus(index);
                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (selectedAnswer !== null) {
                        const newAnswers = [...userAnswers];
                        newAnswers[currentQuestionIndex] = selectedAnswer;
                        setUserAnswers(newAnswers);
                      }
                      setCurrentQuestionIndex(index);
                      setSelectedAnswer(userAnswers[index] ?? null);
                    }}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all duration-200 flex-shrink-0 ${
                      status === 'current' ? 'shadow-md scale-105' : 'hover:scale-105'
                    }`}
                    style={{
                      backgroundColor: 
                        status === 'current' ? 'var(--primary)' :
                        status === 'answered' ? 'var(--success)' : 'var(--surface-secondary)',
                      color: 
                        status === 'current' || status === 'answered' ? 'white' : 'var(--text-secondary)',
                      border: status === 'current' ? `2px solid var(--primary)` : 'none'
                    }}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Question Content - Compact */}
        <div className="flex-1 p-4 pt-0 min-h-0 overflow-y-auto">
          <div 
            className="backdrop-blur-xl rounded-2xl border shadow-lg p-6 theme-transition min-h-full"
            style={{
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border-primary)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Question - Compact */}
            <div className="text-center mb-6">
              <div 
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-3"
                style={{
                  backgroundColor: 'var(--info)',
                  color: 'white'
                }}
              >
                <i className="ri-question-line"></i>
                {t('quiz.questionLabel')} {currentQuestion.questionNo}
              </div>
              
              <h2 
                className="text-3xl font-bold mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                {currentQuestion.question}
              </h2>
              
              <p 
                className="text-base"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t('quiz.chooseCorrectMeaning')}
              </p>
            </div>

            {/* Choices - Compact */}
            <div className="space-y-3 mb-6">
              {currentQuestion.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 hover:shadow-lg ${
                    selectedAnswer === index 
                      ? 'shadow-xl scale-105 border-opacity-100' 
                      : 'border-opacity-20 hover:border-opacity-40'
                  }`}
                  style={{
                    backgroundColor: selectedAnswer === index 
                      ? `var(--primary)15` 
                      : 'var(--surface-secondary)',
                    borderColor: selectedAnswer === index 
                      ? 'var(--primary)' 
                      : 'var(--border-secondary)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base ${
                        selectedAnswer === index ? 'text-white' : ''
                      }`}
                      style={{
                        backgroundColor: selectedAnswer === index 
                          ? 'var(--primary)' 
                          : 'var(--surface-primary)',
                        color: selectedAnswer === index 
                          ? 'white' 
                          : 'var(--text-secondary)'
                      }}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    
                    <div 
                      className="text-base font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {choice}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation - Compact */}
            <div className="flex justify-between items-center">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border-secondary)',
                  color: 'var(--text-primary)'
                }}
              >
                <i className="ri-arrow-left-line"></i>
                {t('quiz.actions.previous')}
              </button>

              <div className="flex gap-2">
                {!isLastQuestion ? (
                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, var(--primary), var(--secondary))'
                    }}
                  >
                    {t('quiz.actions.next')}
                    <i className="ri-arrow-right-line"></i>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, var(--success), var(--info))'
                    }}
                  >
                    <i className="ri-check-line"></i>
                    {t('quiz.actions.submit')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Confirm Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
              onClick={() => setShowConfirmModal(false)}
            />
            
            <div 
              className="relative w-full max-w-md rounded-3xl shadow-2xl border p-6"
              style={{
                backgroundColor: 'var(--surface-primary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: 'var(--warning)' }}
                >
                  <i className="ri-question-line text-2xl text-white"></i>
                </div>
                
                <h3 
                  className="text-xl font-bold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('quiz.confirm.title')}
                </h3>
                
                <p 
                  className="text-sm mb-6"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t('quiz.confirm.description')}
                  <br />
                  {t('quiz.confirm.unanswered', { count: userAnswers.filter(a => a === -1).length })}
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-3 px-6 rounded-2xl font-medium border-2 transition-all"
                    style={{
                      borderColor: 'var(--border-secondary)',
                      backgroundColor: 'var(--surface-secondary)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {t('common.cancel')}
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      handleSubmitQuiz();
                    }}
                    disabled={isSubmitting}
                    className="flex-1 py-3 px-6 rounded-2xl font-semibold text-white transition-all disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, var(--success), var(--info))'
                    }}
                  >
                    {isSubmitting ? t('quiz.submitting') : t('quiz.confirm.submit')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}