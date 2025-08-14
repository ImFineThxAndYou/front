'use client';

import { useState } from 'react';
import { useTranslation } from '../../../lib/hooks/useTranslation';

export default function LearningDashboard() {
  const { t } = useTranslation(['me', 'common']);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Mock data - 실제로는 API에서 가져올 데이터
  const stats = {
    totalWords: 1247,
    mastered: 894,
    reviewNeeded: 353,
    studyStreak: 7,
    weeklyGoal: 87,
    reviewCompletion: 73
  };

  const weeklyData = [
    { day: 'Mon', words: 15, chats: 3 },
    { day: 'Tue', words: 22, chats: 5 },
    { day: 'Wed', words: 8, chats: 2 },
    { day: 'Thu', words: 31, chats: 7 },
    { day: 'Fri', words: 18, chats: 4 },
    { day: 'Sat', words: 25, chats: 6 },
    { day: 'Sun', words: 12, chats: 3 }
  ];

  const recentActivities = [
    { type: 'word', content: 'serendipity', time: '2분 전', icon: 'ri-book-line' },
    { type: 'chat', content: 'Sarah Kim과 대화', time: '5분 전', icon: 'ri-chat-3-line' },
    { type: 'quiz', content: '퀴즈 완료 (8/10)', time: '1시간 전', icon: 'ri-award-line' },
    { type: 'word', content: 'ephemeral', time: '2시간 전', icon: 'ri-book-line' },
    { type: 'chat', content: 'Mike Johnson과 대화', time: '3시간 전', icon: 'ri-chat-3-line' }
  ];

  const quickActions = [
    { title: '새 단어 추가', description: '채팅에서 단어 저장', icon: 'ri-book-line', color: 'blue' },
    { title: '퀴즈 시작', description: '오늘의 복습', icon: 'ri-target-line', color: 'green' },
    { title: '파트너 찾기', description: '새로운 친구', icon: 'ri-user-line', color: 'purple' },
    { title: '학습 통계', description: '상세 분석', icon: 'ri-bar-chart-line', color: 'orange' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            학습 대시보드
          </h1>
          <p className="text-lg mt-2" style={{ color: 'var(--text-secondary)' }}>
            오늘의 학습 현황과 주간 통계를 확인하세요
          </p>
        </div>
        
        {/* Period Selector */}
        <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg p-1 border">
          {['week', 'month', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                selectedPeriod === period
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {period === 'week' ? '주간' : period === 'month' ? '월간' : '연간'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">총 단어</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalWords}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <i className="ri-book-line text-2xl text-blue-600 dark:text-blue-400"></i>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
            <i className="ri-trending-up-line mr-1"></i>
            +12% 이번 주
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">마스터</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.mastered}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <i className="ri-award-line text-2xl text-green-600 dark:text-green-400"></i>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
            <i className="ri-trending-up-line mr-1"></i>
            +8% 이번 주
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">연속 학습</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.studyStreak}일</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <i className="ri-flashlight-line text-2xl text-orange-600 dark:text-orange-400"></i>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-orange-600 dark:text-orange-400">
            <i className="ri-target-line mr-1"></i>
            목표: 30일
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">복습 필요</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.reviewNeeded}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <i className="ri-time-line text-2xl text-red-600 dark:text-red-400"></i>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-red-600 dark:text-red-400">
            <i className="ri-target-line mr-1"></i>
            오늘 복습 권장
          </div>
        </div>
      </div>

      {/* Charts and Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">주간 학습량</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-gray-600 dark:text-gray-400">단어</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-600 dark:text-gray-400">채팅</span>
              </div>
            </div>
          </div>
          
          <div className="h-48 flex items-end justify-between space-x-2">
            {weeklyData.map((day, index) => (
              <div key={day.day} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-sm relative">
                  <div 
                    className="bg-blue-500 rounded-t-sm transition-all duration-500"
                    style={{ height: `${(day.words / 31) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-green-500 rounded-t-sm transition-all duration-500 absolute bottom-0 w-full"
                    style={{ height: `${(day.chats / 7) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs mt-2 text-gray-600 dark:text-gray-400">{day.day}</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white">{day.words}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bars */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">목표 달성률</h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">주간 목표</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{stats.weeklyGoal}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${stats.weeklyGoal}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">복습 완료</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{stats.reviewCompletion}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${stats.reviewCompletion}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">빠른 작업</h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all text-left group hover:scale-105"
              >
                <div className={`w-10 h-10 rounded-lg bg-${action.color}-100 dark:bg-${action.color}-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <i className={`${action.icon} text-xl text-${action.color}-600 dark:text-${action.color}-400`}></i>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                  {action.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {action.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">최근 활동</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <i className={`${activity.icon} text-lg text-gray-600 dark:text-gray-400`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {activity.content}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
