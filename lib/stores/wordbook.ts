import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { vocabookService, type MemberWordEntry, type MemberVocabulary } from '../services/vocabookService';

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

// API 응답 데이터를 Store 형식으로 변환하는 헬퍼 함수
const convertMemberWordToWord = (memberWord: MemberWordEntry, index: number): Word => {
  // level을 difficulty로 변환 (EASY=1, MEDIUM=2, HARD=3)
  const levelToDifficulty = (level: string): number => {
    switch (level.toUpperCase()) {
      case 'EASY': return 1;
      case 'MEDIUM': return 2;
      case 'HARD': return 3;
      default: return 1;
    }
  };

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

      // API data loading
      loadWords: async (membername: string) => {
        console.log('🔄 [Store] 단어장 데이터 로딩 시작:', membername);
        set({ isLoading: true });
        try {
          const memberVocabularies = await vocabookService.getVocabulariesByMember(membername);
          console.log('📦 [Store] 받은 단어장 목록:', memberVocabularies);
          console.log('🔍 [Store] memberVocabularies 타입:', typeof memberVocabularies);
          console.log('🔍 [Store] memberVocabularies.length:', memberVocabularies?.length);
          console.log('🔍 [Store] Array.isArray(memberVocabularies):', Array.isArray(memberVocabularies));
          
          // 데이터 구조 확인 및 처리
          let vocabulariesToProcess = [];
          if (Array.isArray(memberVocabularies)) {
            vocabulariesToProcess = memberVocabularies;
          } else if (memberVocabularies && typeof memberVocabularies === 'object') {
            // 단일 객체인 경우 배열로 감쌈
            vocabulariesToProcess = [memberVocabularies];
          } else {
            console.warn('⚠️ [Store] 예상하지 못한 데이터 구조:', memberVocabularies);
            vocabulariesToProcess = [];
          }
          
          console.log('📚 [Store] 처리할 단어장 개수:', vocabulariesToProcess.length);
          
          // 모든 단어들을 하나의 배열로 합치기
          const allWords: Word[] = [];
          vocabulariesToProcess.forEach((vocabulary, vocabIndex) => {
            console.log(`📚 [Store] 단어장 ${vocabIndex + 1} 처리:`, vocabulary.id, '단어 개수:', vocabulary.words?.length);
            
            if (vocabulary.words && Array.isArray(vocabulary.words)) {
              vocabulary.words.forEach((memberWord, wordIndex) => {
                const word = convertMemberWordToWord(memberWord, vocabIndex * 1000 + wordIndex);
                allWords.push(word);
              });
            } else {
              console.warn('⚠️ [Store] 단어장에 words 배열이 없습니다:', vocabulary);
            }
          });

          console.log('✅ [Store] 단어장 데이터 로딩 완료:', allWords.length, '개 단어');
          console.log('🔍 [Store] 변환된 첫 번째 단어 샘플:', allWords[0]);
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
