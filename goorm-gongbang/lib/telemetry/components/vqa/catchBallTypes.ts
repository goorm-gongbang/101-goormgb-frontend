export type Phase = 'INSTRUCTION' | 'COUNTDOWN' | 'ACTIVE_PLAY' | 'SUCCESS' | 'FAIL';

export type CountdownLabel = 'READY' | 'GO';

export type FailReason = 'POSITION' | 'TIMING' | 'TIMEOUT';

export interface Point {
  x: number;
  y: number;
  t: number;
}

export interface RoundSetup {
  gloveStart: PointPosition;
  indicatorDurationMs: number;
  landingPoint: PointPosition;
  pitchDurationMs: number;
  timingWindowStartMs: number;
}

export interface PointPosition {
  x: number;
  y: number;
}

export interface CatchAttemptResult {
  catchTsMs: number;
  catchXNorm: number;
  catchYNorm: number;
  caught: boolean;
  failReason: FailReason | null;
}
