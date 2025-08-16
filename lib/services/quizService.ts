import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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
    const token = localStorage.getItem('accessToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // 전체 랜덤 퀴즈 시작
  async startRandomQuiz(level?: QuizLevel): Promise<QuizStartResponse> {
    const params = level ? { level } : {};
    const response = await axios.post(
      `${API_BASE}/api/quiz/random/start`,
      {},
      {
        headers: this.getAuthHeaders(),
        params
      }
    );
    return response.data;
  }

  // 데일리 퀴즈 시작
  async startDailyQuiz(date: string): Promise<QuizStartResponse> {
    const response = await axios.post(
      `${API_BASE}/api/quiz/daily/start`,
      {},
      {
        headers: this.getAuthHeaders(),
        params: { date }
      }
    );
    return response.data;
  }

  // 퀴즈 제출
  async submitQuiz(quizUUID: string, selectedIndexes: number[]): Promise<SubmitResponse> {
    const response = await axios.post(
      `${API_BASE}/api/quiz/${quizUUID}/submit`,
      { selectedIndexes },
      {
        headers: this.getAuthHeaders()
      }
    );
    return response.data;
  }

  // 퀴즈 단건 조회 (재시험용)
  async getQuiz(quizUUID: string): Promise<QuizResult> {
    const response = await axios.get(
      `${API_BASE}/api/quiz/${quizUUID}`,
      {
        headers: this.getAuthHeaders()
      }
    );
    return response.data;
  }

  // 내 퀴즈 목록 조회
  async getMyQuizzes(
    page: number = 0,
    size: number = 20,
    status?: QuizStatus
  ): Promise<QuizListResponse> {
    const params: any = { page, size };
    if (status) params.status = status;

    const response = await axios.get(
      `${API_BASE}/api/quiz/me`,
      {
        headers: this.getAuthHeaders(),
        params
      }
    );
    return response.data;
  }
}

export const quizService = new QuizService();
