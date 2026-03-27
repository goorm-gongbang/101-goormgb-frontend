/**
 * AI Telemetry SDK - API Client
 *
 * AI Runtime 엔드포인트 호출
 * - /ai/telemetry/ingest
 * - /ai/precheck
 * - /ai/challenge/start
 * - /ai/challenge/verify
 */

import { authFetch } from '../api/fetch';
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

const DEFAULT_TIMEOUT = 5000;

export class AITelemetryApi {
  private config: Required<AIApiConfig>;

  constructor(config: AIApiConfig) {
    this.config = {
      baseUrl: config.baseUrl,
      timeout: config.timeout ?? DEFAULT_TIMEOUT,
    };
  }

  async sendTelemetry(
    matchId: number,
    stage: TicketingStage,
    events: TelemetryEvent[]
  ): Promise<TelemetryIngestResponse> {
    const request: TelemetryIngestRequest = {
      matchId,
      stage,
      events,
    };

    return this.post<TelemetryIngestResponse, TelemetryIngestRequest>(
      '/telemetry/ingest',
      request
    );
  }

  async precheck(
    matchId: number,
    cfToken: string
  ): Promise<PrecheckResponse> {
    const request: PrecheckRequest = {
      matchId,
      cfToken,
    };

    return this.post<PrecheckResponse, PrecheckRequest>('/precheck', request);
  }

  async startChallenge(matchId: number): Promise<ChallengeStartResponse> {
    const request: ChallengeStartRequest = {
      matchId,
    };

    return this.post<ChallengeStartResponse, ChallengeStartRequest>(
      '/challenge/start',
      request
    );
  }

  async verifyChallenge(
    request: ChallengeVerifyRequest
  ): Promise<ChallengeVerifyResponse> {
    return this.post<ChallengeVerifyResponse, ChallengeVerifyRequest>(
      '/challenge/verify',
      request
    );
  }

  private async post<T, B>(path: string, body: B): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await authFetch<B>(url, {
        method: 'POST',
        body,
        signal: controller.signal,
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
}

export class AIApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = 'AIApiError';
  }

  isChallengeRequired(): boolean {
    return this.statusCode === 428;
  }

  isBlocked(): boolean {
    return this.statusCode === 403;
  }
}
