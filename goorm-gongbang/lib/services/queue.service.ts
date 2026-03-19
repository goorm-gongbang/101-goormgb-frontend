/* ===========================
   Queue Service
   - 대기열 관련 API 호출
   - Backend: Queue 서비스
=========================== */

import { API_BASE_URL } from "@/lib/api/config";
import { auth } from "@/lib/api/fetch";
import type {
  QueueEnterResponse,
  QueueStatusResponse,
  QueueStatusType,
} from "@/lib/types";

// Re-export types for convenience
export type {
  QueueEnterResponse,
  QueueStatusResponse,
  QueueStatusType,
};

/* 대기열 진입 */
export const enterQueue = (matchId: string | number) =>
  auth.post<QueueEnterResponse>(
    `${API_BASE_URL}/queue/matches/${matchId}/enter`,
  );

/* 대기열 상태 조회 */
export const getQueueStatus = (matchId: string | number) =>
  auth.get<QueueStatusResponse>(
    `${API_BASE_URL}/queue/matches/${matchId}/status`,
  );
