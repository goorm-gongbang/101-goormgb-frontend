'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTelemetryContext } from '../context';
import type { ChallengeStartResponse, ChallengeVerifyInput } from '../types';
import {
  CATCH_BALL_CONFIG,
  INDICATOR_TRACK,
  MOVEMENT_ZONE,
  PITCHER_POSITION,
  STRIKE_ZONE,
} from './vqa/catchBallConfig';
import type {
  CatchAttemptResult,
  CountdownLabel,
  FailReason,
  Phase,
  PointPosition,
  RoundSetup,
} from './vqa/catchBallTypes';
import {
  clamp,
  createRoundSetup,
  getRemainingAttemptTone,
  toOneDigit,
} from './vqa/catchBallUtils';
import { VqaInstructionPanel } from './vqa/VqaInstructionPanel';

export interface VQAChallengeProps {
  onSuccess: () => void;
  onCancel: () => void;
  maxRetries?: number;
}

type ReadyChallengeState = {
  status: 'ready';
  challenge: ChallengeStartResponse;
  message?: string;
};

type SubmittingChallengeState = {
  status: 'submitting';
  challenge: ChallengeStartResponse;
  message?: string;
};

type ChallengeState =
  | { status: 'loading' }
  | ReadyChallengeState
  | SubmittingChallengeState
  | { status: 'error'; message: string };

const DEFAULT_INSTRUCTION_MESSAGE = 'Start 버튼을 눌러 보안 확인을 진행하세요.';
const AUTO_RETRY_DELAY_MS = 900;

function isLoadedChallengeState(
  state: ChallengeState,
): state is ReadyChallengeState | SubmittingChallengeState {
  return state.status === 'ready' || state.status === 'submitting';
}

function formatCountdown(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

function getFailMessage(failReason: FailReason | null): string {
  if (failReason === 'POSITION') {
    return '공의 도착 지점과 글러브 위치가 맞지 않았습니다.';
  }

  if (failReason === 'TIMING') {
    return '손을 놓은 타이밍이 강조 구간과 맞지 않았습니다.';
  }

  if (failReason === 'TIMEOUT') {
    return '시간 안에 손을 놓지 못했습니다.';
  }

  return '보안 확인에 실패했습니다.';
}

function BaseballIndicatorIcon(): React.ReactElement {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]">
      <defs>
        <radialGradient id="vqaIndicatorBaseball" cx="32%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="65%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#dbe3ef" />
        </radialGradient>
      </defs>
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="url(#vqaIndicatorBaseball)"
        stroke="#d7dee9"
        strokeWidth="3"
      />
      <path
        d="M24 18 C40 36, 40 64, 24 82"
        stroke="#ef4444"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M76 18 C60 36, 60 64, 76 82"
        stroke="#ef4444"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M28 30 L33 35 M26 42 L31 47 M26 54 L31 59 M28 66 L33 71"
        stroke="#ef4444"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M72 30 L67 35 M74 42 L69 47 M74 54 L69 59 M72 66 L67 71"
        stroke="#ef4444"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function VQAChallenge({
  onSuccess,
  onCancel,
  maxRetries = 3,
}: VQAChallengeProps): React.ReactElement {
  const { startChallenge, verifyChallenge } = useTelemetryContext();

  const [state, setState] = useState<ChallengeState>({ status: 'loading' });
  const [remainingTime, setRemainingTime] = useState(0);
  const [phase, setPhase] = useState<Phase>('INSTRUCTION');
  const [statusMessage, setStatusMessage] = useState(DEFAULT_INSTRUCTION_MESSAGE);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [countdownStartMs, setCountdownStartMs] = useState<number | null>(null);
  const [flowStartedAtMs, setFlowStartedAtMs] = useState<number | null>(null);
  const [pitchStartMs, setPitchStartMs] = useState<number | null>(null);
  const [animationFreezeMs, setAnimationFreezeMs] = useState<number | null>(null);
  const [roundSetup, setRoundSetup] = useState<RoundSetup | null>(null);
  const [glove, setGlove] = useState<PointPosition>({ x: 0, y: 0 });
  const [gloveSpawning, setGloveSpawning] = useState(false);
  const [positionOk, setPositionOk] = useState(false);
  const [timingOk, setTimingOk] = useState(false);
  const [distanceToTarget, setDistanceToTarget] = useState<number | null>(null);
  const [dropOffsetMs, setDropOffsetMs] = useState<number | null>(null);

  const mountedRef = useRef(true);
  const retryTimerRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const gloveRef = useRef<PointPosition>({ x: 0, y: 0 });
  const playRef = useRef<HTMLDivElement | null>(null);

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current !== null) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const resetRound = useCallback(
    (message = DEFAULT_INSTRUCTION_MESSAGE) => {
      clearRetryTimer();
      draggingRef.current = false;
      gloveRef.current = { x: 0, y: 0 };
      setPhase('INSTRUCTION');
      setStatusMessage(message);
      setNowMs(Date.now());
      setCountdownStartMs(null);
      setFlowStartedAtMs(null);
      setPitchStartMs(null);
      setAnimationFreezeMs(null);
      setRoundSetup(null);
      setGlove({ x: 0, y: 0 });
      setGloveSpawning(false);
      setPositionOk(false);
      setTimingOk(false);
      setDistanceToTarget(null);
      setDropOffsetMs(null);
    },
    [clearRetryTimer],
  );

  const loadChallenge = useCallback(
    async (message = DEFAULT_INSTRUCTION_MESSAGE) => {
      clearRetryTimer();
      setState({ status: 'loading' });

      try {
        const challenge = await startChallenge();
        if (!mountedRef.current) return;

        setState({ status: 'ready', challenge });
        setRemainingTime(Math.max(0, Math.floor((challenge.expiresAtMs - Date.now()) / 1000)));
        resetRound(message);
      } catch (error) {
        if (!mountedRef.current) return;

        setState({
          status: 'error',
          message: error instanceof Error ? error.message : '챌린지 로드 실패',
        });
      }
    },
    [clearRetryTimer, resetRound, startChallenge],
  );

  const beginRound = useCallback(() => {
    const nextRoundSetup = createRoundSetup();
    const startedAt = Date.now();

    clearRetryTimer();
    draggingRef.current = false;
    gloveRef.current = nextRoundSetup.gloveStart;
    setRoundSetup(nextRoundSetup);
    setGlove(nextRoundSetup.gloveStart);
    setGloveSpawning(false);
    setPhase('COUNTDOWN');
    setStatusMessage('잠시 후 보안 확인이 시작됩니다.');
    setNowMs(startedAt);
    setCountdownStartMs(startedAt);
    setFlowStartedAtMs(startedAt);
    setPitchStartMs(null);
    setAnimationFreezeMs(null);
    setPositionOk(false);
    setTimingOk(false);
    setDistanceToTarget(null);
    setDropOffsetMs(null);
  }, [clearRetryTimer]);

  const buildAttemptResult = useCallback(
    (dropTimestamp: number, caught: boolean, failReason: FailReason | null): CatchAttemptResult => {
      const finalGlove = gloveRef.current;

      return {
        caught,
        failReason,
        catchTsMs: dropTimestamp || Date.now(),
        catchXNorm: Number(
          clamp(finalGlove.x / CATCH_BALL_CONFIG.playWidth, 0, 1).toFixed(6),
        ),
        catchYNorm: Number(
          clamp(finalGlove.y / CATCH_BALL_CONFIG.playHeight, 0, 1).toFixed(6),
        ),
      };
    },
    [],
  );

  const submitAttempt = useCallback(
    async (attempt: CatchAttemptResult) => {
      if (!isLoadedChallengeState(state)) return;

      const challenge = state.challenge;
      setState({ status: 'submitting', challenge, message: state.message });

      try {
        const verifyInput: ChallengeVerifyInput = {
          challengeId: challenge.challengeId,
          caught: attempt.caught,
          catchTsMs: attempt.catchTsMs,
          catchXNorm: attempt.catchXNorm,
          catchYNorm: attempt.catchYNorm,
        };
        const result = await verifyChallenge(verifyInput);
        if (!mountedRef.current) return;

        if (result.success) {
          onSuccess();
          return;
        }

        if (result.remainingAttempts > 0) {
          setPhase('FAIL');
          setStatusMessage(`${getFailMessage(attempt.failReason)} 다시 시도합니다.`);
          setState({
            status: 'ready',
            challenge: {
              ...challenge,
              remainingAttempts: result.remainingAttempts,
            },
            message: '검증에 실패했습니다. 같은 챌린지로 다시 시도해 주세요.',
          });

          retryTimerRef.current = window.setTimeout(() => {
            if (!mountedRef.current) return;
            beginRound();
          }, AUTO_RETRY_DELAY_MS);
          return;
        }

        setState({
          status: 'error',
          message: '최대 시도 횟수를 초과했습니다.',
        });
      } catch (error) {
        if (!mountedRef.current) return;

        setState({
          status: 'error',
          message: error instanceof Error ? error.message : '검증 실패',
        });
      }
    },
    [beginRound, onSuccess, state, verifyChallenge],
  );

  const evaluateDrop = useCallback(
    (dropTimestamp: number) => {
      if (phase !== 'ACTIVE_PLAY' || !pitchStartMs || !roundSetup) {
        return;
      }

      const finalGlove = gloveRef.current;
      const distance = Math.hypot(
        finalGlove.x - roundSetup.landingPoint.x,
        finalGlove.y - roundSetup.landingPoint.y,
      );
      const resolvedPositionOk = distance <= CATCH_BALL_CONFIG.catchRadius;
      const elapsedFromPitch = dropTimestamp - pitchStartMs;
      const timingStart = roundSetup.timingWindowStartMs;
      const timingEnd = roundSetup.timingWindowStartMs + CATCH_BALL_CONFIG.timingWindowMs;
      const resolvedTimingOk = elapsedFromPitch >= timingStart && elapsedFromPitch <= timingEnd;
      const timingCenter = timingStart + CATCH_BALL_CONFIG.timingWindowMs / 2;
      const resolvedFailReason: FailReason | null = !resolvedPositionOk
        ? 'POSITION'
        : !resolvedTimingOk
          ? 'TIMING'
          : null;

      setAnimationFreezeMs(dropTimestamp);
      setNowMs(dropTimestamp);
      setPositionOk(resolvedPositionOk);
      setTimingOk(resolvedTimingOk);
      setDistanceToTarget(toOneDigit(distance));
      setDropOffsetMs(Math.round(elapsedFromPitch - timingCenter));

      if (resolvedFailReason === null) {
        setPhase('SUCCESS');
        setStatusMessage('포착 성공. 서버 검증을 진행합니다.');
      } else {
        setPhase('FAIL');
        setStatusMessage(getFailMessage(resolvedFailReason));
      }

      void submitAttempt(
        buildAttemptResult(dropTimestamp, resolvedFailReason === null, resolvedFailReason),
      );
    },
    [buildAttemptResult, phase, pitchStartMs, roundSetup, submitAttempt],
  );

  useEffect(() => {
    const bootstrapTimer = window.setTimeout(() => {
      void loadChallenge();
    }, 0);

    return () => window.clearTimeout(bootstrapTimer);
  }, [loadChallenge]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      clearRetryTimer();
    };
  }, [clearRetryTimer]);

  useEffect(() => {
    if (!isLoadedChallengeState(state)) return;

    const syncRemaining = () =>
      Math.max(0, Math.floor((state.challenge.expiresAtMs - Date.now()) / 1000));

    const timer = window.setInterval(() => {
      const nextRemaining = syncRemaining();
      setRemainingTime(nextRemaining);

      if (nextRemaining <= 0 && state.status !== 'submitting') {
        window.clearInterval(timer);
        void loadChallenge('챌린지 시간이 만료되어 새 인증을 불러왔습니다.');
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [loadChallenge, state]);

  useEffect(() => {
    if (
      phase !== 'COUNTDOWN' &&
      phase !== 'ACTIVE_PLAY' &&
      phase !== 'SUCCESS' &&
      phase !== 'FAIL'
    ) {
      return undefined;
    }

    const tick = window.setInterval(() => setNowMs(Date.now()), 16);
    return () => window.clearInterval(tick);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'COUNTDOWN' || !countdownStartMs) {
      return undefined;
    }

    const readyAt = countdownStartMs + CATCH_BALL_CONFIG.preReadyDelayMs;
    const goAt = readyAt + CATCH_BALL_CONFIG.readyDurationMs;
    const gloveAt = goAt + CATCH_BALL_CONFIG.goDurationMs;
    const gloveDelay = Math.max(0, gloveAt - Date.now());

    let gloveResetTimer: number | null = null;

    const gloveTimer = window.setTimeout(() => {
      setGloveSpawning(true);

      gloveResetTimer = window.setTimeout(() => {
        if (!mountedRef.current) return;
        setGloveSpawning(false);
      }, CATCH_BALL_CONFIG.gloveSpawnDurationMs);
    }, gloveDelay);

    const activeTimer = window.setTimeout(() => {
      const activeStart = Date.now();
      setPhase('ACTIVE_PLAY');
      setPitchStartMs(activeStart + CATCH_BALL_CONFIG.gloveToPitchDelayMs);
      setStatusMessage('글러브를 이동한 뒤 강조 구간에 맞춰 손을 놓으세요.');
      setNowMs(activeStart);
    }, gloveDelay);

    return () => {
      window.clearTimeout(gloveTimer);
      window.clearTimeout(activeTimer);
      if (gloveResetTimer !== null) {
        window.clearTimeout(gloveResetTimer);
      }
    };
  }, [countdownStartMs, phase]);

  useEffect(() => {
    if (phase !== 'ACTIVE_PLAY' || !flowStartedAtMs) {
      return undefined;
    }

    const finishAt = flowStartedAtMs + CATCH_BALL_CONFIG.solveDeadlineMs;
    const delay = Math.max(0, finishAt - Date.now());

    const timer = window.setTimeout(() => {
      setPhase('FAIL');
      setAnimationFreezeMs(finishAt);
      setNowMs(finishAt);
      setPositionOk(false);
      setTimingOk(false);
      setDistanceToTarget(null);
      setDropOffsetMs(null);
      setStatusMessage(getFailMessage('TIMEOUT'));
      void submitAttempt(buildAttemptResult(finishAt, false, 'TIMEOUT'));
    }, delay);

    return () => window.clearTimeout(timer);
  }, [buildAttemptResult, flowStartedAtMs, phase, submitAttempt]);

  const countdownLabel: CountdownLabel | null = useMemo(() => {
    if (phase !== 'COUNTDOWN' || !countdownStartMs) {
      return null;
    }

    const elapsed = nowMs - countdownStartMs;
    if (elapsed < CATCH_BALL_CONFIG.preReadyDelayMs) {
      return null;
    }

    if (elapsed < CATCH_BALL_CONFIG.preReadyDelayMs + CATCH_BALL_CONFIG.readyDurationMs) {
      return 'READY';
    }

    if (
      elapsed <
      CATCH_BALL_CONFIG.preReadyDelayMs +
        CATCH_BALL_CONFIG.readyDurationMs +
        CATCH_BALL_CONFIG.goDurationMs
    ) {
      return 'GO';
    }

    return null;
  }, [countdownStartMs, nowMs, phase]);

  const activeChallenge = isLoadedChallengeState(state) ? state.challenge : null;
  const totalAttempts = activeChallenge
    ? Math.max(maxRetries, activeChallenge.remainingAttempts)
    : maxRetries;
  const currentAttempt = activeChallenge
    ? Math.min(totalAttempts, totalAttempts - activeChallenge.remainingAttempts + 1)
    : 1;
  const displayRemainingAttempts = activeChallenge?.remainingAttempts ?? maxRetries;
  const motionReferenceMs = animationFreezeMs ?? nowMs;
  const resolvedLandingPoint = roundSetup?.landingPoint ?? {
    x: STRIKE_ZONE.x + STRIKE_ZONE.width / 2,
    y: STRIKE_ZONE.y + STRIKE_ZONE.height / 2,
  };
  const resolvedPitchDurationMs = roundSetup?.pitchDurationMs ?? CATCH_BALL_CONFIG.maxPitchDurationMs;
  const resolvedIndicatorDurationMs =
    roundSetup?.indicatorDurationMs ??
    CATCH_BALL_CONFIG.maxPitchDurationMs + CATCH_BALL_CONFIG.indicatorTailMs;
  const resolvedTimingWindowStartMs =
    roundSetup?.timingWindowStartMs ?? resolvedIndicatorDurationMs / 2;

  const indicatorProgress = useMemo(() => {
    if (!pitchStartMs) {
      return 0;
    }

    const elapsed = motionReferenceMs - pitchStartMs;
    if (elapsed <= 0) {
      return 0;
    }

    return clamp(elapsed / resolvedIndicatorDurationMs, 0, 1);
  }, [motionReferenceMs, pitchStartMs, resolvedIndicatorDurationMs]);

  const ballProgress = useMemo(() => {
    if (!pitchStartMs) {
      return 0;
    }

    const elapsed = motionReferenceMs - pitchStartMs;
    if (elapsed <= 0) {
      return 0;
    }

    return clamp(elapsed / resolvedPitchDurationMs, 0, 1);
  }, [motionReferenceMs, pitchStartMs, resolvedPitchDurationMs]);

  const indicatorX = INDICATOR_TRACK.x + indicatorProgress * INDICATOR_TRACK.width;
  const timingWindowStartX =
    INDICATOR_TRACK.x +
    (resolvedTimingWindowStartMs / resolvedIndicatorDurationMs) * INDICATOR_TRACK.width;
  const timingWindowWidth =
    (CATCH_BALL_CONFIG.timingWindowMs / resolvedIndicatorDurationMs) * INDICATOR_TRACK.width;
  const ballArc = Math.sin(ballProgress * Math.PI) * 92;
  const ballPos = {
    x: PITCHER_POSITION.x + (resolvedLandingPoint.x - PITCHER_POSITION.x) * ballProgress,
    y: PITCHER_POSITION.y + (resolvedLandingPoint.y - PITCHER_POSITION.y) * ballProgress - ballArc,
  };
  const ballDiameter = 12 + 20 * Math.pow(ballProgress, 1.45);
  const ballGroundY = PITCHER_POSITION.y + (resolvedLandingPoint.y - PITCHER_POSITION.y) * ballProgress + 14;
  const ballShadowW = ballDiameter * (0.9 + ballProgress * 0.65);
  const ballShadowH = ballDiameter * (0.32 + ballProgress * 0.2);
  const ballShadowOpacity = 0.12 + ballProgress * 0.25;
  const shouldRenderGlove =
    Boolean(roundSetup) &&
    (phase === 'ACTIVE_PLAY' ||
      phase === 'SUCCESS' ||
      phase === 'FAIL' ||
      (phase === 'COUNTDOWN' &&
        countdownStartMs !== null &&
        nowMs - countdownStartMs >=
          CATCH_BALL_CONFIG.preReadyDelayMs +
            CATCH_BALL_CONFIG.readyDurationMs +
            CATCH_BALL_CONFIG.goDurationMs));

  const handlePointerDown = () => {
    if (phase !== 'ACTIVE_PLAY' || !roundSetup || state.status !== 'ready') {
      return;
    }

    draggingRef.current = true;
  };

  const handlePointerUp = () => {
    if (!draggingRef.current) {
      return;
    }

    draggingRef.current = false;
    evaluateDrop(Date.now());
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (phase !== 'ACTIVE_PLAY' || !draggingRef.current || !playRef.current) {
      return;
    }

    const rect = playRef.current.getBoundingClientRect();
    const nextX = clamp(event.clientX - rect.left, MOVEMENT_ZONE.x, MOVEMENT_ZONE.x + MOVEMENT_ZONE.width);
    const nextY = clamp(event.clientY - rect.top, MOVEMENT_ZONE.y, MOVEMENT_ZONE.y + MOVEMENT_ZONE.height);
    const nextGlove = { x: nextX, y: nextY };

    gloveRef.current = nextGlove;
    setGlove(nextGlove);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[860px] rounded-[28px] border border-slate-700 bg-[linear-gradient(180deg,#0f172a_0%,#020617_100%)] text-slate-100 shadow-[0_30px_90px_rgba(2,6,23,0.78)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">Security Check</p>
            <h2 className="mt-2 text-2xl font-black tracking-[0.04em] text-white">보안 확인</h2>
            <p className="mt-2 text-sm text-slate-300">
              경기장 안에서 공을 정확한 위치와 타이밍에 맞춰 잡아 인증을 완료하세요.
            </p>
            {isLoadedChallengeState(state) && state.message && (
              <p className="mt-2 text-sm text-amber-300">{state.message}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
          >
            닫기
          </button>
        </div>

        {state.status === 'loading' && (
          <div className="flex items-center justify-center gap-3 px-6 py-16">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-cyan-300/30 border-b-cyan-300" />
            <span className="text-slate-300">챌린지를 불러오는 중입니다.</span>
          </div>
        )}

        {state.status === 'error' && (
          <div className="px-6 py-10">
            <div className="rounded-3xl border border-rose-400/20 bg-rose-950/30 p-8 text-center">
              <h3 className="text-xl font-bold text-rose-200">보안 확인을 진행할 수 없습니다.</h3>
              <p className="mt-3 text-sm text-rose-100/80">{state.message}</p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-full border border-slate-700 bg-slate-900/80 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
                >
                  닫기
                </button>
                <button
                  type="button"
                  onClick={() => void loadChallenge()}
                  className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
                >
                  다시 불러오기
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoadedChallengeState(state) && (
          <div className="space-y-5 px-6 py-6">
            <div className="flex flex-wrap gap-3">
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/75">Current Attempt</p>
                <p className="mt-1 text-xl font-black text-white">{currentAttempt}</p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/75">Remaining</p>
                <p className={`mt-1 text-xl font-black ${getRemainingAttemptTone(displayRemainingAttempts)}`}>
                  {displayRemainingAttempts} / {totalAttempts}
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/75">Challenge Timer</p>
                <p className="mt-1 font-mono text-xl font-black text-white">
                  {formatCountdown(remainingTime)}
                </p>
              </div>
              {(distanceToTarget !== null || dropOffsetMs !== null) && (
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/75">Last Judge</p>
                  <p className="mt-1 text-sm font-medium text-slate-200">
                    {distanceToTarget !== null ? `거리 ${distanceToTarget}px` : '거리 -'} /{' '}
                    {dropOffsetMs !== null ? `타이밍 ${dropOffsetMs}ms` : '타이밍 -'}
                  </p>
                </div>
              )}
            </div>

            <div className="overflow-x-auto rounded-[24px] border border-slate-800 bg-slate-950/80 p-3">
              <div
                ref={playRef}
                className="relative mx-auto overflow-hidden rounded-[20px] border border-slate-700 bg-slate-950 touch-none"
                style={{
                  width: CATCH_BALL_CONFIG.playWidth,
                  height: CATCH_BALL_CONFIG.playHeight,
                  backgroundImage:
                    "linear-gradient(180deg, rgba(2,6,23,0.02) 0%, rgba(2,6,23,0.08) 40%, rgba(2,6,23,0.16) 100%), url('/vqa-ballpark-photo.svg')",
                  backgroundPosition: '47% bottom',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'cover',
                }}
                data-testid="catchball-playfield"
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0)_46%)]" />
                <div className="absolute inset-x-0 top-0 h-[38%] bg-[linear-gradient(180deg,rgba(255,255,255,0.09)_0%,rgba(255,255,255,0)_100%)]" />

                <div className="absolute bottom-[18px] left-[22px] right-[22px] h-[70px] rounded-[22px] border-[5px] border-[#f8b84a] bg-[linear-gradient(180deg,#ffdd86_0%,#d98a19_100%)] shadow-[0_10px_20px_rgba(15,23,42,0.45)]">
                  <div className="absolute inset-[8px] rounded-[16px] border-[3px] border-[#0b215f] bg-[linear-gradient(180deg,#14214d_0%,#090f27_100%)]">
                    <div
                      className="absolute rounded-[10px] bg-[linear-gradient(180deg,rgba(255,165,0,0.78)_0%,rgba(255,98,0,0.82)_100%)] shadow-[0_0_24px_rgba(251,191,36,0.38)]"
                      style={{
                        left: timingWindowStartX,
                        top: 9,
                        width: timingWindowWidth,
                        height: 24,
                      }}
                      data-testid="catchball-window"
                    />
                    <div
                      className="absolute"
                      style={{ left: indicatorX - 16, top: 4, width: 32, height: 32 }}
                      data-testid="catchball-indicator"
                    >
                      <BaseballIndicatorIcon />
                    </div>
                  </div>
                </div>

                <div
                  className="absolute rounded border-2 border-white/75"
                  style={{
                    left: STRIKE_ZONE.x,
                    top: STRIKE_ZONE.y,
                    width: STRIKE_ZONE.width,
                    height: STRIKE_ZONE.height,
                  }}
                />

                {roundSetup && (
                  <>
                    <div
                      className="absolute rounded-full border border-cyan-200/60"
                      style={{
                        left: roundSetup.landingPoint.x - CATCH_BALL_CONFIG.catchRadius,
                        top: roundSetup.landingPoint.y - CATCH_BALL_CONFIG.catchRadius,
                        width: CATCH_BALL_CONFIG.catchRadius * 2,
                        height: CATCH_BALL_CONFIG.catchRadius * 2,
                      }}
                    />
                    <div
                      className="absolute rounded-full border border-cyan-100 bg-cyan-300/70"
                      style={{
                        left: roundSetup.landingPoint.x - 10,
                        top: roundSetup.landingPoint.y - 10,
                        width: 20,
                        height: 20,
                      }}
                      data-testid="catchball-landing-marker"
                    />
                  </>
                )}

                {roundSetup && (phase === 'ACTIVE_PLAY' || phase === 'SUCCESS' || phase === 'FAIL') && (
                  <>
                    <div
                      className="absolute rounded-full bg-black/50 blur-[2px]"
                      style={{
                        left: ballPos.x - ballShadowW / 2,
                        top: ballGroundY - ballShadowH / 2,
                        width: ballShadowW,
                        height: ballShadowH,
                        opacity: ballShadowOpacity,
                      }}
                    />
                    <div
                      className="absolute"
                      style={{
                        left: ballPos.x - ballDiameter / 2,
                        top: ballPos.y - ballDiameter / 2,
                        width: ballDiameter,
                        height: ballDiameter,
                        filter: 'drop-shadow(0 6px 8px rgba(15,23,42,0.45))',
                      }}
                    >
                      <BaseballIndicatorIcon />
                    </div>
                  </>
                )}

                {shouldRenderGlove && roundSetup && (
                  <button
                    type="button"
                    className={`absolute touch-none ${gloveSpawning ? 'scale-110' : ''}`}
                    style={{
                      left: glove.x - CATCH_BALL_CONFIG.gloveWidth / 2,
                      top: glove.y - CATCH_BALL_CONFIG.gloveHeight / 2,
                      width: CATCH_BALL_CONFIG.gloveWidth,
                      height: CATCH_BALL_CONFIG.gloveHeight,
                      transition: gloveSpawning ? 'transform 200ms ease-out' : undefined,
                    }}
                    onPointerDown={handlePointerDown}
                    aria-label="glove catch"
                    data-testid="catchball-glove"
                    disabled={state.status !== 'ready' || phase !== 'ACTIVE_PLAY'}
                  >
                    <svg viewBox="0 0 92 68" className="h-full w-full drop-shadow-[0_7px_10px_rgba(0,0,0,0.45)]">
                      <path
                        d="M10 58 C8 40, 13 22, 26 13 C34 8, 43 8, 50 11 C57 8, 67 9, 74 15 C84 24, 86 40, 83 57 C76 60, 67 61, 58 60 C53 58, 47 58, 42 60 C31 61, 20 61, 10 58 Z"
                        fill="url(#vqaGloveFill)"
                        stroke="#7c4a23"
                        strokeWidth="2.2"
                      />
                      <path
                        d="M36 18 L27 48 M45 16 L42 50 M55 16 L58 49 M66 19 L72 46"
                        stroke="#8b5a2b"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M15 43 C25 47, 33 47, 40 44"
                        stroke="#5b3718"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="vqaGloveFill" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#f7d59a" stopOpacity="0.82" />
                          <stop offset="52%" stopColor="#d7924a" stopOpacity="0.76" />
                          <stop offset="100%" stopColor="#a96329" stopOpacity="0.72" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </button>
                )}

                {phase === 'INSTRUCTION' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/55 p-6 backdrop-blur-[3px]">
                    <VqaInstructionPanel
                      onStart={beginRound}
                      disabled={state.status !== 'ready'}
                    />
                  </div>
                )}

                {phase === 'COUNTDOWN' && countdownLabel === 'READY' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <p className="text-7xl font-black tracking-[0.16em] text-cyan-100 drop-shadow-[0_0_18px_rgba(103,232,249,0.65)]">
                      READY
                    </p>
                  </div>
                )}

                {phase === 'COUNTDOWN' && countdownLabel === 'GO' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <p className="text-7xl font-black tracking-[0.16em] text-cyan-100 drop-shadow-[0_0_18px_rgba(103,232,249,0.65)]">
                      GO!
                    </p>
                  </div>
                )}

                {(phase === 'SUCCESS' || phase === 'FAIL') && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/45 backdrop-blur-[2px]">
                    <div className="w-[min(92%,420px)] rounded-2xl border border-slate-500 bg-slate-900/95 p-6 text-center shadow-[0_20px_40px_rgba(2,6,23,0.4)]">
                      <h3
                        className={`text-2xl font-black ${
                          phase === 'SUCCESS' ? 'text-emerald-300' : 'text-amber-300'
                        }`}
                      >
                        {phase === 'SUCCESS' ? '판정 완료' : '다시 시도'}
                      </h3>
                      <p className="mt-3 text-sm text-slate-300">{statusMessage}</p>
                      <p className="mt-4 text-xs uppercase tracking-[0.24em] text-slate-500">
                        Position {positionOk ? 'OK' : 'MISS'} / Timing {timingOk ? 'OK' : 'MISS'}
                      </p>
                      {state.status === 'submitting' && (
                        <div className="mt-5 flex items-center justify-center gap-3 text-sm text-cyan-200">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-300/30 border-b-cyan-300" />
                          <span>서버 검증 중...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-200">{statusMessage}</p>
                <p className="mt-1 text-xs text-slate-500">
                  챌린지 시간이 만료되거나 검증에 실패하면 같은 모달에서 즉시 다시 시도할 수 있습니다.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={state.status === 'submitting'}
                  className="rounded-full border border-slate-700 bg-slate-900/80 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => void loadChallenge('새 챌린지를 불러왔습니다.')}
                  disabled={state.status === 'submitting'}
                  className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  새로고침
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
