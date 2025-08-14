
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
  
  const t = useCallback((key: string) => {
    const currentLang = language || 'ko';
    
    const translationSource = translations[currentLang as keyof typeof translations];
    
    // Handle namespace - try multiple namespaces if array is provided
    if (namespace) {
      if (Array.isArray(namespace)) {
        // Try each namespace in order until we find a translation
        for (const ns of namespace) {
          const nsSource = translationSource[ns as keyof typeof translationSource] as any;
          
          if (nsSource) {
            // Navigate through nested translation object
            const keys = key.split('.');
            let value: any = nsSource;
            
            for (const k of keys) {
              value = value?.[k];
            }
            
            if (value) {
              return value;
            }
          }
        }
        // If no translation found in any namespace, fall back to key
        return key;
      } else {
        // Single namespace
        const nsSource = translationSource[namespace as keyof typeof translationSource] as any;
        
        if (nsSource) {
          // Navigate through nested translation object for single namespace
          const keys = key.split('.');
          let value: any = nsSource;
          
          for (const k of keys) {
            value = value?.[k];
          }
          
          if (value) {
            return value;
          }
        }
      }
    }
    
    // If no namespace or no translation found in namespace, try root level
    const keys = key.split('.');
    let value: any = translationSource;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  }, [language, namespace]);

  return { 
    t,
    language
  };
};

export default useTranslation;
