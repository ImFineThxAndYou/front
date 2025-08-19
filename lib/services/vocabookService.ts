import { apiUtils } from '../utils/api';

// 백엔드 API 응답에 맞는 새로운 타입들
export interface VocabularyWordEntry {
  word: string;
  meaning: string;
  pos: string; // part of speech
  lang: string;
  level: string;
  analyzedAt: string;
  chatRoomUuid: string;
  chatMessageId: string[]; // 메시지 ID 배열
  example: string[]; // 예문 배열
}

export interface VocabularyApiResponse {
  content: VocabularyWordEntry[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

// 기존 타입들 (호환성 유지)
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

  // 특정 사용자의 전체 단어장 목록 조회 (새로운 API 응답 구조)
  static async getVocabulariesByMember(membername: string): Promise<VocabularyApiResponse> {
    try {
      console.log('🔄 [VocabookService] API 요청 시작:', `/api/vocabook/member/${membername}`);
      const response = await apiUtils.fetchWithAuth(`/api/vocabook/member/${membername}`);
      console.log('📡 [VocabookService] API 응답 상태:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [VocabookService] API 응답 오류:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data: VocabularyApiResponse = await response.json();
      console.log('✅ [VocabookService] API 응답 데이터 구조:', {
        totalElements: data.totalElements,
        contentLength: data.content?.length,
        firstWord: data.content?.[0]
      });
      console.log('📊 [VocabookService] 받은 단어 개수:', data.content?.length || 0);
      
      return data;
    } catch (error) {
      console.error('❌ [VocabookService] 사용자 단어장 목록 조회 실패:', error);
      // 에러 시 빈 응답 구조 반환
      return {
        content: [],
        pageable: {
          pageNumber: 0,
          pageSize: 50,
          sort: { empty: true, sorted: false, unsorted: true },
          offset: 0,
          paged: true,
          unpaged: false
        },
        last: true,
        totalElements: 0,
        totalPages: 0,
        first: true,
        size: 50,
        number: 0,
        sort: { empty: true, sorted: false, unsorted: true },
        numberOfElements: 0,
        empty: true
      };
    }
  }

  // 기존 메서드 (호환성 유지)
  static async getVocabulariesByMemberOld(membername: string): Promise<MemberVocabulary[]> {
    try {
      console.log('🔄 API 요청 시작:', `/api/vocabook/member/${membername}`);
      const response = await apiUtils.fetchWithAuth(`/api/vocabook/member/${membername}`);
      console.log('📡 API 응답 상태:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API 응답 오류:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ API 응답 데이터:', data);
      console.log('📊 받은 단어장 개수:', data.length);
      
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





