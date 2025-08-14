import { apiUtils } from '../utils/api';
import { ProfileResponse, FilterRequest } from '../types/explore';

export class ExploreService {
  // 같은 관심사를 가진 다른 유저 조회
  static async getPeers(): Promise<ProfileResponse[]> {
    try {
      const response = await apiUtils.fetchWithAuth('/api/members/search/peers');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ 같은 관심사 유저 조회 실패:', error);
      return [];
    }
  }

  // 관심사 필터 기반 다른 유저 조회
  static async getFilteredUsers(filterRequest: FilterRequest): Promise<ProfileResponse[]> {
    try {
      const response = await apiUtils.fetchWithAuth('/api/members/search/filter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filterRequest),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ 필터 기반 유저 조회 실패:', error);
      return [];
    }
  }
}

export const exploreService = ExploreService;
