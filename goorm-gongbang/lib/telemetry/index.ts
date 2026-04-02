/**
 * AI Telemetry SDK
 *
 * 사용법:
 * ```tsx
 * import { useTelemetry } from '@/lib/telemetry';
 *
 * function TicketingPage({ matchId }: { matchId: number }) {
 *   const telemetry = useTelemetry({ matchId });
 *
 *   // 페이지 진입 시 현재 stage 갱신
 *   useEffect(() => {
 *     telemetry.setStage('SEAT_STAGE');
 *   }, []);
 *
 *   // 보호 API 호출 직전 현재 stage 기준으로 batch 전송
 *   await telemetry.flushCurrentStageAndSend();
 *
 *   return <div>...</div>;
 * }
 * ```
 */

export * from './types';
export * from './collector';
export * from './api';
export * from './runtime';

import { useEffect, useRef, useCallback, useState } from 'react';
import { TelemetryCollector } from './collector';
import { AITelemetryApi, AIApiError } from './api';
import { registerTelemetryRuntime, unregisterTelemetryRuntime } from './runtime';
import type {
  TelemetryConfig,
  TicketingStage,
  TelemetryEvent,
  ChallengeStartResponse,
  ChallengeVerifyInput,
  ChallengeVerifyRequest,
  ChallengeVerifyResponse,
} from './types';

// ============================================================================
// React Hook
// ============================================================================

export interface UseTelemetryOptions {
  /** 경기 ID */
  matchId: number;

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

  /** Stage 변경 */
  setStage: (stage: TicketingStage) => void;

  /** 수동 flush (API 호출 없이 버퍼 반환) */
  flush: () => TelemetryEvent[];

  /** 현재 Stage 기준으로 telemetry 전송 */
  flushCurrentStageAndSend: () => Promise<number>;

  /** 수집 시작 */
  start: () => void;

  /** 수집 중지 */
  stop: () => void;

  /** Precheck (Turnstile 검증) */
  precheck: (cfToken: string) => Promise<boolean>;

  /** VQA 챌린지 시작 */
  startChallenge: () => Promise<ChallengeStartResponse>;

  /** VQA 챌린지 답변 제출 */
  verifyChallenge: (request: ChallengeVerifyInput) => Promise<ChallengeVerifyResponse>;
}

/**
 * Telemetry React Hook
 *
 * 사용자 행동을 수집하고, 필요한 시점에 현재 Stage 기준으로 AI Runtime에 전송
 */
export function useTelemetry(options: UseTelemetryOptions): TelemetryInstance {
  const { matchId, aiBaseUrl = '/ai', debug = false, autoStart = true } = options;
  const [stage, setStageState] = useState<TicketingStage>('QUEUE_ENTER_PRECLICK');
  const previousStageRef = useRef<TicketingStage>('QUEUE_ENTER_PRECLICK');

  // Collector와 API 인스턴스
  const collectorRef = useRef<TelemetryCollector | null>(null);
  const apiRef = useRef<AITelemetryApi | null>(null);

  // 초기화
  useEffect(() => {
    const config: TelemetryConfig = {
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
  }, [matchId, aiBaseUrl, debug, autoStart]);

  // Stage 변경
  const setStage = useCallback((stage: TicketingStage): void => {
    const collector = collectorRef.current;

    if (!collector) {
      console.warn('[Telemetry] Not initialized');
      return;
    }

    if (stage !== 'VQA_CHALLENGE') {
      previousStageRef.current = stage;
    }

    collector.setStage(stage);
    setStageState(stage);
  }, []);

  // 현재 Stage 기준 telemetry 전송
  const flushCurrentStageAndSend = useCallback(async (): Promise<number> => {
    const collector = collectorRef.current;
    const api = apiRef.current;

    if (!collector || !api) {
      console.warn('[Telemetry] Not initialized');
      return 0;
    }

    const stage = collector.getStage();
    const events = collector.flush();

    try {
      await api.sendTelemetry(matchId, stage, events);
      if (debug) {
      }
      return events.length;
    } catch (error) {
      console.error('[Telemetry] Failed to send telemetry:', error);
      return 0;
    }
  }, [matchId, debug]);

  useEffect(() => {
    const runtime = {
      flushCurrentStageAndSend,
      setStage,
      getStage: () => stage,
    };

    registerTelemetryRuntime(runtime);

    return () => {
      unregisterTelemetryRuntime(runtime);
    };
  }, [flushCurrentStageAndSend, setStage, stage]);

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
      const result = await api.precheck(matchId, cfToken);
      return result.allowed;
    } catch (error) {
      console.error('[Telemetry] Precheck failed:', error);
      return true; // fail-open
    }
  }, [matchId]);

  // VQA 챌린지
  const startChallenge = useCallback(async (): Promise<ChallengeStartResponse> => {
    const api = apiRef.current;
    if (!api) {
      throw new AIApiError('Not initialized', 0);
    }
    setStage('VQA_CHALLENGE');
    return api.startChallenge(matchId);
  }, [matchId, setStage]);

  const verifyChallenge = useCallback(
    async (request: ChallengeVerifyInput): Promise<ChallengeVerifyResponse> => {
      const api = apiRef.current;
      if (!api) {
        throw new AIApiError('Not initialized', 0);
      }

      await flushCurrentStageAndSend();
      const response = await api.verifyChallenge({
        matchId,
        ...request,
      });

      if (response.success) {
        setStage(previousStageRef.current);
      }

      return response;
    },
    [flushCurrentStageAndSend, matchId, setStage]
  );

  return {
    stage,
    setStage,
    flush,
    flushCurrentStageAndSend,
    start,
    stop,
    precheck,
    startChallenge,
    verifyChallenge,
  };
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
      isChallenge: error.isChallengeRequired(),
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
