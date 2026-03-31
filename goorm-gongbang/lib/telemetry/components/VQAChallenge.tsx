'use client';

import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PrimaryButton } from '@/components/common/Button';
import { AIApiError } from '../api';
import { useTelemetryContext } from '../context';
import type { ChallengeStartResponse, ChallengeVerifyInput } from '../types';
import {
  CATCH_BALL_CONFIG,
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
  | { status: 'error'; message: string; reason?: 'max_attempts' | 'blocked' | 'generic' };

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
          reason: error instanceof AIApiError && error.isBlocked() ? 'blocked' : 'generic',
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
          reason: 'max_attempts',
        });
      } catch (error) {
        if (!mountedRef.current) return;

        setState({
          status: 'error',
          message: error instanceof Error ? error.message : '검증 실패',
          reason: error instanceof AIApiError && error.isBlocked() ? 'blocked' : 'generic',
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
  const gaugeThumbTop = clamp(128 - indicatorProgress * 112, 4, 149);
  const countdownOverlayLabel =
    countdownLabel === 'READY' ? 'Ready' : countdownLabel === 'GO' ? 'Start!' : null;
  const playfieldTimeLabel = formatCountdown(remainingTime);
  const countdownOverlayTextClass =
    countdownOverlayLabel === 'Start!'
      ? 'text-[var(--foundation-primary-100)] [text-shadow:0_0_20px_rgba(202,254,241,0.4)]'
      : 'text-white [text-shadow:0_0_20px_rgba(202,254,241,0.4)]';
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
  const isErrorState = state.status === 'error';
  const errorAccent =
    !isErrorState ? null : state.reason === 'max_attempts' || state.reason === 'blocked' ? 'red' : 'neutral';
  const errorTitle =
    !isErrorState
      ? ''
      : state.reason === 'max_attempts' || state.reason === 'blocked'
        ? '인증 실패'
        : '보안 확인을 진행할 수 없습니다.';
  const errorDescription =
    !isErrorState
      ? []
      : state.reason === 'max_attempts'
        ? ['인증 가능 횟수를 초과했습니다.', '경기 상세 페이지에서 다시 예매를 진행해 주세요.']
        : state.reason === 'blocked'
          ? [
              '비정상적인 입력 패턴이 감지되었습니다.',
              '자동화 시도로 분류될 수 있는 패턴이 감지되어 현재 세션이 종료되었습니다.',
            ]
          : [state.message];
  const errorConfirmLabel = errorAccent === 'red' ? '확인' : '다시 불러오기';
  const terminalErrorCardClass =
    state.status === 'error' && state.reason === 'blocked' ? 'max-w-[703px] px-11 py-8' : 'max-w-[463px] px-9 py-8';
  const terminalErrorCopyClass =
    state.status === 'error' && state.reason === 'blocked' ? 'max-w-[615px]' : 'max-w-[360px]';
  const handleErrorConfirm = () => {
    if (errorAccent === 'red') {
      onCancel();
      return;
    }

    void loadChallenge();
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[linear-gradient(180deg,rgba(0,0,0,0.9)_0%,rgba(3,41,53,0.5)_100%)] p-4 backdrop-blur-[5px]">
      <div className="w-full max-w-[996px] rounded-2xl border-2 border-[var(--foundation-primary-400)] bg-[var(--foundation-neutral-white)] px-10 pb-10 pt-5 shadow-[0_0_20px_rgba(0,214,161,0.1)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-6">
            <p className="shrink-0 text-[20px] font-semibold leading-[1.5] text-[var(--foundation-neutral-240)] font-['Pretendard']">
              플레이볼 보안 인증
            </p>
            <p className="min-w-0 text-sm font-normal leading-[1.5] text-[var(--foundation-neutral-400)] font-['Pretendard']">
              매크로/봇 방지를 위한 인증을 진행해주세요.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="shrink-0 text-sm font-medium leading-5 text-[var(--foundation-neutral-520)] transition hover:text-[var(--foundation-neutral-240)]"
          >
            닫기
          </button>
        </div>

        {state.status === 'loading' && (
          <div className="mt-4 flex h-[458px] items-center justify-center">
            <div className="flex items-center gap-3 rounded-2xl border border-[var(--foundation-neutral-880)] bg-white px-6 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--foundation-primary-100)] border-b-[var(--foundation-primary-600)]" />
              <span className="text-base font-medium leading-6 text-[var(--foundation-neutral-240)] font-['Pretendard']">
                챌린지를 불러오는 중입니다.
              </span>
            </div>
          </div>
        )}

        {isErrorState && errorAccent === 'neutral' && (
          <div className="mt-4 flex h-[458px] items-center justify-center">
            <div className="w-full max-w-[420px] rounded-2xl border border-[var(--foundation-neutral-880)] bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
              <h3 className="text-xl font-bold leading-7 text-[var(--foundation-neutral-240)] font-['Pretendard']">
                {errorTitle}
              </h3>
              <p className="mt-3 text-sm font-medium leading-6 text-[var(--foundation-neutral-400)] font-['Pretendard']">
                {errorDescription[0]}
              </p>
              <div className="mt-6 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-md border border-[var(--foundation-neutral-880)] px-4 py-2 text-sm font-medium leading-5 text-[var(--foundation-neutral-240)]"
                >
                  닫기
                </button>
                <PrimaryButton type="button" size="lg" tone="strong" onClick={handleErrorConfirm}>
                  {errorConfirmLabel}
                </PrimaryButton>
              </div>
            </div>
          </div>
        )}

        {isErrorState && errorAccent === 'red' && (
          <div className="mt-4 relative h-[458px] overflow-hidden rounded-2xl border border-[var(--foundation-neutral-880)]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(2,6,23,0.08) 0%, rgba(2,6,23,0.16) 40%, rgba(2,6,23,0.24) 100%), url('/new-vqa-ballpark-photo.png')",
                backgroundPosition: '47% bottom',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
              }}
            />
            <div className="absolute inset-0 bg-[rgba(15,23,42,0.62)] backdrop-blur-[2px]" />
            <div className="relative z-10 flex h-full items-center justify-center p-6">
              <div
                className={`w-full rounded-2xl border-2 border-[#FF7A7A] bg-[linear-gradient(180deg,#FFF0F0_0%,#FFF7F7_36%,#FFFFFF_100%)] text-center shadow-[0_0_28px_rgba(255,122,122,0.24)] ${terminalErrorCardClass}`}
              >
                <h3 className="text-[32px] font-semibold leading-[1.5] text-[#FF4D4F] font-['Pretendard']">
                  {errorTitle}
                </h3>
                <div className={`mx-auto mt-3 space-y-1 ${terminalErrorCopyClass}`}>
                  <p className="text-[24px] font-semibold leading-[1.5] text-[var(--foundation-neutral-240)] font-['Pretendard']">
                    {errorDescription[0]}
                  </p>
                  {errorDescription[1] && (
                    <p className="text-[24px] font-medium leading-[1.5] text-[var(--foundation-neutral-240)] font-['Pretendard']">
                      {errorDescription[1]}
                    </p>
                  )}
                </div>
                <PrimaryButton
                  type="button"
                  size="lg"
                  tone="strong"
                  onClick={handleErrorConfirm}
                  className="mt-8 w-full text-base font-semibold leading-6"
                >
                  {errorConfirmLabel}
                </PrimaryButton>
              </div>
            </div>
          </div>
        )}

        {isLoadedChallengeState(state) && (
          <div className="mt-4 flex items-start gap-4">
            <div className="relative h-[458px] w-[708px] overflow-hidden rounded-2xl bg-white">
              <div
                ref={playRef}
                className="relative h-full w-full touch-none overflow-hidden rounded-2xl"
                style={{
                  width: CATCH_BALL_CONFIG.playWidth,
                  height: CATCH_BALL_CONFIG.playHeight,
                  backgroundImage:
                    "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 22%, rgba(2,6,23,0.06) 72%, rgba(2,6,23,0.14) 100%), url('/new-vqa-ballpark-photo.png')",
                  backgroundPosition: '47% bottom',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'cover',
                }}
                data-testid="catchball-playfield"
                aria-label={`VQA playfield, remaining time ${playfieldTimeLabel}`}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(255,255,255,0.34)_0%,rgba(255,255,255,0)_48%)]" />

                <div
                  className="absolute rounded-[6px] border-[3px] border-white/80"
                  style={{
                    left: STRIKE_ZONE.x,
                    top: STRIKE_ZONE.y,
                    width: STRIKE_ZONE.width,
                    height: STRIKE_ZONE.height,
                  }}
                />

                <div
                  className="absolute overflow-hidden rounded-[4px] border border-[var(--foundation-neutral-880)] bg-white/60"
                  style={{
                    left: 252,
                    top: 150,
                    width: 20,
                    height: 170,
                  }}
                >
                  <div className="absolute left-1/2 top-[3px] h-[38px] w-[16px] -translate-x-1/2 rounded-[4px] border border-[var(--foundation-primary-100)] bg-[linear-gradient(180deg,var(--foundation-primary-700)_0%,var(--foundation-primary-500)_100%)]" />
                  <div
                    className="absolute left-1/2 h-[14px] w-[14px] -translate-x-1/2 rounded-full border border-[var(--foundation-primary-600)] bg-white"
                    style={{ top: gaugeThumbTop }}
                  />
                </div>

                {roundSetup && (phase === 'ACTIVE_PLAY' || phase === 'SUCCESS' || phase === 'FAIL') && (
                  <>
                    <div
                      className="absolute rounded-full bg-black/40 blur-[2px]"
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
                        filter: 'drop-shadow(0 6px 8px rgba(15,23,42,0.35))',
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
                    <Image
                      src="/baseballglove.svg"
                      alt=""
                      fill
                      sizes={`${CATCH_BALL_CONFIG.gloveWidth}px`}
                      className="h-full w-full object-contain drop-shadow-[0_7px_10px_rgba(0,0,0,0.45)]"
                      draggable={false}
                      aria-hidden="true"
                    />
                  </button>
                )}

                {phase === 'INSTRUCTION' && (
                  <div className="absolute inset-0 bg-black/55 backdrop-blur-[3px]">
                    <VqaInstructionPanel />
                  </div>
                )}

                {phase === 'COUNTDOWN' && countdownOverlayLabel && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.7)]">
                    <p
                      className={`text-[72px] font-bold leading-[1.4] tracking-[7.2px] font-['Pretendard'] ${countdownOverlayTextClass}`}
                    >
                      {countdownOverlayLabel}
                    </p>
                  </div>
                )}

                {phase === 'SUCCESS' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[rgba(15,23,42,0.54)] backdrop-blur-[2px]">
                    <div className="w-full max-w-[509px] rounded-2xl border-2 border-[var(--foundation-primary-400)] bg-[linear-gradient(180deg,#EFFFF9_0%,#F8FFFC_36%,#FFFFFF_100%)] px-9 py-8 text-center shadow-[0_0_28px_rgba(0,214,161,0.24)]">
                      <h3 className="text-[32px] font-semibold leading-[1.5] text-[var(--foundation-primary-500)] font-['Pretendard']">
                        인증 통과
                      </h3>
                      <p className="mt-3 text-[24px] font-medium leading-[1.5] text-[var(--foundation-neutral-240)] font-['Pretendard']">
                        잠시만 기다려주세요. 대기열로 이동합니다.
                      </p>
                      <span className="sr-only">
                        {statusMessage} Position {positionOk ? 'OK' : 'MISS'} / Timing{' '}
                        {timingOk ? 'OK' : 'MISS'}
                        {distanceToTarget !== null ? ` / 거리 ${distanceToTarget}px` : ''}
                        {dropOffsetMs !== null ? ` / 타이밍 ${dropOffsetMs}ms` : ''}
                      </span>
                      {state.status === 'submitting' && (
                        <div className="mt-5 flex items-center justify-center gap-3 text-sm font-medium leading-5 text-[var(--foundation-primary-600)] font-['Pretendard']">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--foundation-primary-100)] border-b-[var(--foundation-primary-600)]" />
                          <span>서버 검증 중...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {phase === 'FAIL' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[rgba(15,23,42,0.48)]">
                    <p className="text-[64px] font-semibold leading-none tracking-[-1.92px] text-[#FF5C5C] [text-shadow:0_0_20px_rgba(255,92,92,0.36)] font-['Pretendard']">
                      Fail
                    </p>
                    <span className="sr-only">
                      {statusMessage} Position {positionOk ? 'OK' : 'MISS'} / Timing{' '}
                      {timingOk ? 'OK' : 'MISS'}
                      {distanceToTarget !== null ? ` / 거리 ${distanceToTarget}px` : ''}
                      {dropOffsetMs !== null ? ` / 타이밍 ${dropOffsetMs}ms` : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex h-[458px] w-[188px] flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="rounded-[10px] bg-[var(--foundation-primary-10)] py-1 text-center text-sm font-medium leading-[1.5] text-[var(--foundation-primary-600)] font-['Pretendard']">
                  남은 횟수
                </div>
                <div className="rounded-2xl border border-[var(--foundation-neutral-880)] bg-white px-4 py-4 shadow-[0_0_10px_rgba(143,252,225,0.1)]">
                  <div className="flex items-end justify-center gap-[6px] whitespace-nowrap">
                    <span className="text-[32px] font-semibold leading-[1.5] text-[var(--foundation-primary-500)] font-['Pretendard']">
                      {displayRemainingAttempts}회
                    </span>
                    <span className="pb-[4px] text-base font-medium leading-[1.5] text-[var(--foundation-neutral-240)] font-['Pretendard']">
                      / 총 {totalAttempts}회
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-2">
                <div className="rounded-[10px] bg-[var(--foundation-primary-10)] py-1 text-center text-sm font-medium leading-[1.5] text-[var(--foundation-primary-600)] font-['Pretendard']">
                  설명
                </div>
                <div className="flex flex-1 flex-col gap-[10px] rounded-2xl border border-[var(--foundation-neutral-880)] bg-white px-5 pt-[22px] shadow-[0_0_10px_rgba(143,252,225,0.1)]">
                  {[
                    '공이 날아오면 시작',
                    '글러브 이동',
                    '공 위치에 맞춰 놓기',
                  ].map((text, index) => (
                    <div key={text} className="flex items-center gap-2">
                      <div className="flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[var(--foundation-primary-500)] text-[10px] font-semibold leading-[1.5] text-white font-['Pretendard']">
                        {index + 1}
                      </div>
                      <p className="text-base font-medium leading-[1.5] text-[var(--foundation-neutral-240)] font-['Pretendard']">
                        {text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <PrimaryButton
                type="button"
                size="lg"
                tone="strong"
                disabled={state.status === 'submitting' || state.status !== 'ready'}
                onClick={beginRound}
                className="w-full text-base font-semibold leading-6"
                data-testid={phase === 'INSTRUCTION' ? 'catchball-start' : undefined}
              >
                {phase === 'INSTRUCTION' ? '바로 시작하기' : '다시 시작하기'}
              </PrimaryButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
