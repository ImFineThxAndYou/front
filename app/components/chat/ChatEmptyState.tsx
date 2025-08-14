
'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/hooks/useTranslation';

export default function ChatEmptyState() {
  const { t } = useTranslation('chat');

  return (
    <div className="text-center max-w-md mx-auto">
      {/* Animated Icon */}
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-pulse">
          <i className="ri-chat-3-line text-4xl text-white"></i>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce delay-100"></div>
        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-green-400 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-1/2 -right-4 w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-500"></div>
      </div>
      
      <h2 
        className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
      >
        {t('empty.selectChat')}
      </h2>
      
      <p 
        className="mb-8 leading-relaxed"
        style={{ color: 'var(--text-secondary)' }}
      >
        {t('empty.selectChatDesc')}
      </p>
      
      {/* Action Buttons */}
      <div className="space-y-4">
        <Link
          href="/explore"
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 shadow-lg hover:shadow-xl whitespace-nowrap"
        >
          <i className="ri-compass-3-line mr-3 text-xl"></i>
          {t('empty.findNewFriends')}
        </Link>
        
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div 
            className="flex items-center px-4 py-2 rounded-full backdrop-blur-sm border"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border-secondary)',
              color: 'var(--text-tertiary)'
            }}
          >
            <i className="ri-translate-2 mr-2 text-indigo-500"></i>
            <span>{t('empty.realtimeTranslation')}</span>
          </div>
          
          <div 
            className="flex items-center px-4 py-2 rounded-full backdrop-blur-sm border"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border-secondary)',
              color: 'var(--text-tertiary)'
            }}
          >
            <i className="ri-book-2-line mr-2 text-purple-500"></i>
            <span>{t('empty.wordbookIntegration')}</span>
          </div>
        </div>
        
        {/* Tips Section */}
        <div 
          className="mt-8 p-6 rounded-2xl border backdrop-blur-sm"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border-secondary)'
          }}
        >
          <h3 
            className="font-semibold mb-3 flex items-center"
            style={{ color: 'var(--text-primary)' }}
          >
            <i className="ri-lightbulb-line mr-2 text-yellow-500"></i>
            {t('empty.chatTips')}
          </h3>
          
          <div className="space-y-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
            <div className="flex items-start">
              <span className="text-indigo-500 mr-2">•</span>
              <span>{t('empty.tip1')}</span>
            </div>
            <div className="flex items-start">
              <span className="text-purple-500 mr-2">•</span>
              <span>{t('empty.tip2')}</span>
            </div>
            <div className="flex items-start">
              <span className="text-pink-500 mr-2">•</span>
              <span>{t('empty.tip3')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
