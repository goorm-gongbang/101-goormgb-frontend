/* ===========================
   Order-Core Service
   - 경기, 구단, 온보딩 선호도 API 호출
   - Backend: Order-Core 서비스
=========================== */

import { API_BASE_URL } from "@/lib/api/config";
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
  return fetch(`${API_BASE_URL}/order/matches${params}`, {
    method: "GET",
    cache: "no-store",
  });
}

/* ---------------------------
   경기 상세 조회
--------------------------- */
export async function getMatchById(matchId: string | number): Promise<Response> {
  return fetch(`${API_BASE_URL}/order/matches/${matchId}`, {
    method: "GET",
    cache: "no-store",
  });
}

/* ---------------------------
   구단 목록 조회
--------------------------- */
export async function getClubs(): Promise<Response> {
  return fetch(`${API_BASE_URL}/order/clubs`, {
    method: "GET",
    cache: "no-store",
  });
}

/* ---------------------------
   온보딩 선호도 조회 (상태 확인용)
--------------------------- */
export async function getOnboardingStatus(accessToken: string): Promise<Response> {
  return fetch(`${API_BASE_URL}/order/onboarding/preferences`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
    cache: "no-store",
  });
}

/* ---------------------------
   온보딩 선호도 저장
--------------------------- */
export async function saveOnboardingPreferences(
  accessToken: string,
  body: OnboardingPreferencesRequest
): Promise<Response> {
  return fetch(`${API_BASE_URL}/order/onboarding/preferences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
    credentials: "include",
    cache: "no-store",
  });
}
