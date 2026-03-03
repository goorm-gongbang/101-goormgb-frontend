/* ===========================
   Order-Core Service
   - 경기, 구단, 온보딩 선호도 API 호출
   - Backend: Order-Core 서비스
   - TODO: 나중에 백엔드에서 permitAll 설정하면 auth → pub 사용
=========================== */

import { API_BASE_URL } from "@/lib/api/config";
import { auth } from "@/lib/api/fetch";
import type {
  Club,
  Stadium,
  SaleStatus,
  Match,
  MatchesData,
  MatchDetail,
  ClubsData,
  OnboardingStatusResponse,
  OnboardingPreferencesRequest,
} from "@/lib/types";

// Re-export types for convenience
export type {
  Club,
  Stadium,
  SaleStatus,
  Match,
  MatchesData,
  MatchDetail,
  ClubsData,
  OnboardingStatusResponse,
  OnboardingPreferencesRequest,
};

/* 경기 목록 조회 */
export const getMatches = (date?: string) => {
  const params = date ? `?date=${date}` : "";
  return auth.get<MatchesData>(`${API_BASE_URL}/order/matches${params}`);
};

/* 경기 상세 조회 */
export const getMatchById = (matchId: string | number) =>
  auth.get<MatchDetail>(`${API_BASE_URL}/order/matches/${matchId}`);

/* 구단 목록 조회 */
export const getClubs = () =>
  auth.get<ClubsData>(`${API_BASE_URL}/order/clubs`);

/* 온보딩 선호도 조회 */
export const getOnboardingStatus = () =>
  auth.get<{ onboardingStatus: boolean }>(`${API_BASE_URL}/order/onboarding/preferences`);

/* 온보딩 선호도 저장 */
export const saveOnboardingPreferences = (body: OnboardingPreferencesRequest) =>
  auth.post<void, OnboardingPreferencesRequest>(`${API_BASE_URL}/order/onboarding/preferences`, body);
