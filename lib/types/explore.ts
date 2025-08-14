export enum Category {
  LANGUAGE_LEARNING = 'LANGUAGE_LEARNING',
  TRAVEL = 'TRAVEL',
  CULTURE = 'CULTURE',
  BUSINESS = 'BUSINESS',
  EDUCATION = 'EDUCATION',
  TECHNOLOGY = 'TECHNOLOGY',
  SPORTS = 'SPORTS',
  MUSIC = 'MUSIC',
  FOOD = 'FOOD',
  ART = 'ART',
  SCIENCE = 'SCIENCE',
  HISTORY = 'HISTORY',
  MOVIES = 'MOVIES',
  GAMES = 'GAMES',
  LITERATURE = 'LITERATURE',
  PHOTOGRAPHY = 'PHOTOGRAPHY',
  NATURE = 'NATURE',
  FITNESS = 'FITNESS',
  FASHION = 'FASHION',
  VOLUNTEERING = 'VOLUNTEERING',
  ANIMALS = 'ANIMALS',
  CARS = 'CARS',
  DIY = 'DIY',
  FINANCE = 'FINANCE'
}

export interface ProfileResponse {
  membername: string;
  nickname: string;
  avatarUrl: string;
  bio: string;
  interests: Category[];
  completed: boolean;
  language: string;
  timezone: string;
  birthDate: string;
  age: number;
  country: string;
  region: string;
}

export interface FilterRequest {
  interests: Category[];
}

export interface ExploreState {
  profiles: ProfileResponse[];
  isLoading: boolean;
  error: string | null;
  selectedCategories: Category[];
  searchMode: 'peers' | 'filter';
}
