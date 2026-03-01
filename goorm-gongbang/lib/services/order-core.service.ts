/* ===========================
   Order-Core Service
   - 경기, 구단, 온보딩 선호도 API 호출
   - Backend: Order-Core 서비스
   - TODO: 나중에 백엔드에서 permitAll 설정하면 authFetch 대신 일반 fetch 사용
=========================== */

import { API_BASE_URL, authFetch } from "@/lib/api/config";
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

/* ---------------------------
   경기 목록 조회
--------------------------- */
export async function getMatches(date?: string): Promise<Response> {
  const params = date ? `?date=${date}` : "";
  return authFetch(`${API_BASE_URL}/order/matches${params}`, {
    method: "GET",
    cache: "no-store",
  });
}

/* ---------------------------
   경기 상세 조회
--------------------------- */
export async function getMatchById(matchId: string | number): Promise<Response> {
  return authFetch(`${API_BASE_URL}/order/matches/${matchId}`, {
    method: "GET",
    cache: "no-store",
  });
}

/* ---------------------------
   구단 목록 조회
--------------------------- */
export async function getClubs(): Promise<Response> {
  return authFetch(`${API_BASE_URL}/order/clubs`, {
    method: "GET",
    cache: "no-store",
  });
}

/* ---------------------------
   온보딩 선호도 조회 (상태 확인용)
--------------------------- */
export async function getOnboardingStatus(): Promise<Response> {
  return authFetch(`${API_BASE_URL}/order/onboarding/preferences`, {
    method: "GET",
    cache: "no-store",
  });
}

/* ---------------------------
   온보딩 선호도 저장
--------------------------- */
export async function saveOnboardingPreferences(
  body: OnboardingPreferencesRequest
): Promise<Response> {
  return authFetch(`${API_BASE_URL}/order/onboarding/preferences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}
