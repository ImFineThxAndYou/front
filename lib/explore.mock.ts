
export interface UserProfile {
  id: string;
  nickname: string;
  avatarUrl: string;
  bio: string;
  interests: string[];
  languages: string[];
  region: string;
  isOnline: boolean;
  lastSeen?: Date;
  isPending?: boolean;
}

export interface SearchFilters {
  page?: number;
  search?: string;
  interests?: string[];
  sortBy?: 'relevance' | 'latest' | 'active';
}

// Mock data
const mockUsers: UserProfile[] = [
  {
    id: '1',
    nickname: 'SakuraKim',
    avatarUrl: 'https://readdy.ai/api/search-image?query=Asian%20woman%20smiling%20naturally%20portrait%20photo%20professional%20headshot%20clean%20white%20background&width=400&height=400&seq=profile1&orientation=squarish',
    bio: '안녕하세요! 일본 문화와 언어에 관심이 많습니다. 함께 언어를 배워요!',
    interests: ['travel', 'music', 'movies', 'books'],
    languages: ['Korean', 'Japanese', 'English'],
    region: 'Seoul, Korea',
    isOnline: true
  },
  {
    id: '2',
    nickname: 'TomFromLA',
    avatarUrl: 'https://readdy.ai/api/search-image?query=Caucasian%20man%20friendly%20smile%20casual%20portrait%20photo%20professional%20headshot%20clean%20white%20background&width=400&height=400&seq=profile2&orientation=squarish',
    bio: 'Love Korean culture and K-pop! Looking for language exchange partners to improve my Korean.',
    interests: ['music', 'sports', 'technology', 'gaming'],
    languages: ['English', 'Spanish', 'Korean'],
    region: 'Los Angeles, USA',
    isOnline: false,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: '3',
    nickname: 'MikeMusician',
    avatarUrl: 'https://readdy.ai/api/search-image?query=Young%20man%20with%20guitar%20musician%20portrait%20photo%20professional%20headshot%20clean%20white%20background&width=400&height=400&seq=profile3&orientation=squarish',
    bio: 'Professional musician interested in learning Korean through music and culture exchange.',
    interests: ['music', 'art', 'movies', 'photography'],
    languages: ['English', 'Korean'],
    region: 'London, UK',
    isOnline: true
  },
  {
    id: '4',
    nickname: 'YukiTokyo',
    avatarUrl: 'https://readdy.ai/api/search-image?query=Japanese%20woman%20elegant%20smile%20portrait%20photo%20professional%20headshot%20clean%20white%20background%20modern%20style&width=400&height=400&seq=profile4&orientation=squarish',
    bio: '東京在住です！韓国語を学んでいます。お互いに言語を教え合いましょう！',
    interests: ['cooking', 'travel', 'books', 'photography'],
    languages: ['Japanese', 'English', 'Korean'],
    region: 'Tokyo, Japan',
    isOnline: true
  },
  {
    id: '5',
    nickname: 'ChefEmma',
    avatarUrl: 'https://readdy.ai/api/search-image?query=Woman%20chef%20apron%20smiling%20portrait%20photo%20professional%20headshot%20clean%20white%20background%20culinary&width=400&height=400&seq=profile5&orientation=squarish',
    bio: 'Love cooking traditional dishes from different countries. Let\'s share recipes and language!',
    interests: ['cooking', 'travel', 'nature', 'fitness'],
    languages: ['English', 'Korean', 'French'],
    region: 'Paris, France',
    isOnline: false,
    lastSeen: new Date(Date.now() - 60 * 60 * 1000)
  },
  {
    id: '6',
    nickname: 'GameDevRyan',
    avatarUrl: 'https://readdy.ai/api/search-image?query=Young%20programmer%20developer%20portrait%20photo%20professional%20headshot%20clean%20white%20background%20technology%20modern&width=400&height=400&seq=profile6&orientation=squarish',
    bio: 'Game developer fascinated by Korean gaming culture. Want to practice Korean with native speakers.',
    interests: ['gaming', 'technology', 'art', 'movies'],
    languages: ['English', 'Korean', 'Japanese'],
    region: 'Seattle, USA',
    isOnline: true
  },
  {
    id: '7',
    nickname: 'ArtistLina',
    avatarUrl: 'https://readdy.ai/api/search-image?query=Young%20woman%20artist%20painter%20portrait%20photo%20professional%20headshot%20clean%20white%20background%20creative%20artistic&width=400&height=400&seq=profile7&orientation=squarish',
    bio: 'Visual artist exploring Korean traditional art. Looking for cultural and language exchange.',
    interests: ['art', 'photography', 'travel', 'books'],
    languages: ['German', 'English', 'Korean'],
    region: 'Berlin, Germany',
    isOnline: true
  },
  {
    id: '8',
    nickname: 'FitnessCoachMark',
    avatarUrl: 'https://readdy.ai/api/search-image?query=Fit%20man%20trainer%20portrait%20photo%20professional%20headshot%20clean%20white%20background%20athletic%20sports&width=400&height=400&seq=profile8&orientation=squarish',
    bio: 'Personal trainer interested in Korean fitness culture and healthy lifestyle practices.',
    interests: ['fitness', 'sports', 'nature', 'travel'],
    languages: ['English', 'Korean'],
    region: 'Sydney, Australia',
    isOnline: false,
    lastSeen: new Date(Date.now() - 30 * 60 * 1000)
  },
  // Add more users for pagination testing
  {
    id: '9',
    nickname: 'BookwormSara',
    avatarUrl: 'https://readdy.ai/api/search-image?query=Woman%20reading%20book%20library%20portrait%20photo%20professional%20headshot%20clean%20white%20background%20intellectual&width=400&height=400&seq=profile9&orientation=squarish',
    bio: 'Literature enthusiast exploring Korean poetry and modern novels. Let\'s discuss books!',
    interests: ['books', 'writing', 'movies', 'travel'],
    languages: ['English', 'Korean', 'Italian'],
    region: 'Rome, Italy',
    isOnline: true
  },
  {
    id: '10',
    nickname: 'NatureLoverJun',
    avatarUrl: 'https://readdy.ai/api/search-image?query=Asian%20man%20hiking%20outdoor%20portrait%20photo%20professional%20headshot%20clean%20white%20background%20nature%20lover&width=400&height=400&seq=profile10&orientation=squarish',
    bio: '하이킹과 자연을 사랑합니다. 영어 실력을 늘리고 싶어요!',
    interests: ['nature', 'photography', 'fitness', 'travel'],
    languages: ['Korean', 'English'],
    region: 'Busan, Korea',
    isOnline: false,
    lastSeen: new Date(Date.now() - 45 * 60 * 1000)
  }
];

import { create } from 'zustand';

// Zustand store for explore functionality
interface ExploreStore {
  users: UserProfile[];
  isLoading: boolean;
  searchTerm: string;
  selectedInterests: string[];

  // Actions
  loadUsers: () => Promise<void>;
  searchUsers: (searchTerm: string, interests: string[]) => Promise<void>;
  setSearchTerm: (term: string) => void;
  setSelectedInterests: (interests: string[]) => void;
  sendChatRequest: (userId: string) => Promise<void>;
}

export const useExploreStore = create<ExploreStore>((set, get) => ({
  users: [],
  isLoading: false,
  searchTerm: '',
  selectedInterests: [],

  loadUsers: async () => {
    set({ isLoading: true });
    try {
      const users = await getUsers();
      set({ users, isLoading: false });
    } catch (error) {
      console.error('Failed to load users:', error);
      set({ isLoading: false });
    }
  },

  searchUsers: async (searchTerm: string, interests: string[]) => {
    set({ isLoading: true, searchTerm, selectedInterests: interests });
    try {
      const users = await getUsers({
        search: searchTerm,
        interests: interests.length > 0 ? interests : undefined
      });
      set({ users, isLoading: false });
    } catch (error) {
      console.error('Failed to search users:', error);
      set({ isLoading: false });
    }
  },

  setSearchTerm: (term: string) => {
    set({ searchTerm: term });
  },

  setSelectedInterests: (interests: string[]) => {
    set({ selectedInterests: interests });
  },

  sendChatRequest: async (userId: string) => {
    try {
      await sendChatRequest(userId);
      // Optionally update user state to show request sent
    } catch (error) {
      console.error('Failed to send chat request:', error);
    }
  }
}));

// Main function to get users with filters
export const getUsers = async (filters: SearchFilters = {}): Promise<UserProfile[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  let filteredUsers = [...mockUsers];

  // Apply search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredUsers = filteredUsers.filter(user =>
      user.nickname.toLowerCase().includes(searchTerm) ||
      user.bio.toLowerCase().includes(searchTerm) ||
      user.region.toLowerCase().includes(searchTerm) ||
      user.interests.some(interest => interest.toLowerCase().includes(searchTerm))
    );
  }

  // Apply interest filter
  if (filters.interests && filters.interests.length > 0) {
    filteredUsers = filteredUsers.filter(user =>
      filters.interests!.some(interest => user.interests.includes(interest))
    );
  }

  // Apply sorting
  switch (filters.sortBy) {
    case 'latest':
      filteredUsers.sort(() => Math.random() - 0.5);
      break;
    case 'active':
      filteredUsers.sort((a, b) => {
        if (a.isOnline && !b.isOnline) return -1;
        if (!a.isOnline && b.isOnline) return 1;
        return 0;
      });
      break;
    default: // relevance
      break;
  }

  // Simulate pagination - return 20 items per page
  const page = filters.page || 1;
  const limit = 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  return filteredUsers.slice(startIndex, endIndex);
};

// Function to send chat request
export const sendChatRequest = async (userId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log(`Chat request sent to user ${userId}`);
};

// Legacy exports for compatibility
export interface SearchResult {
  profiles: UserProfile[];
  total: number;
  hasMore: boolean;
}

class ExploreService {
  async searchProfiles(filters: SearchFilters): Promise<SearchResult> {
    const profiles = await getUsers(filters);
    return {
      profiles,
      total: mockUsers.length,
      hasMore: profiles.length === 20
    };
  }

  async sendChatRequest(userId: string): Promise<void> {
    return sendChatRequest(userId);
  }
}

export const exploreService = new ExploreService();
