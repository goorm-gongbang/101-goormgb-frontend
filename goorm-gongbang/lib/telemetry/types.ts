/**
 * AI Telemetry SDK - Type Definitions
 *
 * FE는 raw pointer 이벤트를 수집하고, AI Runtime이 summary를 계산한다.
 */

// ============================================================================
// Stage 정의
// ============================================================================

export type TicketingStage =
  | 'QUEUE_ENTER_PRECLICK'
  | 'SEAT_STAGE'
  | 'VQA_CHALLENGE';

// ============================================================================
// 수집 이벤트 타입
// ============================================================================

export type TelemetryEventType = 'mousemove' | 'mousedown' | 'mouseup' | 'click';

export interface TelemetryEvent {
  type: TelemetryEventType;
  tsMs: number;
  xNorm: number;
  yNorm: number;
  button?: number;
}

// ============================================================================
// API 요청/응답 DTO
// ============================================================================

export interface TelemetryIngestRequest {
  matchId: number;
  stage: TicketingStage;
  events: TelemetryEvent[];
}

export interface TelemetryIngestResponse {
  accepted: boolean;
}

export interface PrecheckRequest {
  matchId: number;
  cfToken: string;
}

export interface PrecheckResponse {
  allowed: boolean;
}

export interface ChallengeStartRequest {
  matchId: number;
}

export interface ChallengeStartResponse {
  challengeId: string;
  remainingAttempts: number;
  expiresAtMs: number;
}

export interface ChallengeVerifyRequest {
  matchId: number;
  challengeId: string;
  caught: boolean;
  catchTsMs: number;
  catchXNorm: number;
  catchYNorm: number;
}

export type ChallengeVerifyInput = Omit<ChallengeVerifyRequest, 'matchId'>;

export interface ChallengeVerifyResponse {
  success: boolean;
  remainingAttempts: number;
  reason?:
    | 'challenge_fail'
    | 'max_attempts'
    | 'abnormal_pattern'
    | 'invalid_challenge'
    | 'expired_challenge';
  terminal?: boolean;
  riskScore?: number;
}

// ============================================================================
// Collector 설정
// ============================================================================

export interface TelemetryConfig {
  matchId: number;
  mouseSampleInterval?: number;
  maxBufferSize?: number;
  aiBaseUrl?: string;
  debug?: boolean;
}

// ============================================================================
// ext_authz 응답 처리
// ============================================================================

export type AuthzAction = 'NONE' | 'THROTTLE' | 'REQUIRE_S3' | 'BLOCK';

export interface AuthzErrorResponse {
  action: AuthzAction;
  reasonCode?: string;
  message?: string;
}
