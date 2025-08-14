export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    membername?: string;
    isProfileComplete: boolean;
  };
}

export interface OAuthRedirectResponse {
  redirectUrl: string;
}

export interface MembernameRequest {
  membername: string;
}

export interface ProfileCreateRequest {
  nickname: string;
  statusMessage?: string;
  avatarUrl?: string;
  interests?: Interest[];
  birthDate?: string;
  country?: string;
  region?: string;
  language: string;
  timezone?: string;
}

export type Interest = 'SPORTS' | 'MUSIC' | 'MOVIE' | 'GAME' | 'IT';

export interface User {
  id: string;
  email: string;
  membername?: string;
  nickname?: string;
  isProfileComplete: boolean;
  provider?: string;
}
