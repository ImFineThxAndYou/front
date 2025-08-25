import { apiUtils } from '../utils/api';

export interface TranslateRequest {
  q: string;
  source: string;
  target: string;
}

export interface TranslateResponse {
  translatedText: string;
}

export interface TranslationCache {
  [messageId: string]: {
    [targetLang: string]: {
      text: string;
      timestamp: number;
    };
  };
}

class TranslateService {
  private cache: TranslationCache = {};
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간

  /**
   * 자동 번역 (LiberTranslate - 언어 자동 감지)
   */
  async translateAuto(text: string): Promise<string> {
    try {
      console.log('🔄 자동 번역 요청:', { text });
      
      const response = await apiUtils.fetchWithAuth('/api/translate/auto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 자동 번역 API 오류:', response.status, errorText);
        throw new Error(`Auto translation API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ 자동 번역 성공:', data);
      return data.translatedText;
    } catch (error) {
      console.error('❌ 자동 번역 실패:', error);
      throw new Error('자동 번역에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  /**
   * 고품질 번역 (Gemini)
   */
  async translateWithGemini(text: string, sourceLang: string, targetLang: string): Promise<string> {
    try {
      console.log('🔄 Gemini 번역 요청:', { text, sourceLang, targetLang });
      
      const response = await apiUtils.fetchWithAuth('/api/translate/specific', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLang
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini 번역 API 오류:', response.status, errorText);
        throw new Error(`Gemini translation API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Gemini 번역 성공:', data);
      return data.translatedText;
    } catch (error) {
      console.error('❌ Gemini 번역 실패:', error);
      throw new Error('AI 번역에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  /**
   * 언어 감지 (간단한 구현)
   */
  detectLanguage(text: string): string {
    // 한글 문자가 포함되어 있으면 한국어로 판단
    const koreanRegex = /[가-힣]/;
    if (koreanRegex.test(text)) {
      return 'ko';
    }
    return 'en'; // 기본값
  }

  /**
   * 자동 타겟 언어 결정 (한글 ↔ 영어)
   */
  getAutoTargetLanguage(sourceLang: string): string {
    return sourceLang === 'ko' ? 'en' : 'ko';
  }

  /**
   * 번역 실행 (자동 번역 사용)
   */
  async translate(
    messageId: string, 
    text: string, 
    targetLang?: string, 
    useGemini: boolean = false
  ): Promise<string> {
    console.log('🔄 번역 시작:', { messageId, text: text.substring(0, 50) + '...', useGemini });
    
    // 캐시 확인 (자동 번역이므로 'auto' 키 사용)
    // const cacheKey = 'auto';
    const cacheKey = useGemini ? 'gemini' : 'auto';
    const cached = this.getCachedTranslation(messageId, cacheKey);
    if (cached) {
      console.log('✅ 캐시된 번역 사용:', cached);
      return cached;
    }

    // 번역 실행
    let translatedText: string;
    if (useGemini) {
      // Gemini는 여전히 source, target 필요하므로 기존 방식 사용
      const sourceLang = this.detectLanguage(text);
      const finalTargetLang = targetLang || this.getAutoTargetLanguage(sourceLang);
      translatedText = await this.translateWithGemini(text, sourceLang, finalTargetLang);
    } else {
      // LiberTranslate는 자동 언어 감지 사용
      translatedText = await this.translateAuto(text);
    }

    // 캐시 저장
    this.cacheTranslation(messageId, cacheKey, translatedText);
    
    console.log('✅ 번역 완료:', translatedText);
    return translatedText;
  }

  /**
   * 캐시에서 번역 가져오기
   */
  private getCachedTranslation(messageId: string, targetLang: string): string | null {
    const cached = this.cache[messageId]?.[targetLang];
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.text;
    }
    return null;
  }

  /**
   * 번역을 캐시에 저장
   */
  private cacheTranslation(messageId: string, targetLang: string, text: string): void {
    if (!this.cache[messageId]) {
      this.cache[messageId] = {};
    }
    this.cache[messageId][targetLang] = {
      text,
      timestamp: Date.now()
    };
  }

  /**
   * 캐시 클리어
   */
  clearCache(): void {
    this.cache = {};
    console.log('🗑️ 번역 캐시 클리어됨');
  }

  /**
   * 특정 메시지의 캐시 클리어
   */
  clearMessageCache(messageId: string): void {
    if (this.cache[messageId]) {
      delete this.cache[messageId];
      console.log('🗑️ 메시지 번역 캐시 클리어됨:', messageId);
    }
  }
}

export const translateService = new TranslateService();
