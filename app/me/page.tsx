
'use client';

import { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import ProfileSection from '../components/me/ProfileSection';
import SettingsSection from '../components/me/SettingsSection';
import DangerZone from '../components/me/DangerZone';
import LearningDashboard from '../components/me/LearningDashboard';
import { useTranslation } from '../../lib/hooks/useTranslation';

type TabType = 'dashboard' | 'profile' | 'settings' | 'danger';

const tabs = [
  { id: 'dashboard' as TabType, icon: 'ri-dashboard-line', activeIcon: 'ri-dashboard-fill', key: 'tabs.dashboard' },
  { id: 'profile' as TabType, icon: 'ri-user-line', activeIcon: 'ri-user-fill', key: 'tabs.profile' },
  { id: 'settings' as TabType, icon: 'ri-settings-line', activeIcon: 'ri-settings-fill', key: 'tabs.settings' },
  { id: 'danger' as TabType, icon: 'ri-error-warning-line', activeIcon: 'ri-error-warning-fill', key: 'tabs.danger' }
];

export default function MePage() {
  const { t } = useTranslation('me');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <LearningDashboard />;
      case 'profile':
        return <ProfileSection />;
      case 'settings':
        return <SettingsSection />;
      case 'danger':
        return <DangerZone />;
      default:
        return <LearningDashboard />;
    }
  };

  return (
    <MainLayout>
      <div className="flex h-full theme-transition max-w-7xl mx-auto">
        {/* Sidebar */}
        <div className="w-80 backdrop-blur-xl border-r theme-transition flex-shrink-0"
          style={{
            backgroundColor: 'var(--surface-primary)',
            borderColor: 'var(--border-primary)'
          }}
        >
          <div className="p-8 h-full flex flex-col">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-2"
                style={{
                  background: 'linear-gradient(135deg, var(--text-primary), var(--text-secondary))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {t('title')}
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {t('subtitle')}
              </p>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex-1 space-y-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer group
                      ${isActive
                        ? 'text-white shadow-lg'
                        : 'hover:bg-opacity-10'
                      }
                    `}
                    style={{
                      background: isActive 
                        ? 'linear-gradient(135deg, var(--info), var(--success))'
                        : 'transparent',
                      color: isActive ? 'white' : 'var(--text-secondary)',
                      boxShadow: isActive ? 'var(--shadow-lg)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = isActive ? 'white' : 'var(--text-secondary)';
                      }
                    }}
                  >
                    <i className={`${isActive ? tab.activeIcon : tab.icon} text-lg mr-3 transition-all group-hover:scale-110`}></i>
                    {t(tab.key)}
                    {isActive && (
                      <div className="ml-auto w-2 h-2 rounded-full opacity-80 bg-white"></div>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Profile Preview */}
            <div className="mt-auto">
              <div className="rounded-xl p-4 border theme-transition"
                style={{
                  background: 'linear-gradient(135deg, var(--surface-secondary), var(--surface-tertiary))',
                  borderColor: 'var(--border-secondary)'
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <i className="ri-user-line text-white text-sm"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                      일반 사용자
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      howareyou 서비스 이용 중
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Centered */}
        <div className="flex-1 overflow-y-auto flex justify-center">
          <div className="w-full max-w-4xl p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
