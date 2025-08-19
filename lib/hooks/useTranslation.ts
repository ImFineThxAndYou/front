
'use client';

import { useEffect, useCallback } from 'react';
import { useUIStore } from '../stores/ui';
import { translations } from '../i18n/translations';

export const useTranslation = (namespace?: string | string[]) => {
  const { language, setLanguage } = useUIStore();
  
  // 브라우저 언어 감지 및 자동 설정
  useEffect(() => {
    if (!language) {
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('ko')) {
        setLanguage('ko');
      } else {
        setLanguage('en');
      }
    }
  }, [language, setLanguage]);
  
  const t = useCallback((key: string, params?: Record<string, any>) => {
    const currentLang = language || 'ko';
    
    // 번역 소스 가져오기
    const translationSource = translations[currentLang as keyof typeof translations];
    if (!translationSource) {
      console.error('번역 소스를 찾을 수 없습니다:', currentLang);
      return key;
    }
    
    // 네임스페이스 처리
    if (namespace) {
      if (Array.isArray(namespace)) {
        // 여러 네임스페이스에서 순서대로 찾기
        for (const ns of namespace) {
          const nsSource = translationSource[ns as keyof typeof translationSource] as any;
          if (nsSource) {
            const keys = key.split('.');
            let value: any = nsSource;
            
            for (const k of keys) {
              value = value?.[k];
            }
            
            if (value && typeof value === 'string') {
              return params ? replaceParams(value, params) : value;
            }
          }
        }
      } else {
        // 단일 네임스페이스
        const nsSource = translationSource[namespace as keyof typeof translationSource] as any;
        if (nsSource) {
          const keys = key.split('.');
          let value: any = nsSource;
          
          for (const k of keys) {
            value = value?.[k];
          }
          
          if (value && typeof value === 'string') {
            return params ? replaceParams(value, params) : value;
          }
        }
      }
    }
    
    // 루트 레벨에서 찾기
    const keys = key.split('.');
    let value: any = translationSource;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (value && typeof value === 'string') {
      return params ? replaceParams(value, params) : value;
    }
    
    // 번역을 찾을 수 없는 경우 키 반환
    return key;
  }, [language, namespace]);

  // 매개변수 치환 함수
  const replaceParams = (text: string, params: Record<string, any>): string => {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? String(params[key]) : match;
    });
  };

  return { 
    t,
    language
  };
};

export default useTranslation;
