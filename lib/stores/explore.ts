import { create } from 'zustand';
import { exploreService } from '../services/exploreService';
import { Category, ProfileResponse, FilterRequest, ExploreState } from '../types/explore';

interface ExploreStore extends ExploreState {
  // 액션
  loadPeers: () => Promise<void>;
  loadFilteredUsers: (filterRequest: FilterRequest) => Promise<void>;
  setSelectedCategories: (categories: Category[]) => void;
  toggleCategory: (category: Category) => void;
  setSearchMode: (mode: 'peers' | 'filter') => void;
  clearError: () => void;
  clearProfiles: () => void;
}

export const useExploreStore = create<ExploreStore>((set, get) => ({
  // 초기 상태
  profiles: [],
  isLoading: false,
  error: null,
  selectedCategories: [],
  searchMode: 'peers',

  // 같은 관심사 유저 조회
  loadPeers: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const profiles = await exploreService.getPeers();
      set({ 
        profiles: profiles || [], 
        isLoading: false, 
        searchMode: 'peers',
        selectedCategories: []
      });
    } catch (error) {
      console.error('❌ 같은 관심사 유저 조회 실패:', error);
      set({ 
        profiles: [],
        error: '같은 관심사를 가진 사용자를 불러올 수 없습니다.', 
        isLoading: false 
      });
    }
  },

  // 필터 기반 유저 조회
  loadFilteredUsers: async (filterRequest: FilterRequest) => {
    set({ isLoading: true, error: null });
    
    try {
      const profiles = await exploreService.getFilteredUsers(filterRequest);
      set({ 
        profiles: profiles || [], 
        isLoading: false, 
        searchMode: 'filter',
        selectedCategories: filterRequest.interests
      });
    } catch (error) {
      console.error('❌ 필터 기반 유저 조회 실패:', error);
      set({ 
        profiles: [],
        error: '필터 조건에 맞는 사용자를 불러올 수 없습니다.', 
        isLoading: false 
      });
    }
  },

  // 선택된 카테고리 설정
  setSelectedCategories: (categories: Category[]) => {
    set({ selectedCategories: categories });
  },

  // 카테고리 토글
  toggleCategory: (category: Category) => {
    const { selectedCategories } = get();
    const isSelected = selectedCategories.includes(category);
    
    if (isSelected) {
      set({ 
        selectedCategories: selectedCategories.filter(c => c !== category) 
      });
    } else {
      set({ 
        selectedCategories: [...selectedCategories, category] 
      });
    }
  },

  // 검색 모드 설정
  setSearchMode: (mode: 'peers' | 'filter') => {
    set({ searchMode: mode });
  },

  // 오류 초기화
  clearError: () => {
    set({ error: null });
  },

  // 프로필 목록 초기화
  clearProfiles: () => {
    set({ profiles: [] });
  }
}));
