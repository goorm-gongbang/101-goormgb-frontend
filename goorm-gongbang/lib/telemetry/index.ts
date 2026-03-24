/**
 * AI Telemetry SDK
 *
 * 사용법:
 * ```tsx
 * import { useTelemetry } from '@/lib/telemetry';
 *
 * function TicketingPage({ matchId }: { matchId: string }) {
 *   const telemetry = useTelemetry({ matchId });
 *
 *   // Stage 변경 시 자동으로 telemetry 전송
 *   useEffect(() => {
 *     telemetry.setStage('SEAT_SELECTION');
 *   }, []);
 *
 *   return <div>...</div>;
 * }
 * ```
 */

export * from './types';
export * from './collector';
export * from './api';

import { useEffect, useRef, useCallback } from 'react';
import { TelemetryCollector } from './collector';
import { AITelemetryApi, AIApiError } from './api';
import type {
  TelemetryConfig,
  TicketingStage,
  TelemetryEvent,
  ChallengeStartResponse,
  ChallengeVerifyResponse,
} from './types';

// ============================================================================
// React Hook
// ============================================================================

export interface UseTelemetryOptions {
  /** 경기 ID */
  matchId: string;

  /** 세션 ID (없으면 쿠키에서 읽음) */
  sid?: string;

  /** AI API base URL (기본: /ai) */
  aiBaseUrl?: string;

  /** 디버그 모드 */
  debug?: boolean;

  /** 수집 자동 시작 여부 (기본: true) */
  autoStart?: boolean;
}

export interface TelemetryInstance {
  /** 현재 Stage */
  stage: TicketingStage;

  /** Stage 변경 (telemetry 자동 전송) */
  setStage: (stage: TicketingStage) => Promise<void>;

  /** 수동 flush (API 호출 없이 버퍼 반환) */
  flush: () => TelemetryEvent[];

  /** 수집 시작 */
  start: () => void;

  /** 수집 중지 */
  stop: () => void;

  /** Precheck (Turnstile 검증) */
  precheck: (cfToken: string) => Promise<boolean>;

  /** VQA 챌린지 시작 */
  startChallenge: () => Promise<ChallengeStartResponse>;

  /** VQA 챌린지 답변 제출 */
  verifyChallenge: (challengeId: string, answer: string) => Promise<ChallengeVerifyResponse>;
}

/**
 * Telemetry React Hook
 *
 * Stage 전환 시 자동으로 수집된 이벤트를 AI Runtime에 전송
 */
export function useTelemetry(options: UseTelemetryOptions): TelemetryInstance {
  const { matchId, aiBaseUrl = '/ai', debug = false, autoStart = true } = options;

  // 세션 ID 가져오기
  const sid = options.sid ?? getSessionId();

  // Collector와 API 인스턴스
  const collectorRef = useRef<TelemetryCollector | null>(null);
  const apiRef = useRef<AITelemetryApi | null>(null);

  // 초기화
  useEffect(() => {
    const config: TelemetryConfig = {
      sid,
      matchId,
      aiBaseUrl,
      debug,
    };

    collectorRef.current = new TelemetryCollector(config);
    apiRef.current = new AITelemetryApi({ baseUrl: aiBaseUrl });

    if (autoStart) {
      collectorRef.current.start();
    }

    // Cleanup
    return () => {
      collectorRef.current?.stop();
    };
  }, [sid, matchId, aiBaseUrl, debug, autoStart]);

  // Stage 변경 및 telemetry 전송
  const setStage = useCallback(async (stage: TicketingStage): Promise<void> => {
    const collector = collectorRef.current;
    const api = apiRef.current;

    if (!collector || !api) {
      console.warn('[Telemetry] Not initialized');
      return;
    }

    // Stage 변경 및 버퍼 flush
    const events = collector.setStage(stage);

    // 이벤트가 있으면 전송
    if (events.length > 0) {
      try {
        await api.sendTelemetry(sid, matchId, stage, events);
        if (debug) {
          console.log(`[Telemetry] Sent ${events.length} events for stage ${stage}`);
        }
      } catch (error) {
        console.error('[Telemetry] Failed to send telemetry:', error);
        // 실패해도 계속 진행 (fail-open)
      }
    }
  }, [sid, matchId, debug]);

  // 수동 flush
  const flush = useCallback((): TelemetryEvent[] => {
    return collectorRef.current?.flush() ?? [];
  }, []);

  // 수집 시작/중지
  const start = useCallback(() => {
    collectorRef.current?.start();
  }, []);

  const stop = useCallback(() => {
    collectorRef.current?.stop();
  }, []);

  // Precheck
  const precheck = useCallback(async (cfToken: string): Promise<boolean> => {
    const api = apiRef.current;
    if (!api) return false;

    try {
      const result = await api.precheck(sid, matchId, cfToken);
      return result.allowed;
    } catch (error) {
      console.error('[Telemetry] Precheck failed:', error);
      return true; // fail-open
    }
  }, [sid, matchId]);

  // VQA 챌린지
  const startChallenge = useCallback(async (): Promise<ChallengeStartResponse> => {
    const api = apiRef.current;
    if (!api) {
      throw new AIApiError('Not initialized', 0);
    }
    return api.startChallenge(sid, matchId);
  }, [sid, matchId]);

  const verifyChallenge = useCallback(
    async (challengeId: string, answer: string): Promise<ChallengeVerifyResponse> => {
      const api = apiRef.current;
      if (!api) {
        throw new AIApiError('Not initialized', 0);
      }
      return api.verifyChallenge(sid, challengeId, answer);
    },
    [sid]
  );

  return {
    stage: collectorRef.current?.getStage() ?? 'LANDING',
    setStage,
    flush,
    start,
    stop,
    precheck,
    startChallenge,
    verifyChallenge,
  };
}

// ============================================================================
// 유틸리티
// ============================================================================

/**
 * 쿠키에서 세션 ID 가져오기
 */
function getSessionId(): string {
  if (typeof document === 'undefined') {
    return '';
  }

  // X-Auth-Sid 헤더로 전송되는 세션 ID
  // 쿠키 우선순위: sid > session_id > SESSIONID
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return cookies['sid'] || cookies['session_id'] || cookies['SESSIONID'] || '';
}

/**
 * ext_authz 에러 핸들러
 *
 * API 호출 시 428 (REQUIRE_S3) 응답 처리
 */
export function handleAuthzError(error: unknown): {
  isChallenge: boolean;
  isBlocked: boolean;
  error: AIApiError | null;
} {
  if (error instanceof AIApiError) {
    return {
      isChallenge: error.isChallenceRequired(),
      isBlocked: error.isBlocked(),
      error,
    };
  }

  return {
    isChallenge: false,
    isBlocked: false,
    error: null,
  };
}
