/**
 * Queue Service Types
 * 대기열 관련 타입 정의
 */

/** 대기열 상태 */
export type QueueStatus = {
  position: number;
  estimatedWaitTime: number;
  totalInQueue: number;
};

/** 대기열 상태 응답 */
export type QueueStatusResponse = {
  code: string;
  message: string;
  data: QueueStatus;
};

/** 대기열 입장 요청 */
export type QueueEnterRequest = {
  matchId: number;
  userId: string;
};

/** 대기열 입장 응답 */
export type QueueEnterResponse = {
  code: string;
  message: string;
  data: {
    queueToken: string;
    position: number;
  };
};

/** 대기열 토큰 검증 응답 */
export type QueueValidateResponse = {
  code: string;
  message: string;
  data: {
    isValid: boolean;
    canProceed: boolean;
  };
};
