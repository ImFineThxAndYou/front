'use client';

import { QuizResult } from '../../../lib/services/quizService';
import { useTranslation } from '../../../lib/hooks/useTranslation';

interface QuizCardProps {
  quiz: QuizResult;
  onQuizClick: (quiz: QuizResult) => void;
  onRetakeQuiz: (quiz: QuizResult, e: React.MouseEvent) => void;
}

export default function QuizCard({ quiz, onQuizClick, onRetakeQuiz }: QuizCardProps) {
  const { t } = useTranslation(['quiz', 'common']);

  const getStatusConfig = (status: string) => {
    if (status === 'PENDING') {
      return {
        label: t('quiz.status.pending'),
        color: 'var(--warning)',
        bg: 'rgba(245, 158, 11, 0.1)',
        icon: 'ri-time-line'
      };
    }
    return {
      label: t('quiz.status.submit'),
      color: 'var(--success)',
      bg: 'rgba(34, 197, 94, 0.1)',
      icon: 'ri-check-circle-line'
    };
  };

  const getScoreConfig = (score: number) => {
    if (score >= 90) return { 
      color: 'var(--success)', 
      grade: 'A', 
      emoji: '🏆',
      bg: 'rgba(34, 197, 94, 0.1)'
    };
    if (score >= 70) return { 
      color: 'var(--info)', 
      grade: 'B', 
      emoji: '👍',
      bg: 'rgba(59, 130, 246, 0.1)'
    };
    if (score >= 50) return { 
      color: 'var(--warning)', 
      grade: 'C', 
      emoji: '📚',
      bg: 'rgba(245, 158, 11, 0.1)'
    };
    return { 
      color: 'var(--danger)', 
      grade: 'D', 
      emoji: '💪',
      bg: 'rgba(239, 68, 68, 0.1)'
    };
  };

  const getQuizTypeLabel = (quiz: QuizResult) => {
    if (quiz.quizType === 'DAILY') {
      return {
        label: t('quiz.types.daily'),
        emoji: '📅',
        description: quiz.dailyDate ? `${quiz.dailyDate} ${t('quiz.dailyWords')}` : t('quiz.todayWords')
      };
    }
    return {
      label: t('quiz.types.random'),
      emoji: '🎲',
      description: t('quiz.allWords')
    };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return t('common.today');
    if (diffDays === 2) return t('common.yesterday');
    if (diffDays <= 7) return t('common.daysAgo', { days: diffDays - 1 });
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  const statusConfig = getStatusConfig(quiz.status);
  const typeInfo = getQuizTypeLabel(quiz);

  return (
    <div 
      className="group cursor-pointer transition-all duration-300 hover:scale-105"
      onClick={() => onQuizClick(quiz)}
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
            style={{ backgroundColor: 'var(--primary)20', color: 'var(--primary)' }}
          >
            <span className="text-lg">{typeInfo.emoji}</span>
          </div>
          <div 
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
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
            {typeInfo.description}
          </p>
          
          {quiz.status === 'PENDING' ? (
            <div className="mb-2">
              <div 
                className="text-xl font-bold mb-1"
                style={{ color: 'var(--warning)' }}
              >
                ⏸️ {t('quiz.status.inProgress')}
              </div>
              <div 
                className="text-xs"
                style={{ color: 'var(--text-secondary)' }}
              >
                {quiz.totalQuestions} {t('quiz.questions')} 중 일부 완료
              </div>
            </div>
          ) : (
            <div className="mb-2">
              <div 
                className="text-2xl font-bold mb-1"
                style={{ color: 'var(--danger)' }}
              >
                💪 {quiz.score} {t('quiz.points')}
              </div>
              <div 
                className="text-xs"
                style={{ color: 'var(--text-secondary)' }}
              >
                {quiz.correctCount}/{quiz.totalQuestions} {t('quiz.correctAnswers')}
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
              onClick={(e) => onRetakeQuiz(quiz, e)}
              className="px-3 py-1 rounded-lg text-xs font-medium hover:shadow-lg transition-all"
              style={{
                backgroundColor: 'var(--primary)20',
                color: 'var(--primary)'
              }}
            >
              {t('quiz.retakeQuiz')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
