'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTelemetryContext } from '../context';
import type { ChallengeStartResponse } from '../types';

export interface VQAChallengeProps {
  onSuccess: () => void;
  onCancel: () => void;
  maxRetries?: number;
}

type ChallengeState =
  | { status: 'loading' }
  | { status: 'ready'; challenge: ChallengeStartResponse; message?: string }
  | { status: 'submitting'; challenge: ChallengeStartResponse }
  | { status: 'error'; message: string };

export function VQAChallenge({
  onSuccess,
  onCancel,
  maxRetries = 3,
}: VQAChallengeProps): React.ReactElement {
  const { startChallenge, verifyChallenge } = useTelemetryContext();

  const [state, setState] = useState<ChallengeState>({ status: 'loading' });
  const [remainingTime, setRemainingTime] = useState(0);

  const loadChallenge = useCallback(async () => {
    setState({ status: 'loading' });

    try {
      const challenge = await startChallenge();
      setState({ status: 'ready', challenge });
      setRemainingTime(Math.max(0, Math.floor((challenge.expiresAtMs - Date.now()) / 1000)));
    } catch (error) {
      setState({
        status: 'error',
        message: error instanceof Error ? error.message : '챌린지 로드 실패',
      });
    }
  }, [startChallenge]);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const challenge = await startChallenge();
        if (!active) return;
        setState({ status: 'ready', challenge });
        setRemainingTime(Math.max(0, Math.floor((challenge.expiresAtMs - Date.now()) / 1000)));
      } catch (error) {
        if (!active) return;
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : '챌린지 로드 실패',
        });
      }
    };

    void bootstrap();

    return () => {
      active = false;
    };
  }, [startChallenge]);

  useEffect(() => {
    if (state.status !== 'ready' || remainingTime <= 0) return;

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          void loadChallenge();
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.status, remainingTime, loadChallenge]);

  const handleCatch = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (state.status !== 'ready') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const catchXNorm = rect.width > 0 ? (e.clientX - rect.left) / rect.width : 0;
    const catchYNorm = rect.height > 0 ? (e.clientY - rect.top) / rect.height : 0;

    setState({ status: 'submitting', challenge: state.challenge });

    try {
      const result = await verifyChallenge({
        challengeId: state.challenge.challengeId,
        caught: true,
        catchTsMs: Date.now(),
        catchXNorm: Math.max(0, Math.min(1, Number(catchXNorm.toFixed(6)))),
        catchYNorm: Math.max(0, Math.min(1, Number(catchYNorm.toFixed(6)))),
      });

      if (result.success) {
        onSuccess();
        return;
      }

      if (result.remainingAttempts <= 0 || result.remainingAttempts > maxRetries) {
        setState({
          status: 'error',
          message: '최대 시도 횟수를 초과했습니다.',
        });
        return;
      }

      setState({
        status: 'ready',
        challenge: {
          ...state.challenge,
          remainingAttempts: result.remainingAttempts,
        },
        message: '검증에 실패했습니다. 다시 시도해 주세요.',
      });
    } catch (error) {
      setState({
        status: 'error',
        message: error instanceof Error ? error.message : '검증 실패',
      });
    }
  };

  const formatTime = (seconds: number): string => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold text-gray-900">보안 확인</h2>

        {state.status === 'loading' && (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
            <span className="ml-3 text-gray-600">로딩 중...</span>
          </div>
        )}

        {state.status === 'error' && (
          <div className="py-8 text-center">
            <p className="mb-4 text-red-600">{state.message}</p>
            <button
              onClick={onCancel}
              className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
            >
              닫기
            </button>
          </div>
        )}

        {state.status === 'ready' && (
          <div>
            <p className="mb-4 text-sm text-gray-700">
              아래 영역을 클릭해 보안 확인을 진행하세요.
            </p>

            {state.message && (
              <p className="mb-4 text-sm text-red-600">{state.message}</p>
            )}

            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-gray-500">
                남은 시도 {state.challenge.remainingAttempts} / {maxRetries}
              </span>
              <span className={`font-mono ${remainingTime <= 10 ? 'text-red-600' : 'text-gray-500'}`}>
                {formatTime(remainingTime)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCatch}
              className="mb-4 flex h-56 w-full items-center justify-center rounded-xl border border-dashed border-blue-300 bg-blue-50 text-sm font-medium text-blue-700 hover:bg-blue-100"
            >
              클릭해서 검증
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
              >
                취소
              </button>
              <button
                type="button"
                onClick={loadChallenge}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                새로고침
              </button>
            </div>
          </div>
        )}

        {state.status === 'submitting' && (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
            <span className="ml-3 text-gray-600">확인 중...</span>
          </div>
        )}
      </div>
    </div>
  );
}
