/**
 * AI Telemetry SDK - API Client
 *
 * AI Runtime 엔드포인트 호출
 * - /ai/telemetry/ingest - 텔레메트리 전송
 * - /ai/precheck - Turnstile 검증
 * - /ai/challenge/start - VQA 챌린지 시작
 * - /ai/challenge/verify - VQA 챌린지 검증
 */

import type {
  TelemetryEvent,
  TicketingStage,
  TelemetryIngestRequest,
  TelemetryIngestResponse,
  PrecheckRequest,
  PrecheckResponse,
  ChallengeStartRequest,
  ChallengeStartResponse,
  ChallengeVerifyRequest,
  ChallengeVerifyResponse,
} from './types';

export interface AIApiConfig {
  baseUrl: string;
  timeout?: number;
}

const DEFAULT_TIMEOUT = 5000; // 5초

export class AITelemetryApi {
  private config: Required<AIApiConfig>;

  constructor(config: AIApiConfig) {
    this.config = {
      baseUrl: config.baseUrl,
      timeout: config.timeout ?? DEFAULT_TIMEOUT,
    };
  }

  /**
   * 텔레메트리 데이터 전송
   * 보호 API 호출 직전 등, 현재 Stage 기준 batch 전송
   */
  async sendTelemetry(
    sid: string,
    matchId: string,
    stage: TicketingStage,
    events: TelemetryEvent[]
  ): Promise<TelemetryIngestResponse> {
    const request: TelemetryIngestRequest = {
      sid,
      matchId,
      stage,
      events,
      meta: this.collectMeta(),
    };

    return this.post<TelemetryIngestResponse>(
      '/telemetry/ingest',
      request
    );
  }

  /**
   * Precheck (Cloudflare Turnstile 검증)
   * 대기열 진입 전 호출
   */
  async precheck(
    sid: string,
    matchId: string,
    cfToken: string
  ): Promise<PrecheckResponse> {
    const request: PrecheckRequest = {
      sid,
      matchId,
      cfToken,
    };

    return this.post<PrecheckResponse>('/precheck', request);
  }

  /**
   * VQA 챌린지 시작
   * ext_authz에서 REQUIRE_S3 응답 받았을 때 호출
   */
  async startChallenge(
    sid: string,
    matchId: string
  ): Promise<ChallengeStartResponse> {
    const request: ChallengeStartRequest = {
      sid,
      matchId,
      challengeType: 'S3',
    };

    return this.post<ChallengeStartResponse>('/challenge/start', request);
  }

  /**
   * VQA 챌린지 답변 제출
   */
  async verifyChallenge(
    sid: string,
    challengeId: string,
    answer: string
  ): Promise<ChallengeVerifyResponse> {
    const request: ChallengeVerifyRequest = {
      sid,
      challengeId,
      answer,
    };

    return this.post<ChallengeVerifyResponse>('/challenge/verify', request);
  }

  // =========================================================================
  // Private
  // =========================================================================

  private async post<T>(path: string, body: unknown): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
        credentials: 'include', // 쿠키 포함 (세션)
      });

      if (!response.ok) {
        throw new AIApiError(
          `API request failed: ${response.status}`,
          response.status,
          await this.parseErrorBody(response)
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof AIApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new AIApiError('Request timeout', 408);
        }
        throw new AIApiError(error.message, 0);
      }

      throw new AIApiError('Unknown error', 0);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async parseErrorBody(response: Response): Promise<unknown> {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  private collectMeta(): TelemetryIngestRequest['meta'] {
    if (typeof window === 'undefined') {
      return {
        userAgent: '',
        screenWidth: 0,
        screenHeight: 0,
        timezone: '',
        language: '',
      };
    }

    return {
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
    };
  }
}

/**
 * AI API 에러 클래스
 */
export class AIApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = 'AIApiError';
  }

  /**
   * ext_authz REQUIRE_S3 응답인지 확인 (HTTP 428)
   */
  isChallenceRequired(): boolean {
    return this.statusCode === 428;
  }

  /**
   * ext_authz BLOCK 응답인지 확인 (HTTP 403)
   */
  isBlocked(): boolean {
    return this.statusCode === 403;
  }
}
