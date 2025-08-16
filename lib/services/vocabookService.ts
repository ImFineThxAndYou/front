import { apiUtils } from '../utils/api';

export interface DictionaryWordEntry {
  word: string;
  meaning: string;
  pos: string;
  lang: string;
  level: string;
  dictionaryType: string;
  usedInMessages: string[];
}

export interface ChatRoomVocabulary {
  id: string;
  chatRoomUuid: string;
  analyzedAt: string;
  words: DictionaryWordEntry[];
}

export interface MemberWordEntry extends DictionaryWordEntry {
  chatRoomUuid: string;
  analyzedAt: string;
  frequency: number;
}

export interface MemberVocabulary {
  id: string;
  membername: string;
  createdAt: string;
  words: MemberWordEntry[];
}

export interface AnalyzeRequestDto {
  text: string;
}

export class VocabookService {
  // 특정 채팅방의 단어장 목록 조회
  static async getVocabularyListByChatRoom(chatRoomUuid: string): Promise<ChatRoomVocabulary[]> {
    try {
      const response = await apiUtils.fetchWithAuth(`/api/vocabook/${chatRoomUuid}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ 채팅방 단어장 목록 조회 실패:', error);
      return [];
    }
  }

  // 특정 사용자의 전체 단어장 목록 조회
  static async getVocabulariesByMember(membername: string): Promise<MemberVocabulary[]> {
    try {
      const response = await apiUtils.fetchWithAuth(`/api/vocabook/member/${membername}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ 사용자 단어장 목록 조회 실패:', error);
      return [];
    }
  }

  // 특정 사용자의 날짜별 단어장 조회
  static async getVocabulariesByMemberAndDate(membername: string, date: string): Promise<MemberVocabulary> {
    try {
      const response = await apiUtils.fetchWithAuth(`/api/vocabook/member/${membername}/${date}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ 사용자 날짜별 단어장 조회 실패:', error);
      throw error;
    }
  }

  // 전체 사용자 단어장 목록 조회 (관리자용)
  static async getAllMemberVocabularies(): Promise<MemberVocabulary[]> {
    try {
      const response = await apiUtils.fetchWithAuth('/api/vocabook/member/all');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ 전체 사용자 단어장 목록 조회 실패:', error);
      return [];
    }
  }

  // 전체 단어장 목록 조회
  static async getAllVocabularies(): Promise<ChatRoomVocabulary[]> {
    try {
      const response = await apiUtils.fetchWithAuth('/api/vocabook/all');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ 전체 단어장 목록 조회 실패:', error);
      return [];
    }
  }

  // 텍스트 분석
  static async analyzeText(request: AnalyzeRequestDto): Promise<DictionaryWordEntry[]> {
    try {
      const response = await apiUtils.fetchWithAuth('/api/vocabook/analyze/chats', {
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
      console.error('❌ 텍스트 분석 실패:', error);
      throw error;
    }
  }
}

export const vocabookService = VocabookService;





