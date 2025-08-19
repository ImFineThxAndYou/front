import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { vocabookService, type MemberWordEntry, type MemberVocabulary, type VocabularyWordEntry, type VocabularyApiResponse } from '../services/vocabookService';

export interface Word {
  id: string;
  word: string;
  meanings: string[];
  partOfSpeech: string;
  difficulty: number;
  examples: string[];
  tags: string[];
  createdAt: string;
  sourceChatId?: string;
}

interface WordbookFilters {
  difficulty: number[];
  partOfSpeech: string[];
  searchQuery: string;
}

interface QuizSettings {
  type: 'meaning' | 'word' | 'mixed';
  difficulty: number[];
  count: number;
  timeLimit: boolean;
  timePerQuestion: number;
}

interface WordbookState {
  words: Word[];
  filters: WordbookFilters;
  selectedWords: string[];
  quizSettings: QuizSettings;
  isLoading: boolean;
  
  // API data loading
  loadWords: (membername: string) => Promise<void>;
  refreshWords: () => Promise<void>;
  
  // Word management
  addWord: (word: Omit<Word, 'id' | 'createdAt'>) => Promise<void>;
  updateWord: (id: string, word: Partial<Word>) => Promise<void>;
  deleteWord: (id: string) => Promise<void>;
  deleteWords: (ids: string[]) => Promise<void>;
  
  // Filtering
  setDifficultyFilter: (difficulty: number[]) => void;
  setPartOfSpeechFilter: (partOfSpeech: string[]) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  
  // Selection
  selectWord: (id: string) => void;
  selectAllWords: () => void;
  clearSelection: () => void;
  
  // Quiz
  startQuiz: (settings: QuizSettings) => void;
  setQuizSettings: (settings: Partial<QuizSettings>) => void;
  
  // Utility
  getFilteredWords: () => Word[];
  getTodayWords: () => Word[];
  getWordsByDifficulty: (difficulty: number) => Word[];
}

// level을 difficulty로 변환하는 공통 함수
const levelToDifficulty = (level: string): number => {
  switch (level.toLowerCase()) {
    case 'a1': return 1;
    case 'a2': return 2;
    case 'b1': return 3;
    case 'b2': return 4;
    case 'c1': return 5;
    case 'c2': return 6;
    case 'easy': return 1;
    case 'medium': return 3;
    case 'hard': return 5;
    default: return 1;
  }
};

// 새로운 API 응답을 위한 변환 함수
const convertVocabularyWordToWord = (vocabWord: VocabularyWordEntry, index: number): Word => {
  console.log('🔄 [Store] 단어 변환 (새 API):', vocabWord.word);
  
  return {
    id: `${vocabWord.word}-${vocabWord.chatRoomUuid}-${index}-${Date.now()}`,
    word: vocabWord.word,
    meanings: [vocabWord.meaning],
    partOfSpeech: vocabWord.pos || 'noun',
    difficulty: levelToDifficulty(vocabWord.level),
    examples: vocabWord.example || [],
    tags: [vocabWord.lang, vocabWord.level].filter(Boolean),
    createdAt: vocabWord.analyzedAt,
    sourceChatId: vocabWord.chatRoomUuid
  };
};

// 기존 API 응답을 위한 변환 함수 (호환성 유지)
const convertMemberWordToWord = (memberWord: MemberWordEntry, index: number): Word => {
  console.log('🔄 [Store] 단어 변환 (기존 API):', memberWord.word);
  
  return {
    id: `${memberWord.word}-${memberWord.chatRoomUuid}-${index}`,
    word: memberWord.word,
    meanings: [memberWord.meaning],
    partOfSpeech: memberWord.pos || 'noun',
    difficulty: levelToDifficulty(memberWord.level),
    examples: memberWord.usedInMessages || [],
    tags: [memberWord.lang, memberWord.dictionaryType].filter(Boolean),
    createdAt: memberWord.analyzedAt,
    sourceChatId: memberWord.chatRoomUuid
  };
};

export const useWordbookStore = create<WordbookState>()(
  persist(
    (set, get) => ({
      words: [], // 빈 배열로 초기화
      filters: {
        difficulty: [],
        partOfSpeech: [],
        searchQuery: ''
      },
      selectedWords: [],
      quizSettings: {
        type: 'mixed',
        difficulty: [],
        count: 10,
        timeLimit: false,
        timePerQuestion: 30
      },
      isLoading: false,

      // API data loading (새로운 API 응답 구조용)
      loadWords: async (membername: string) => {
        console.log('🔄 [Store] 단어장 데이터 로딩 시작:', membername);
        set({ isLoading: true });
        try {
          const apiResponse = await vocabookService.getVocabulariesByMember(membername);
          console.log('📦 [Store] 받은 API 응답:', {
            totalElements: apiResponse.totalElements,
            contentLength: apiResponse.content?.length,
            pageable: apiResponse.pageable
          });
          
          // 새로운 API 응답 구조 처리
          const vocabularyWords = apiResponse.content || [];
          console.log('📚 [Store] 처리할 단어 개수:', vocabularyWords.length);
          
          // 모든 단어들을 Word 인터페이스로 변환
          const allWords: Word[] = vocabularyWords.map((vocabWord, index) => {
            return convertVocabularyWordToWord(vocabWord, index);
          });

          console.log('✅ [Store] 단어장 데이터 로딩 완료:', allWords.length, '개 단어');
          console.log('🔍 [Store] 변환된 첫 번째 단어 샘플:', allWords[0]);
          console.log('🔍 [Store] 변환된 마지막 단어 샘플:', allWords[allWords.length - 1]);
          
          set({ words: allWords, isLoading: false });
        } catch (error) {
          console.error('❌ [Store] 단어장 데이터 로딩 실패:', error);
          set({ isLoading: false });
        }
      },

      refreshWords: async () => {
        // 현재 사용자 정보를 가져오기 위해 localStorage에서 확인
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          const userData = JSON.parse(currentUser);
          if (userData.membername) {
            await get().loadWords(userData.membername);
          }
        }
      },

      // Word management
      addWord: async (wordData) => {
        const newWord: Word = {
          ...wordData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        };
        
        set(state => ({
          words: [...state.words, newWord]
        }));
      },

      updateWord: async (id, wordData) => {
        set(state => ({
          words: state.words.map(word => 
            word.id === id ? { ...word, ...wordData } : word
          )
        }));
      },

      deleteWord: async (id) => {
        set(state => ({
          words: state.words.filter(word => word.id !== id),
          selectedWords: state.selectedWords.filter(wordId => wordId !== id)
        }));
      },

      deleteWords: async (ids) => {
        set(state => ({
          words: state.words.filter(word => !ids.includes(word.id)),
          selectedWords: []
        }));
      },

      // Filtering
      setDifficultyFilter: (difficulty) => {
        set(state => ({
          filters: { ...state.filters, difficulty }
        }));
      },

      setPartOfSpeechFilter: (partOfSpeech) => {
        set(state => ({
          filters: { ...state.filters, partOfSpeech }
        }));
      },

      setSearchQuery: (searchQuery) => {
        set(state => ({
          filters: { ...state.filters, searchQuery }
        }));
      },

      clearFilters: () => {
        set(state => ({
          filters: {
            difficulty: [],
            partOfSpeech: [],
            searchQuery: ''
          }
        }));
      },

      // Selection
      selectWord: (id) => {
        set(state => ({
          selectedWords: state.selectedWords.includes(id)
            ? state.selectedWords.filter(wordId => wordId !== id)
            : [...state.selectedWords, id]
        }));
      },

      selectAllWords: () => {
        const filteredWords = get().getFilteredWords();
        set({
          selectedWords: filteredWords.map(word => word.id)
        });
      },

      clearSelection: () => {
        set({ selectedWords: [] });
      },

      // Quiz
      startQuiz: (settings) => {
        set({ quizSettings: settings });
      },

      setQuizSettings: (settings) => {
        set(state => ({
          quizSettings: { ...state.quizSettings, ...settings }
        }));
      },

      // Utility
      getFilteredWords: () => {
        const { words, filters } = get();
        
        return words.filter(word => {
          // Difficulty filter
          if (filters.difficulty.length > 0 && !filters.difficulty.includes(word.difficulty)) {
            return false;
          }
          
          // Part of speech filter
          if (filters.partOfSpeech.length > 0 && !filters.partOfSpeech.includes(word.partOfSpeech)) {
            return false;
          }
          
          // Search query filter
          if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            const wordMatch = word.word.toLowerCase().includes(query);
            const meaningMatch = word.meanings.some(meaning => 
              meaning.toLowerCase().includes(query)
            );
            const tagMatch = word.tags.some(tag => 
              tag.toLowerCase().includes(query)
            );
            
            if (!wordMatch && !meaningMatch && !tagMatch) {
              return false;
            }
          }
          
          return true;
        });
      },

      getTodayWords: () => {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        return get().words.filter(word => {
          const wordDate = new Date(word.createdAt);
          return wordDate >= todayStart;
        });
      },

      getWordsByDifficulty: (difficulty) => {
        return get().words.filter(word => word.difficulty === difficulty);
      }
    }),
    {
      name: 'wordbook-storage',
      partialize: (state) => ({
        words: state.words,
        filters: state.filters,
        quizSettings: state.quizSettings
      })
    }
  )
);
