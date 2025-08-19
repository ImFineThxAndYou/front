'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '../../../lib/stores/ui';
import { translations } from '../../../lib/i18n/translations';
import { dashboardService, DashboardSummary, LearningGrass } from '../../../lib/services/dashboardService';

export default function LearningDashboard() {
  const { language } = useUIStore();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // API 데이터 상태
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [learningGrass, setLearningGrass] = useState<LearningGrass>({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // 번역 함수
  const t = (key: string) => {
    const currentLang = language || 'ko';
    const translationSource = translations[currentLang as keyof typeof translations];
    
    // me 네임스페이스에서 번역 찾기
    const meTranslations = translationSource.me as any;
    if (meTranslations) {
      const keys = key.split('.');
      let value: any = meTranslations;
      
      for (const k of keys) {
        value = value?.[k];
      }
      
      if (value) {
        return value;
      }
    }
    
    // common 네임스페이스에서 번역 찾기
    const commonTranslations = translationSource.common as any;
    if (commonTranslations) {
      const keys = key.split('.');
      let value: any = commonTranslations;
      
      for (const k of keys) {
        value = value?.[k];
      }
      
      if (value) {
        return value;
      }
    }
    
    return key;
  };

  // 데이터 로딩
  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  useEffect(() => {
    loadLearningGrass();
  }, [selectedYear, selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getDashboardSummary('Asia/Seoul', selectedPeriod);
      setDashboardData(data);
    } catch (err) {
      console.error('대시보드 데이터 로딩 실패:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadLearningGrass = async () => {
    try {
      const data = await dashboardService.getLearningGrass(selectedYear, 'Asia/Seoul', selectedPeriod);
      setLearningGrass(data);
    } catch (err) {
      console.error('학습 잔디 데이터 로딩 실패:', err);
    }
  };

  // GitHub 스타일 잔디 생성
  const generateGitHubStyleGrass = () => {
    const weeks = [];
    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const count = learningGrass[dateStr] || 0;
      
      // GitHub 스타일 색상 (값이 없어도 회색으로 표시)
      let color = '#ebedf0'; // 기본 회색
      if (count > 0) {
        if (count <= 3) color = '#9be9a8'; // 연한 초록
        else if (count <= 6) color = '#40c463'; // 초록
        else if (count <= 9) color = '#30a14e'; // 진한 초록
        else color = '#216e39'; // 매우 진한 초록
      }
      
      weeks.push({
        date: dateStr,
        count,
        color
      });
    }
    
    return weeks;
  };

  // 학습 성과 그래프 데이터 준비
  const prepareScoreChartData = () => {
    if (!dashboardData?.scoreSeries) return [];
    
    const now = new Date();
    let days = 7; // 주간 기본값
    
    if (selectedPeriod === 'month') {
      days = 30;
    }
    
    // 최근 N일 데이터만 사용
    return dashboardData.scoreSeries.slice(0, days).reverse();
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>
            {t('common.loading')}
          </p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
            {t('common.error')}
          </p>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
            {error}
          </p>
          <button
            onClick={loadDashboardData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  // 데이터가 없는 경우
  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
            {t('dashboard.noData.title')}
          </p>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
            {t('dashboard.noData.description')}
          </p>
        </div>
      </div>
    );
  }

  const grassData = generateGitHubStyleGrass();
  const scoreData = prepareScoreChartData();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {t('dashboard.title')}
        </h1>
        
        {/* 기간 선택 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedPeriod('week')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === 'week'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t('dashboard.period.week')}
          </button>
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === 'month'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t('dashboard.period.month')}
          </button>
        </div>
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 총 단어 개수 */}
        <div className="bg-white p-4 rounded-xl shadow-sm border" style={{ borderColor: 'var(--border-secondary)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {t('dashboard.totalWords')}
              </p>
              <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {dashboardData.totalWords.toLocaleString()}
              </p>
            </div>
            <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--accent-primary-alpha)' }}>
              <i className="ri-book-open-line text-lg" style={{ color: 'var(--accent-primary)' }}></i>
            </div>
          </div>
        </div>

        {/* 연속 학습일 */}
        <div className="bg-white p-4 rounded-xl shadow-sm border" style={{ borderColor: 'var(--border-secondary)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {t('dashboard.learningStreak')}
              </p>
              <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {dashboardData.learningStreakDays}일
              </p>
            </div>
            <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--accent-primary-alpha)' }}>
              <i className="ri-fire-line text-lg" style={{ color: 'var(--accent-primary)' }}></i>
            </div>
          </div>
        </div>

        {/* 복습 필요 날짜 */}
        <div className="bg-white p-4 rounded-xl shadow-sm border" style={{ borderColor: 'var(--border-secondary)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {t('dashboard.reviewNeeded')}
              </p>
              <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {dashboardData.reviewNeededDays}일
              </p>
            </div>
            <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--accent-primary-alpha)' }}>
              <i className="ri-refresh-line text-lg" style={{ color: 'var(--accent-primary)' }}></i>
            </div>
          </div>
        </div>

        {/* 격려 메시지 */}
        <div className="bg-white p-4 rounded-xl shadow-sm border" style={{ borderColor: 'var(--border-secondary)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {t('dashboard.encouragement')}
              </p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {dashboardData.encouragementMessage}
              </p>
            </div>
            <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--accent-primary-alpha)' }}>
              <i className="ri-heart-line text-lg" style={{ color: 'var(--accent-primary)' }}></i>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 틀린 단어 목록 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border h-full" style={{ borderColor: 'var(--border-secondary)' }}>
            <div className="p-4 border-b" style={{ borderColor: 'var(--border-secondary)' }}>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('dashboard.wrongAnswers.title')}
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {t('dashboard.wrongAnswers.description')}
              </p>
            </div>
            
            <div className="p-4">
              {dashboardData.wrongAnswerNotes && dashboardData.wrongAnswerNotes.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {dashboardData.wrongAnswerNotes.slice(0, 8).map((wrongAnswer, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border"
                      style={{ 
                        backgroundColor: 'var(--surface-secondary)',
                        borderColor: 'var(--border-secondary)'
                      }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                            <i className="ri-close-line text-red-500 text-xs"></i>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                              {wrongAnswer.word}
                            </p>
                            <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                              {wrongAnswer.meaning}
                            </p>
                            <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 mt-1">
                              {wrongAnswer.pos}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        className="p-1 rounded-lg hover:bg-gray-100 transition-colors ml-2"
                        style={{ color: 'var(--text-secondary)' }}
                        title={t('dashboard.wrongAnswers.review')}
                      >
                        <i className="ri-refresh-line text-sm"></i>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-green-500 text-3xl mb-3">🎉</div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {t('dashboard.wrongAnswers.noData.title')}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {t('dashboard.wrongAnswers.noData.description')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽: 학습 잔디와 학습 성과 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 학습 잔디 */}
          <div className="bg-white rounded-xl shadow-sm border" style={{ borderColor: 'var(--border-secondary)' }}>
            <div className="p-4 border-b" style={{ borderColor: 'var(--border-secondary)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {t('dashboard.learningGrass.title')}
                  </h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {t('dashboard.learningGrass.description')}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedYear(prev => prev - 1)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <i className="ri-arrow-left-s-line"></i>
                  </button>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {selectedYear}
                  </span>
                  <button
                    onClick={() => setSelectedYear(prev => prev + 1)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <i className="ri-arrow-right-s-line"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-53 gap-1">
                {grassData.map((day, index) => (
                  <div
                    key={index}
                    className="w-2 h-2 rounded-sm"
                    style={{
                      backgroundColor: day.color,
                      border: '1px solid var(--border-secondary)'
                    }}
                    title={`${day.date}: ${day.count}개 단어`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-center space-x-4 mt-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span>Less</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#ebedf0' }}></div>
                  <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#9be9a8' }}></div>
                  <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#40c463' }}></div>
                  <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#30a14e' }}></div>
                  <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#216e39' }}></div>
                </div>
                <span>More</span>
              </div>
            </div>
          </div>

          {/* 학습 성과 */}
          <div className="bg-white rounded-xl shadow-sm border" style={{ borderColor: 'var(--border-secondary)' }}>
            <div className="p-4 border-b" style={{ borderColor: 'var(--border-secondary)' }}>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('dashboard.scoreChart.title')}
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {t('dashboard.scoreChart.description')} ({selectedPeriod === 'week' ? '최근 7일' : '최근 30일'})
              </p>
            </div>
            
            <div className="p-4">
              {scoreData.length > 0 ? (
                <div className="h-48 flex items-end space-x-1">
                  {scoreData.map((score, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full rounded-t min-h-[4px]"
                        style={{
                          height: `${Math.max(score.score, 4)}%`,
                          backgroundColor: 'var(--accent-primary)'
                        }}
                        title={`${score.submittedAtUtc}: ${score.score}점`}
                      />
                      <span className="text-xs mt-1 text-center" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(score.submittedAtUtc).toLocaleDateString('ko-KR', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-3xl mb-3">📊</div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {t('dashboard.scoreChart.noData')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
