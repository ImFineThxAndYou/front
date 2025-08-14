import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

// Mock data for development
const mockWords: Word[] = [
  {
    id: '1',
    word: 'apple',
    meanings: ['사과'],
    partOfSpeech: 'noun',
    difficulty: 1,
    examples: ['I eat an apple every day.'],
    tags: ['fruit', 'food'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    word: 'beautiful',
    meanings: ['아름다운', '예쁜'],
    partOfSpeech: 'adjective',
    difficulty: 2,
    examples: ['She is a beautiful person.'],
    tags: ['appearance', 'positive'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    word: 'run',
    meanings: ['달리다', '운영하다'],
    partOfSpeech: 'verb',
    difficulty: 1,
    examples: ['I run every morning.', 'He runs a business.'],
    tags: ['movement', 'action'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    word: 'quickly',
    meanings: ['빠르게'],
    partOfSpeech: 'adverb',
    difficulty: 2,
    examples: ['He quickly finished his homework.'],
    tags: ['speed', 'manner'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    word: 'knowledge',
    meanings: ['지식', '학식'],
    partOfSpeech: 'noun',
    difficulty: 3,
    examples: ['Knowledge is power.'],
    tags: ['education', 'intelligence'],
    createdAt: new Date().toISOString(),
  }
];

export const useWordbookStore = create<WordbookState>()(
  persist(
    (set, get) => ({
      words: mockWords,
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
