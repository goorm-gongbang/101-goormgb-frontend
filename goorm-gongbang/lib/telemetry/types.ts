/**
 * AI Telemetry SDK - Type Definitions
 *
 * FE에서 수집하는 사용자 행동 데이터 타입 정의
 * Stage 전환 시점에 batch로 AI Runtime에 전송
 */

// ============================================================================
// Stage 정의
// ============================================================================

export type TicketingStage =
  | 'LANDING'           // 대기열 진입 전
  | 'QUEUE_WAITING'     // 대기열 대기 중
  | 'SEAT_SELECTION'    // 좌석 선택
  | 'CHECKOUT';         // 결제 진행

// ============================================================================
// 수집 이벤트 타입
// ============================================================================

export interface MouseMoveEvent {
  type: 'mouse_move';
  timestamp: number;
  x: number;
  y: number;
  velocityX?: number;
  velocityY?: number;
}

export interface ClickEvent {
  type: 'click';
  timestamp: number;
  x: number;
  y: number;
  target: string;        // CSS selector
  buttonType: 'left' | 'right' | 'middle';
}

export interface ScrollEvent {
  type: 'scroll';
  timestamp: number;
  scrollX: number;
  scrollY: number;
  deltaX: number;
  deltaY: number;
}

export interface KeystrokeEvent {
  type: 'keystroke';
  timestamp: number;
  keyCode: number;
  targetType: string;    // input, textarea, etc.
  dwellTime?: number;    // 키 누름 지속 시간 (ms)
}

export interface FocusEvent {
  type: 'focus' | 'blur';
  timestamp: number;
  target: string;
}

export interface VisibilityEvent {
  type: 'visibility';
  timestamp: number;
  visible: boolean;
}

export type TelemetryEvent =
  | MouseMoveEvent
  | ClickEvent
  | ScrollEvent
  | KeystrokeEvent
  | FocusEvent
  | VisibilityEvent;

// ============================================================================
// API 요청/응답 DTO
// ============================================================================

/**
 * AI Runtime /ai/telemetry/ingest 요청
 */
export interface TelemetryIngestRequest {
  sid: string;                    // 세션 ID (X-Auth-Sid)
  matchId: string;                // 경기 ID
  stage: TicketingStage;          // 현재 Stage
  events: TelemetryEvent[];       // 수집된 이벤트 배열
  meta: {
    userAgent: string;
    screenWidth: number;
    screenHeight: number;
    timezone: string;
    language: string;
  };
}

export interface TelemetryIngestResponse {
  success: boolean;
  message?: string;
}

/**
 * AI Runtime /ai/precheck 요청/응답
 */
export interface PrecheckRequest {
  sid: string;
  matchId: string;
  cfToken: string;                // Cloudflare Turnstile 토큰
}

export interface PrecheckResponse {
  allowed: boolean;
  reason?: string;
}

/**
 * AI Runtime /ai/challenge/start 요청/응답
 */
export interface ChallengeStartRequest {
  sid: string;
  matchId: string;
  challengeType: 'S3';            // VQA 챌린지 타입
}

export interface ChallengeStartResponse {
  challengeId: string;
  imageUrl: string;               // S3 presigned URL
  question: string;               // VQA 질문
  expiresAt: number;              // 만료 시간 (unix timestamp)
}

/**
 * AI Runtime /ai/challenge/verify 요청/응답
 */
export interface ChallengeVerifyRequest {
  sid: string;
  challengeId: string;
  answer: string;
}

export interface ChallengeVerifyResponse {
  success: boolean;
  message?: string;
}

// ============================================================================
// Collector 설정
// ============================================================================

export interface TelemetryConfig {
  /** 세션 ID */
  sid: string;

  /** 경기 ID */
  matchId: string;

  /** 마우스 이벤트 샘플링 간격 (ms), 기본 50ms */
  mouseSampleInterval?: number;

  /** 최대 버퍼 크기, 기본 1000 */
  maxBufferSize?: number;

  /** AI Runtime base URL */
  aiBaseUrl?: string;

  /** 디버그 모드 */
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
