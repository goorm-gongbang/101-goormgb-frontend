/* ===========================
   Recommendation Service
   - 추천 관련 API 호출
   - Backend: Recommendation 서비스
=========================== */

import { API_BASE_URL } from "@/lib/api/config";
import type { RecommendedMatch, RecommendationsResponse } from "@/lib/types";

// Re-export types for convenience
export type { RecommendedMatch, RecommendationsResponse };

/* ---------------------------
   추천 경기 조회
--------------------------- */
export async function getRecommendedMatches(accessToken: string): Promise<Response> {
  return fetch(`${API_BASE_URL}/recommendations/matches`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
    cache: "no-store",
  });
}
