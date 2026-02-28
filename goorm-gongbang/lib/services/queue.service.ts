/* ===========================
   Queue Service
   - 대기열 관련 API 호출
   - Backend: Queue 서비스
=========================== */

import { API_BASE_URL } from "@/lib/api/config";
import type { QueueStatus, QueueStatusResponse } from "@/lib/types";

// Re-export types for convenience
export type { QueueStatus, QueueStatusResponse };

/* ---------------------------
   대기열 진입
--------------------------- */
export async function enterQueue(
  accessToken: string,
  matchId: string | number
): Promise<Response> {
  return fetch(`${API_BASE_URL}/queue/enter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ matchId }),
    credentials: "include",
    cache: "no-store",
  });
}

/* ---------------------------
   대기열 상태 조회
--------------------------- */
export async function getQueueStatus(
  accessToken: string,
  matchId: string | number
): Promise<Response> {
  return fetch(`${API_BASE_URL}/queue/status?matchId=${matchId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
    cache: "no-store",
  });
}

/* ---------------------------
   대기열 이탈
--------------------------- */
export async function leaveQueue(
  accessToken: string,
  matchId: string | number
): Promise<Response> {
  return fetch(`${API_BASE_URL}/queue/leave`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ matchId }),
    credentials: "include",
    cache: "no-store",
  });
}
