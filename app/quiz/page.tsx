'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { quizService, QuizLevel } from '../../lib/services/quizService';
import { useTranslation } from '../../lib/hooks/useTranslation';
import MainLayout from '../components/layout/MainLayout';

export default function QuizPage() {
  const { t } = useTranslation(['quiz', 'common']);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<QuizLevel | 'ALL'>('ALL');

  const levels: { value: QuizLevel | 'ALL'; label: string; description: string; color: string }[] = [
    { value: 'ALL', label: t('quiz.mixed'), description: t('quiz.mixedDesc'), color: 'var(--primary)' },
    { value: 'A', label: 'A ' + t('common.difficulty.beginner'), description: t('common.difficulty.beginner'), color: 'var(--success)' },
    { value: 'B', label: 'B ' + t('common.difficulty.intermediate'), description: t('common.difficulty.intermediate'), color: 'var(--warning)' },
    { value: 'C', label: 'C ' + t('common.difficulty.advanced'), description: t('common.difficulty.advanced'), color: 'var(--danger)' },
  ];

  const handleStartQuiz = async (type: 'random' | 'today') => {
    setIsLoading(true);
    try {
      let quiz;
      if (type === 'random') {
        const level = selectedLevel === 'ALL' ? undefined : selectedLevel;
        quiz = await quizService.startRandomQuiz(level);
      } else {
        const today = new Date().toISOString().split('T')[0];
        quiz = await quizService.startDailyQuiz(today);
      }
      router.push(`/quiz/${quiz.quizUUID}`);
    } catch (error) {
      console.error('퀴즈 시작 실패:', error);
      alert(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

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
                  <i className="ri-question-line text-xl text-white"></i>
                </div>
                <div>
                  <h1 
                    className="text-2xl font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    단어 퀴즈
                  </h1>
                  <p 
                    className="text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    학습한 단어들로 퀴즈를 풀어보세요
                  </p>
                </div>
              </div>


            </div>

            {/* Level Selection */}
            <div className="mb-6">
              <label 
                className="block text-sm font-medium mb-3"
                style={{ color: 'var(--text-primary)' }}
              >
                난이도 선택
              </label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {levels.map((level) => (
                  <label
                    key={level.value}
                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                      selectedLevel === level.value ? 'shadow-lg scale-105' : ''
                    }`}
                    style={{
                      backgroundColor: selectedLevel === level.value ? 'var(--surface-secondary)' : 'var(--surface-primary)',
                      borderColor: selectedLevel === level.value ? level.color : 'var(--border-secondary)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <input
                      type="radio"
                      name="level"
                      value={level.value}
                      checked={selectedLevel === level.value}
                      onChange={(e) => setSelectedLevel(e.target.value as QuizLevel | 'ALL')}
                      className="sr-only"
                    />
                    <div className="flex-1 text-center">
                      <div className="font-bold text-lg mb-1">{level.label}</div>
                      <div 
                        className="text-xs"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {level.description}
                      </div>
                    </div>
                    {selectedLevel === level.value && (
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center ml-3"
                        style={{ backgroundColor: level.color }}
                      >
                        <i className="ri-check-line text-white text-sm"></i>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Quiz Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <button
                onClick={() => handleStartQuiz('random')}
                disabled={isLoading}
                className="flex items-center justify-center gap-3 p-6 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--info))',
                  color: 'white',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <i className="ri-shuffle-line text-xl"></i>
                <div className="text-left">
                  <div className="font-bold text-lg">
                    {selectedLevel === 'ALL' ? '전체 랜덤 퀴즈' : `${selectedLevel} 레벨 퀴즈`}
                  </div>
                  <div className="text-sm opacity-90">
                    {isLoading ? '퀴즈 생성 중...' : '선택한 난이도로 퀴즈 시작'}
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleStartQuiz('today')}
                disabled={isLoading}
                className="flex items-center justify-center gap-3 p-6 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                style={{
                  background: 'linear-gradient(135deg, var(--success), var(--warning))',
                  color: 'white',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <i className="ri-calendar-todo-line text-xl"></i>
                <div className="text-left">
                  <div className="font-bold text-lg">오늘의 퀴즈</div>
                  <div className="text-sm opacity-90">
                    {isLoading ? '퀴즈 생성 중...' : '오늘 학습한 단어로 퀴즈'}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-shrink-0 p-6 pt-0">
          <div 
            className="rounded-xl p-4 border-l-4"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--info)',
              color: 'var(--text-primary)'
            }}
          >
            <div className="flex items-start gap-3">
              <i className="ri-lightbulb-line text-xl" style={{ color: 'var(--info)' }}></i>
              <div>
                <h3 className="font-bold mb-2 text-sm">💡 퀴즈 안내</h3>
                <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                  <li>• 각 퀴즈는 5-30문항으로 자동 생성됩니다</li>
                  <li>• 중간에 나가더라도 나중에 이어서 풀 수 있습니다</li>
                  <li>• 퀴즈 기록과 통계는 워드북에서 확인하세요</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}