
'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { translations } from './i18n/translations';

const resources = {
  ko: {
    common: translations.ko.common,
    nav: translations.ko.nav,
    home: translations.ko.home,
    chat: translations.ko.chat,
    explore: translations.ko.explore,
    wordbook: translations.ko.wordbook,
    quiz: translations.ko.quiz,
    me: translations.ko.me,
    notifications: {
      title: "알림",
      markAllRead: "모두 읽음으로 표시",
      noNotifications: "새로운 알림이 없습니다",
      chatRequest: "채팅 신청",
      newMessage: "새 메시지",
      wordReminder: "단어 복습",
      sentYouRequest: "님이 채팅을 신청했습니다",
      sentYouMessage: "님이 메시지를 보냈습니다",
      timeToReview: "저장한 단어들을 복습할 시간입니다"
    }
  },
  en: {
    common: translations.en.common,
    nav: translations.en.nav,
    home: translations.en.home,
    chat: translations.en.chat,
    explore: translations.en.explore,
    wordbook: translations.en.wordbook,
    quiz: translations.en.quiz,
    me: translations.en.me,
    notifications: {
      title: "Notifications",
      markAllRead: "Mark all as read",
      noNotifications: "No new notifications",
      chatRequest: "Chat Request",
      newMessage: "New Message",
      wordReminder: "Word Reminder",
      sentYouRequest: "sent you a chat request",
      sentYouMessage: "sent you a message",
      timeToReview: "Time to review your saved words"
    }
  }
};

// 브라우저 환경에서만 초기화
if (typeof window !== 'undefined') {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'ko',
      lng: 'ko', // 기본 언어를 명시적으로 설정
      defaultNS: 'common',
      ns: ['common', 'nav', 'home', 'chat', 'explore', 'wordbook', 'quiz', 'me'],
      debug: false, // 디버그 비활성화
      interpolation: {
        escapeValue: false
      },
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        lookupLocalStorage: 'i18nextLng',
        caches: ['localStorage']
      }
    });
}

export default i18n;
