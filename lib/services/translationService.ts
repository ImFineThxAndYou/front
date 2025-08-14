import { apiUtils } from '../utils/api';

export interface TranslateRequestDto {
  q: string;
  source: string;
  target: string;
}

export interface TranslateResponseDto {
  translatedText: string;
}

export class TranslationService {
  // 기본 번역 (LiberTranslate)
  static async translateBasic(request: TranslateRequestDto): Promise<TranslateResponseDto> {
    try {
      const response = await apiUtils.fetchWithAuth('/api/translate/basic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ 기본 번역 실패:', error);
      throw error;
    }
  }

  // Gemini로 번역 (고품질/다시 번역)
  static async translateSpecific(request: TranslateRequestDto): Promise<TranslateResponseDto> {
    try {
      const response = await apiUtils.fetchWithAuth('/api/translate/specific', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ 고품질 번역 실패:', error);
      throw error;
    }
  }
}

export const translationService = TranslationService;

