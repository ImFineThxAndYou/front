'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { quizService, QuizLevel } from '../../../lib/services/quizService';
import { useTranslation } from '../../../lib/hooks/useTranslation';

interface QuizModalProps {
  onClose: () => void;
}

export default function QuizModal({ onClose }: QuizModalProps) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<'random' | 'level' | 'today'>('random');
  const [selectedLevel, setSelectedLevel] = useState<QuizLevel>('A');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const quizTypes = [
    {
      id: 'random',
      title: t('quiz.types.random'),
      description: t('quiz.types.randomDesc'),
      icon: 'ri-shuffle-line',
      color: 'var(--accent-primary)',
      gradient: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
    },
    {
      id: 'level',
      title: t('quiz.types.level'),
      description: t('quiz.types.levelDesc'),
      icon: 'ri-bar-chart-line',
      color: 'var(--success)',
      gradient: 'linear-gradient(135deg, var(--success), var(--accent-success))'
    },
    {
      id: 'daily',
      title: t('quiz.types.daily'),
      description: t('quiz.types.dailyDesc'),
      icon: 'ri-calendar-line',
      color: 'var(--info)',
      gradient: 'linear-gradient(135deg, var(--info), var(--accent-info))'
    }
  ];

  const levels = [
    { value: 'A', label: t('quiz.levels.a'), description: t('quiz.levels.aDesc'), color: 'var(--success)' },
    { value: 'B', label: t('quiz.levels.b'), description: t('quiz.levels.bDesc'), color: 'var(--warning)' },
    { value: 'C', label: t('quiz.levels.c'), description: t('quiz.levels.cDesc'), color: 'var(--error)' }
  ];

  const handleStartQuiz = async () => {
    setIsLoading(true);
    try {
      let quiz;
      
      switch (selectedType) {
        case 'random':
          quiz = await quizService.startRandomQuiz();
          break;
        case 'level':
          quiz = await quizService.startRandomQuiz(selectedLevel);
          break;
        case 'today':
          quiz = await quizService.startDailyQuiz(selectedDate);
          break;
      }
      
      onClose();
      router.push(`/quiz/${quiz.quizUUID}`);
    } catch (error) {
      console.error('퀴즈 시작 실패:', error);
      alert(t('quiz.errors.startFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl"
        style={{
          backgroundColor: 'var(--surface-primary)',
          borderColor: 'var(--border-secondary)'
        }}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--border-secondary)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 
                className="text-2xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                🎯 {t('quiz.start.title')}
              </h2>
              <p 
                className="mt-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t('quiz.start.subtitle')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <i className="ri-close-line text-2xl" style={{ color: 'var(--text-secondary)' }}></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Quiz Type Selection */}
          <div className="mb-8">
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              퀴즈 유형 선택
            </h3>
            
            <div className="grid gap-4">
              {quizTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id as any)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                    selectedType === type.id 
                      ? 'border-opacity-100 shadow-lg scale-105' 
                      : 'border-opacity-20 hover:border-opacity-40'
                  }`}
                  style={{
                    backgroundColor: selectedType === type.id 
                      ? `${type.color}10` 
                      : 'var(--surface-secondary)',
                    borderColor: type.color
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                      style={{ background: type.gradient }}
                    >
                      <i className={`${type.icon} text-xl`}></i>
                    </div>
                    
                    <div className="flex-1">
                      <h4 
                        className="font-semibold text-base mb-1"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {type.title}
                      </h4>
                      <p 
                        className="text-sm"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {type.description}
                      </p>
                    </div>
                    
                    <div 
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedType === type.id ? '' : 'border-opacity-30'
                      }`}
                      style={{ borderColor: type.color }}
                    >
                      {selectedType === type.id && (
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: type.color }}
                        />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Level Selection */}
          {selectedType === 'level' && (
            <div className="mb-8">
              <h3 
                className="text-lg font-semibold mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                난이도 선택
              </h3>
              
              <div className="grid grid-cols-3 gap-3">
                {levels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setSelectedLevel(level.value as QuizLevel)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 text-center ${
                      selectedLevel === level.value 
                        ? 'shadow-lg scale-105' 
                        : 'hover:shadow-md'
                    }`}
                    style={{
                      backgroundColor: selectedLevel === level.value 
                        ? `${level.color}10` 
                        : 'var(--surface-secondary)',
                      borderColor: selectedLevel === level.value 
                        ? level.color 
                        : 'var(--border-secondary)'
                    }}
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 text-white font-bold"
                      style={{ backgroundColor: level.color }}
                    >
                      {level.value}
                    </div>
                    <div 
                      className="font-semibold text-sm mb-1"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {level.label}
                    </div>
                    <div 
                      className="text-xs"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {level.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date Selection */}
          {selectedType === 'today' && (
            <div className="mb-8">
              <h3 
                className="text-lg font-semibold mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                날짜 선택
              </h3>
              
              <div 
                className="p-4 rounded-2xl border"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border-secondary)'
                }}
              >
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  학습 날짜
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: 'var(--surface-primary)',
                    borderColor: 'var(--border-secondary)',
                    color: 'var(--text-primary)'
                  }}
                />
                <p 
                  className="text-xs mt-2"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  선택한 날짜에 학습한 단어들로 퀴즈를 만듭니다
                </p>
              </div>
            </div>
          )}

          {/* Quiz Info */}
          <div 
            className="p-4 rounded-2xl border-l-4 mb-6"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--info)'
            }}
          >
            <div className="flex items-start gap-3">
              <i 
                className="ri-information-line text-lg mt-0.5"
                style={{ color: 'var(--info)' }}
              ></i>
              <div>
                <h4 
                  className="font-semibold text-sm mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  퀴즈 안내
                </h4>
                <ul 
                  className="text-xs space-y-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <li>• 각 퀴즈는 5-30문항으로 자동 생성됩니다</li>
                  <li>• 4지선다 객관식으로 진행됩니다</li>
                  <li>• 중간에 나가도 나중에 이어서 풀 수 있습니다</li>
                  <li>• 완료 후 상세한 결과 분석을 확인할 수 있습니다</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="sticky bottom-0 p-6 border-t"
          style={{ borderColor: 'var(--border-secondary)' }}
        >
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-6 rounded-2xl font-medium border-2 transition-all hover:shadow-md"
              style={{
                borderColor: 'var(--border-secondary)',
                backgroundColor: 'var(--surface-secondary)',
                color: 'var(--text-primary)'
              }}
            >
              취소
            </button>
            
            <button
              onClick={handleStartQuiz}
              disabled={isLoading}
              className="flex-1 py-3 px-6 rounded-2xl font-semibold text-white transition-all hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                background: selectedType === 'random' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : selectedType === 'level'
                  ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                  : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
              }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  퀴즈 생성 중...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <i className="ri-play-line"></i>
                  퀴즈 시작하기
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

