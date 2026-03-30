import { CATCH_BALL_CONFIG, MOVEMENT_ZONE, STRIKE_ZONE } from './catchBallConfig';
import type { PointPosition, RoundSetup } from './catchBallTypes';

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function makeLandingPoint(): PointPosition {
  const baseX = rand(STRIKE_ZONE.x + 12, STRIKE_ZONE.x + STRIKE_ZONE.width - 12);
  const baseY = rand(STRIKE_ZONE.y + 12, STRIKE_ZONE.y + STRIKE_ZONE.height - 12);

  return {
    x: clamp(baseX + rand(-6, 6), STRIKE_ZONE.x + 10, STRIKE_ZONE.x + STRIKE_ZONE.width - 10),
    y: clamp(baseY + rand(-6, 6), STRIKE_ZONE.y + 10, STRIKE_ZONE.y + STRIKE_ZONE.height - 10),
  };
}

export function makePitchDurationMs(): number {
  return Math.floor(rand(CATCH_BALL_CONFIG.minPitchDurationMs, CATCH_BALL_CONFIG.maxPitchDurationMs));
}

export function makeIndicatorDurationMs(pitchDurationMs: number): number {
  return pitchDurationMs + CATCH_BALL_CONFIG.indicatorTailMs;
}

export function makeTimingWindowStartMs(pitchDurationMs: number, indicatorDurationMs: number): number {
  const targetMs =
    pitchDurationMs +
    CATCH_BALL_CONFIG.timingAlignOffsetMs +
    rand(-CATCH_BALL_CONFIG.timingTargetJitterMs, CATCH_BALL_CONFIG.timingTargetJitterMs);
  const minStart = 90;
  const maxStart = indicatorDurationMs - CATCH_BALL_CONFIG.timingWindowMs - 10;
  const start = targetMs - CATCH_BALL_CONFIG.timingWindowMs / 2;

  return Math.floor(clamp(start, minStart, maxStart));
}

export function makeGloveStartPosition(target: PointPosition): PointPosition {
  const strikeZoneCenterX = STRIKE_ZONE.x + STRIKE_ZONE.width / 2;
  const strikeZoneCenterY = STRIKE_ZONE.y + STRIKE_ZONE.height / 2;
  const directionX = target.x <= strikeZoneCenterX ? 1 : -1;
  const directionY = target.y <= strikeZoneCenterY ? 1 : -1;
  const horizontalOffset = rand(105, 150) * directionX;
  const verticalOffset = rand(90, 130) * directionY;
  const padding = 52;

  return {
    x: clamp(
      target.x + horizontalOffset,
      MOVEMENT_ZONE.x + padding,
      MOVEMENT_ZONE.x + MOVEMENT_ZONE.width - padding,
    ),
    y: clamp(
      target.y + verticalOffset,
      MOVEMENT_ZONE.y + padding,
      MOVEMENT_ZONE.y + MOVEMENT_ZONE.height - padding,
    ),
  };
}

export function createRoundSetup(): RoundSetup {
  const landingPoint = makeLandingPoint();
  const pitchDurationMs = makePitchDurationMs();
  const indicatorDurationMs = makeIndicatorDurationMs(pitchDurationMs);

  return {
    gloveStart: makeGloveStartPosition(landingPoint),
    indicatorDurationMs,
    landingPoint,
    pitchDurationMs,
    timingWindowStartMs: makeTimingWindowStartMs(pitchDurationMs, indicatorDurationMs),
  };
}

export function formatChallengeTime(ms: number): string {
  const clamped = Math.max(0, ms);
  const totalCentiseconds = Math.ceil(clamped / 10);
  const minutes = Math.floor(totalCentiseconds / 6000);
  const seconds = Math.floor((totalCentiseconds % 6000) / 100);
  const centiseconds = totalCentiseconds % 100;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(
    centiseconds,
  ).padStart(2, '0')}`;
}

export function getRemainingAttemptTone(remainingAttempts: number): string {
  if (remainingAttempts <= 1) {
    return 'text-rose-300';
  }

  if (remainingAttempts === 2) {
    return 'text-amber-300';
  }

  return 'text-cyan-200';
}

export function toOneDigit(value: number): number {
  return Math.round(value * 10) / 10;
}
