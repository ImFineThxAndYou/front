
'use client';

import { useState, useEffect } from 'react';
// Remix Icon 사용 (lucide-react 대신)
import { useTranslation } from '../../../lib/hooks/useTranslation';
import { useUIStore } from '../../../lib/stores/ui';

interface Settings {
  language: string;
  notifications: {
    chatRequests: boolean;
    newMessages: boolean;
    wordReminders: boolean;
    systemUpdates: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    allowSearchByInterests: boolean;
    autoTranslate: boolean;
  };
  experimental: {
    autoWordExtraction: boolean;
    voiceMessages: boolean;
    aiRecommendations: boolean;
  };
}

export default function SettingsSection() {
  const { t } = useTranslation(['me', 'common']);
  const { theme, setTheme, language, setLanguage } = useUIStore();

  const [settings, setSettings] = useState<Settings>({
    language: 'ko',
    notifications: {
      chatRequests: true,
      newMessages: true,
      wordReminders: false,
      systemUpdates: true
    },
    privacy: {
      showOnlineStatus: true,
      allowSearchByInterests: true,
      autoTranslate: false
    },
    experimental: {
      autoWordExtraction: false,
      voiceMessages: false,
      aiRecommendations: true
    }
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSettings(prev => ({ 
      ...prev,
      language: language
    }));
  }, [language]);

  const handleSettingChange = (category: keyof Omit<Settings, 'language'>, key: string, value: any) => {
    setSettings(prev => ({ 
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage);
    setSettings(prev => ({ ...prev, language: newLanguage }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setHasChanges(false);
    setIsSaving(false);
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {t('settings.title')}
          </h2>
          <p 
            className="mt-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            {t('settings.subtitle')}
          </p>
        </div>
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg whitespace-nowrap"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--text-on-accent)'
            }}
            onMouseEnter={(e) => {
              if (!isSaving) {
                e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSaving) {
                e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
              }
            }}
          >
                            <i className="ri-save-line w-4 h-4 mr-2 inline text-base"></i>
                              {isSaving ? t('common.saving') : t('common.save')}
          </button>
        )}
      </div>

      <div className="space-y-8">
        {/* Language & Theme */}
        <div 
          className="rounded-xl border p-6"
          style={{
            backgroundColor: 'var(--surface-primary)',
            borderColor: 'var(--border-primary)'
          }}
        >
          <h3 
            className="text-lg font-semibold mb-4 flex items-center"
            style={{ color: 'var(--text-primary)' }}
          >
                            <i className="ri-global-line w-5 h-5 mr-2 text-lg"></i>
            {t('settings.appearance')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                {t('settings.language')}
              </label>
              <select
                value={settings.language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent pr-8"
                style={{
                  borderColor: 'var(--border-primary)',
                  backgroundColor: 'var(--surface-primary)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="ko">한국어</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                {t('settings.theme')}
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setTheme('light')}
                  className="flex items-center px-3 py-2 rounded-lg border transition-colors whitespace-nowrap"
                  style={{
                    backgroundColor: theme === 'light' ? 'var(--accent-primary)' : 'transparent',
                    borderColor: theme === 'light' ? 'var(--accent-primary)' : 'var(--border-primary)',
                    color: theme === 'light' ? 'var(--text-on-accent)' : 'var(--text-primary)'
                  }}
                  onMouseEnter={(e) => {
                    if (theme !== 'light') {
                      e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (theme !== 'light') {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <i className="ri-sun-line w-4 h-4 mr-2 text-base"></i>
                                      {t('settings.lightTheme')}
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className="flex items-center px-3 py-2 rounded-lg border transition-colors whitespace-nowrap"
                  style={{
                    backgroundColor: theme === 'dark' ? 'var(--accent-primary)' : 'transparent',
                    borderColor: theme === 'dark' ? 'var(--accent-primary)' : 'var(--border-primary)',
                    color: theme === 'dark' ? 'var(--text-on-accent)' : 'var(--text-primary)'
                  }}
                  onMouseEnter={(e) => {
                    if (theme !== 'dark') {
                      e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (theme !== 'dark') {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <i className="ri-moon-line w-4 h-4 mr-2 text-base"></i>
                                      {t('settings.darkTheme')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div 
          className="rounded-xl border p-6"
          style={{
            backgroundColor: 'var(--surface-primary)',
            borderColor: 'var(--border-primary)'
          }}
        >
          <h3 
            className="text-lg font-semibold mb-4 flex items-center"
            style={{ color: 'var(--text-primary)' }}
          >
                            <i className="ri-notification-line w-5 h-5 mr-2 text-lg"></i>
            {t('settings.notifications')}
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('settings.chatRequests')}
                </h4>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t('settings.chatRequestsDesc')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.chatRequests}
                  onChange={(e) => handleSettingChange('notifications', 'chatRequests', e.target.checked)}
                  className="sr-only peer"
                />
                <div 
                  className="w-11 h-6 peer-focus:outline-none peer-focus:ring-4 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                  style={{
                    backgroundColor: settings.notifications.chatRequests ? 'var(--accent-primary)' : 'var(--surface-secondary)',
                    borderColor: 'var(--border-primary)'
                  }}
                >
                  <div 
                    className="absolute top-[2px] left-[2px] w-5 h-5 rounded-full transition-all"
                    style={{
                      backgroundColor: 'var(--text-on-accent)',
                      transform: settings.notifications.chatRequests ? 'translateX(20px)' : 'translateX(0)'
                    }}
                  />
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('settings.newMessages')}
                </h4>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t('settings.newMessagesDesc')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.newMessages}
                  onChange={(e) => handleSettingChange('notifications', 'newMessages', e.target.checked)}
                  className="sr-only peer"
                />
                <div 
                  className="w-11 h-6 peer-focus:outline-none peer-focus:ring-4 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                  style={{
                    backgroundColor: settings.notifications.newMessages ? 'var(--accent-primary)' : 'var(--surface-secondary)',
                    borderColor: 'var(--border-primary)'
                  }}
                >
                  <div 
                    className="absolute top-[2px] left-[2px] w-5 h-5 rounded-full transition-all"
                    style={{
                      backgroundColor: 'var(--text-on-accent)',
                      transform: settings.notifications.newMessages ? 'translateX(20px)' : 'translateX(0)'
                    }}
                  />
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('settings.wordReminders')}
                </h4>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t('settings.wordRemindersDesc')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.wordReminders}
                  onChange={(e) => handleSettingChange('notifications', 'wordReminders', e.target.checked)}
                  className="sr-only peer"
                />
                <div 
                  className="w-11 h-6 peer-focus:outline-none peer-focus:ring-4 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                  style={{
                    backgroundColor: settings.notifications.wordReminders ? 'var(--accent-primary)' : 'var(--surface-secondary)',
                    borderColor: 'var(--border-primary)'
                  }}
                >
                  <div 
                    className="absolute top-[2px] left-[2px] w-5 h-5 rounded-full transition-all"
                    style={{
                      backgroundColor: 'var(--text-on-accent)',
                      transform: settings.notifications.wordReminders ? 'translateX(20px)' : 'translateX(0)'
                    }}
                  />
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div 
          className="rounded-xl border p-6"
          style={{
            backgroundColor: 'var(--surface-primary)',
            borderColor: 'var(--border-primary)'
          }}
        >
          <h3 
            className="text-lg font-semibold mb-4 flex items-center"
            style={{ color: 'var(--text-primary)' }}
          >
                            <i className="ri-shield-check-line w-5 h-5 mr-2 text-lg"></i>
            {t('settings.privacy')}
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('settings.showOnlineStatus')}
                </h4>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t('settings.showOnlineStatusDesc')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.privacy.showOnlineStatus}
                  onChange={(e) => handleSettingChange('privacy', 'showOnlineStatus', e.target.checked)}
                  className="sr-only peer"
                />
                <div 
                  className="w-11 h-6 peer-focus:outline-none peer-focus:ring-4 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                  style={{
                    backgroundColor: settings.privacy.showOnlineStatus ? 'var(--accent-primary)' : 'var(--surface-secondary)',
                    borderColor: 'var(--border-primary)'
                  }}
                >
                  <div 
                    className="absolute top-[2px] left-[2px] w-5 h-5 rounded-full transition-all"
                    style={{
                      backgroundColor: 'var(--text-on-accent)',
                      transform: settings.privacy.showOnlineStatus ? 'translateX(20px)' : 'translateX(0)'
                    }}
                  />
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('settings.allowSearch')}
                </h4>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t('settings.allowSearchDesc')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.privacy.allowSearchByInterests}
                  onChange={(e) => handleSettingChange('privacy', 'allowSearchByInterests', e.target.checked)}
                  className="sr-only peer"
                />
                <div 
                  className="w-11 h-6 peer-focus:outline-none peer-focus:ring-4 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                  style={{
                    backgroundColor: settings.privacy.allowSearchByInterests ? 'var(--accent-primary)' : 'var(--surface-secondary)',
                    borderColor: 'var(--border-primary)'
                  }}
                >
                  <div 
                    className="absolute top-[2px] left-[2px] w-5 h-5 rounded-full transition-all"
                    style={{
                      backgroundColor: 'var(--text-on-accent)',
                      transform: settings.privacy.allowSearchByInterests ? 'translateX(20px)' : 'translateX(0)'
                    }}
                  />
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Experimental Features */}
        <div 
          className="rounded-xl border p-6"
          style={{
            backgroundColor: 'var(--surface-primary)',
            borderColor: 'var(--border-primary)'
          }}
        >
          <h3 
            className="text-lg font-semibold mb-4 flex items-center"
            style={{ color: 'var(--text-primary)' }}
          >
                            <i className="ri-flashlight-line w-5 h-5 mr-2 text-lg"></i>
            {t('settings.experimental')}
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('settings.autoWordExtraction')}
                  <span 
                    className="ml-2 px-2 py-1 text-xs rounded-full"
                    style={{
                      backgroundColor: 'var(--accent-success)',
                      color: 'var(--text-on-accent)'
                    }}
                  >
                    BETA
                  </span>
                </h4>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t('settings.autoWordExtractionDesc')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.experimental.autoWordExtraction}
                  onChange={(e) => handleSettingChange('experimental', 'autoWordExtraction', e.target.checked)}
                  className="sr-only peer"
                />
                <div 
                  className="w-11 h-6 peer-focus:outline-none peer-focus:ring-4 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                  style={{
                    backgroundColor: settings.experimental.autoWordExtraction ? 'var(--accent-primary)' : 'var(--surface-secondary)',
                    borderColor: 'var(--border-primary)'
                  }}
                >
                  <div 
                    className="absolute top-[2px] left-[2px] w-5 h-5 rounded-full transition-all"
                    style={{
                      backgroundColor: 'var(--text-on-accent)',
                      transform: settings.experimental.autoWordExtraction ? 'translateX(20px)' : 'translateX(0)'
                    }}
                  />
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('settings.aiRecommendations')}
                </h4>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t('settings.aiRecommendationsDesc')}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.experimental.aiRecommendations}
                  onChange={(e) => handleSettingChange('experimental', 'aiRecommendations', e.target.checked)}
                  className="sr-only peer"
                />
                <div 
                  className="w-11 h-6 peer-focus:outline-none peer-focus:ring-4 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                  style={{
                    backgroundColor: settings.experimental.aiRecommendations ? 'var(--accent-primary)' : 'var(--surface-secondary)',
                    borderColor: 'var(--border-primary)'
                  }}
                >
                  <div 
                    className="absolute top-[2px] left-[2px] w-5 h-5 rounded-full transition-all"
                    style={{
                      backgroundColor: 'var(--text-on-accent)',
                      transform: settings.experimental.aiRecommendations ? 'translateX(20px)' : 'translateX(0)'
                    }}
                  />
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
