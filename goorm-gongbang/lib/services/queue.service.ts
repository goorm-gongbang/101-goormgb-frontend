/* ===========================
   Queue Service
   - 대기열 관련 API 호출
   - Backend: Queue 서비스
=========================== */

import { API_BASE_URL } from "@/lib/api/config";
import { auth } from "@/lib/api/fetch";
import { flushTelemetryBeforeProtectedRequest } from "@/lib/telemetry/runtime";
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
export const enterQueue = async (matchId: string | number) => {
  // AI telemetry 연동: ext_authz가 queue enter를 평가하기 전에
  // 현재 stage raw batch를 먼저 AI 서버에 반영한다.
  await flushTelemetryBeforeProtectedRequest();

  return auth.post<QueueEnterResponse>(
    `${API_BASE_URL}/queue/matches/${matchId}/enter`,
  );
};

/* 대기열 상태 조회 */
export const getQueueStatus = (matchId: string | number) =>
  auth.get<QueueStatusResponse>(
    `${API_BASE_URL}/queue/matches/${matchId}/status`,
  );
