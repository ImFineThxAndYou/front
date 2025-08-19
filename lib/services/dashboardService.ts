import { apiUtils } from '../utils/api';

export interface DashboardSummary {
  totalWords: number;
  learningStreakDays: number;
  reviewNeededDays: number;
  encouragementMessage: string;
  scoreSeries: ScorePoint[];
  wrongAnswerNotes: WrongAnswerNote[];
}

export interface ScorePoint {
  quizUuid: string;
  submittedAtUtc: string;
  score: number;
}

export interface WrongAnswerNote {
  id: string;
  word: string;
  meaning: string;
  createdAt: string;
}

export interface LearningGrass {
  [date: string]: number; // "YYYY-MM-DD": count
}

class DashboardService {
  /**
   * 대시보드 요약 정보 조회
   */
  async getDashboardSummary(timezone: string = 'Asia/Seoul', period: string = 'week'): Promise<DashboardSummary> {
    try {
      const response = await apiUtils.fetchWithAuth(`/api/dashboard?timezone=${timezone}&period=${period}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ 대시보드 요약 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 단어 개수 조회
   */
  async getWordCount(lang?: string, pos?: string, period: string = 'week'): Promise<number> {
    try {
      const params = new URLSearchParams();
      if (lang) params.append('lang', lang);
      if (pos) params.append('pos', pos);
      params.append('period', period);
      
      const response = await apiUtils.fetchWithAuth(`/api/dashboard/words/count?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ 단어 개수 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 연속 학습일 조회
   */
  async getLearningStreak(timezone: string = 'Asia/Seoul', period: string = 'week'): Promise<number> {
    try {
      const response = await apiUtils.fetchWithAuth(`/api/dashboard/learning-streak?timezone=${timezone}&period=${period}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ 연속 학습일 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 학습 잔디 데이터 조회 (전체)
   */
  async getLearningGrass(year: number = new Date().getFullYear(), timezone: string = 'Asia/Seoul', period: string = 'week'): Promise<LearningGrass> {
    try {
      const response = await apiUtils.fetchWithAuth(`/api/dashboard/learning-grass?year=${year}&timezone=${timezone}&period=${period}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ 학습 잔디 데이터 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 단어장 잔디 데이터 조회
   */
  async getVocabularyGrass(year: number = new Date().getFullYear(), timezone: string = 'Asia/Seoul', period: string = 'week'): Promise<LearningGrass> {
    try {
      const response = await apiUtils.fetchWithAuth(`/api/dashboard/vocabulary-grass?year=${year}&timezone=${timezone}&period=${period}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ 단어장 잔디 데이터 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 퀴즈 잔디 데이터 조회
   */
  async getQuizGrass(year: number = new Date().getFullYear(), timezone: string = 'Asia/Seoul', period: string = 'week'): Promise<LearningGrass> {
    try {
      const response = await apiUtils.fetchWithAuth(`/api/dashboard/quiz-grass?year=${year}&timezone=${timezone}&period=${period}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ 퀴즈 잔디 데이터 조회 실패:', error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();
