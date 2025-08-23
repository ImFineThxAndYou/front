import { apiUtils } from '../utils/api';
import { ProfileResponse, FilterRequest } from '../types/explore';

export class ExploreService {
  // 관심사 필터 기반 다른 유저 조회 (필터 없으면 전체 사용자)
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

  // 추천 유저 조회 (AI 기반 관심사 매칭)
  static async getPeers(): Promise<ProfileResponse[]> {
    try {
      // AI 기반 추천 시스템으로 유사한 관심사를 가진 유저 조회
      const response = await apiUtils.fetchWithAuth('/api/tags/recommend?topN=20');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const membernames = await response.json();
      
      // 추천된 membername들로 프로필 정보 조회
      if (membernames && membernames.length > 0) {
        const profiles = await Promise.all(
          membernames.map(async (membername: string) => {
            try {
              const profileResponse = await apiUtils.fetchWithAuth(`/api/members/${membername}`);
              if (profileResponse.ok) {
                return await profileResponse.json();
              }
            } catch (error) {
              console.warn(`❌ 프로필 조회 실패 (membername: ${membername}):`, error);
            }
            return null;
          })
        );
        
        // null 값 제거하고 유효한 프로필만 반환
        return profiles.filter(profile => profile !== null);
      }
      
      return [];
    } catch (error) {
      console.error('❌ 추천 유저 조회 실패:', error);
      return [];
    }
  }
}

export const exploreService = ExploreService;
