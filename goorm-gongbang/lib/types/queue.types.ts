/**
 * Queue Service Types
 * 대기열 관련 타입 정의
 */

/** 대기열 상태값 */
export type QueueStatusType = "WAITING" | "READY" | "EXPIRED" | "ENTERED";

/** 대기열 진입 응답 */
export type QueueEnterResponse = {
  status?: QueueStatusType;
  rank?: number;
  totalWaitingCount?: number;
};

/** 대기열 상태 조회 응답 */
export type QueueStatusResponse = {
  status?: QueueStatusType;
  rank?: number;
  totalWaitingCount?: number;
  admissionToken?: string;
  expiresIn?: number;
  pollingMs?: number;
};
