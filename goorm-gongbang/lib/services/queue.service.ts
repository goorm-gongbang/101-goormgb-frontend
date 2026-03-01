/* ===========================
   Queue Service
   - 대기열 관련 API 호출
   - Backend: Queue 서비스
=========================== */

import { API_BASE_URL } from "@/lib/api/config";
import { auth } from "@/lib/api/fetch";
import type { QueueStatus, QueueStatusResponse } from "@/lib/types";

// Re-export types for convenience
export type { QueueStatus, QueueStatusResponse };

/* 대기열 진입 */
export const enterQueue = (matchId: string | number) =>
  auth.post<QueueStatusResponse>(`${API_BASE_URL}/queue/enter`, { matchId });

/* 대기열 상태 조회 */
export const getQueueStatus = (matchId: string | number) =>
  auth.get<QueueStatusResponse>(`${API_BASE_URL}/queue/status?matchId=${matchId}`);

/* 대기열 이탈 */
export const leaveQueue = (matchId: string | number) =>
  auth.post<void>(`${API_BASE_URL}/queue/leave`, { matchId });
