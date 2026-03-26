export const CATCH_BALL_CONFIG = {
  playWidth: 710,
  playHeight: 460,
  preReadyDelayMs: 300,
  readyDurationMs: 1000,
  goDurationMs: 1000,
  gloveSpawnDurationMs: 300,
  gloveToPitchDelayMs: 200,
  solveDeadlineMs: 4500,
  minPitchDurationMs: 1120,
  maxPitchDurationMs: 1480,
  indicatorTailMs: 280,
  timingWindowMs: 300,
  timingTargetJitterMs: 0,
  timingAlignOffsetMs: 20,
  catchRadius: 48,
  safetyMargin: 18,
  sampleEveryMs: 20,
  gloveWidth: 92,
  gloveHeight: 68,
} as const;

export const STRIKE_ZONE = {
  x: 260,
  y: 152,
  width: 150,
  height: 170,
} as const;

export const MOVEMENT_ZONE = {
  x: STRIKE_ZONE.x - (CATCH_BALL_CONFIG.catchRadius + CATCH_BALL_CONFIG.safetyMargin),
  y: STRIKE_ZONE.y - (CATCH_BALL_CONFIG.catchRadius + CATCH_BALL_CONFIG.safetyMargin),
  width: STRIKE_ZONE.width + (CATCH_BALL_CONFIG.catchRadius + CATCH_BALL_CONFIG.safetyMargin) * 2,
  height: STRIKE_ZONE.height + (CATCH_BALL_CONFIG.catchRadius + CATCH_BALL_CONFIG.safetyMargin) * 2,
} as const;

export const INDICATOR_TRACK = {
  x: 42,
  y: 18,
  width: 620,
  height: 22,
} as const;

export const PITCHER_POSITION = {
  x: 335,
  y: 210,
} as const;
