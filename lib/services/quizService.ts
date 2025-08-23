import axios from 'axios';
import { authService } from './auth';

// 환경별 API 베이스 URL 설정
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // 클라이언트 사이드
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  }
  // 서버 사이드
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
};

const API_BASE = getApiBaseUrl();

// 퀴즈 타입 정의
export type QuizLevel = 'A' | 'B' | 'C';
export type QuizType = 'RANDOM' | 'DAILY';
export type QuizStatus = 'PENDING' | 'SUBMIT';

// API 응답 타입들
export interface QuizQuestion {
  question: string;     // 단어
  choices: string[];    // 4개 선택지
  questionNo: number;   // 문항 번호 (1-based)
}

export interface QuizStartResponse {
  quizResultId: number;
  quizUUID: string;
  quizQuestions: QuizQuestion[];
}

export interface QuizWord {
  questionNo: number;
  word: string;
  meaning: string;
  choice1: string;
  choice2: string;
  choice3: string;
  choice4: string;
  correctAnswer: number;    // 정답 번호 (1-4)
  userAnswer: number | null; // 사용자 선택 (1-4 또는 null)
  isCorrect: boolean | null;
  level: string;
  pos: string;
}

export interface QuizResult {
  quizResultId: number;
  quizUUID: string;
  quizType: QuizType;
  status: QuizStatus;
  dailyDate?: string;      // DAILY 퀴즈인 경우 날짜 (YYYY-MM-DD)
  createdAt: string;
  totalQuestions: number;
  correctCount: number;
  score: number;
  accuracy: number;
  words: QuizWord[];
}

export interface SubmitRequest {
  selectedIndexes: number[]; // 0-3 (선택한 보기), -1 (미선택)
}

export interface SubmitResponse {
  quizUUID: string;
  correctCount: number;
  totalQuestions: number;
  score: number;
}

export interface QuizListResponse {
  content: QuizResult[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

class QuizService {
  private getAuthHeaders() {
    if (typeof window === 'undefined') {
      return {
        'Content-Type': 'application/json',
      };
    }
    
    const token = authService.getAccessToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  private async makeRequest<T>(config: any): Promise<T> {
    try {
      const response = await axios(config);
      return response.data;
    } catch (error: any) {
      console.error('QuizService API Error:', error);
      if (error.response?.status === 401) {
        // 인증 오류 처리
        authService.logout();
        window.location.href = '/';
      }
      throw error;
    }
  }

  // 전체 랜덤 퀴즈 시작
  async startRandomQuiz(level?: QuizLevel): Promise<QuizStartResponse> {
    const params = level ? { level } : {};
    return this.makeRequest<QuizStartResponse>({
      method: 'POST',
      url: `${API_BASE}/api/quiz/random/start`,
      headers: this.getAuthHeaders(),
      params
    });
  }

  // 데일리 퀴즈 시작
  async startDailyQuiz(date: string): Promise<QuizStartResponse> {
    return this.makeRequest<QuizStartResponse>({
      method: 'POST',
      url: `${API_BASE}/api/quiz/daily/start`,
      headers: this.getAuthHeaders(),
      params: { date }
    });
  }

  // 퀴즈 제출
  async submitQuiz(quizUUID: string, selectedIndexes: number[]): Promise<SubmitResponse> {
    return this.makeRequest<SubmitResponse>({
      method: 'POST',
      url: `${API_BASE}/api/quiz/${quizUUID}/submit`,
      headers: this.getAuthHeaders(),
      data: { selectedIndexes }
    });
  }

  // 퀴즈 단건 조회 (재시험용)
  async getQuiz(quizUUID: string): Promise<QuizResult> {
    return this.makeRequest<QuizResult>({
      method: 'GET',
      url: `${API_BASE}/api/quiz/${quizUUID}`,
      headers: this.getAuthHeaders()
    });
  }

  // 내 퀴즈 목록 조회
  async getMyQuizzes(
    page: number = 0,
    size: number = 20,
    status?: QuizStatus
  ): Promise<QuizListResponse> {
    const params: any = { page, size };
    if (status) params.status = status;

    return this.makeRequest<QuizListResponse>({
      method: 'GET',
      url: `${API_BASE}/api/quiz/me`,
      headers: this.getAuthHeaders(),
      params
    });
  }
}

export const quizService = new QuizService();

