'use client';

/**
 * VQA Challenge Component
 *
 * ext_authz에서 REQUIRE_S3 (HTTP 428) 응답을 받았을 때 표시
 * 사용자가 이미지 기반 질문에 답변해야 진행 가능
 *
 * 사용법:
 * ```tsx
 * import { VQAChallenge } from '@/lib/telemetry/components/VQAChallenge';
 *
 * function SeatSelection() {
 *   const [showChallenge, setShowChallenge] = useState(false);
 *
 *   const handleApiError = (error: AIApiError) => {
 *     if (error.statusCode === 428) {
 *       setShowChallenge(true);
 *     }
 *   };
 *
 *   return (
 *     <>
 *       {showChallenge && (
 *         <VQAChallenge
 *           onSuccess={() => {
 *             setShowChallenge(false);
 *             // 원래 요청 재시도
 *           }}
 *           onCancel={() => setShowChallenge(false)}
 *         />
 *       )}
 *     </>
 *   );
 * }
 * ```
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTelemetryContext } from '../context';
import type { ChallengeStartResponse } from '../types';

export interface VQAChallengeProps {
  /** 챌린지 성공 시 콜백 */
  onSuccess: () => void;

  /** 취소 시 콜백 */
  onCancel: () => void;

  /** 최대 재시도 횟수 (기본: 3) */
  maxRetries?: number;
}

type ChallengeState =
  | { status: 'loading' }
  | { status: 'ready'; challenge: ChallengeStartResponse }
  | { status: 'submitting' }
  | { status: 'error'; message: string };

export function VQAChallenge({
  onSuccess,
  onCancel,
  maxRetries = 3,
}: VQAChallengeProps): React.ReactElement {
  const { startChallenge, verifyChallenge } = useTelemetryContext();

  const [state, setState] = useState<ChallengeState>({ status: 'loading' });
  const [answer, setAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

  // 챌린지 로드
  const loadChallenge = useCallback(async () => {
    setState({ status: 'loading' });

    try {
      const challenge = await startChallenge();
      setState({ status: 'ready', challenge });

      // 남은 시간 계산
      const expiresIn = Math.max(0, challenge.expiresAt - Date.now() / 1000);
      setRemainingTime(Math.floor(expiresIn));
    } catch (error) {
      setState({
        status: 'error',
        message: error instanceof Error ? error.message : '챌린지 로드 실패',
      });
    }
  }, [startChallenge]);

  // 초기 로드
  useEffect(() => {
    loadChallenge();
  }, [loadChallenge]);

  // 타이머
  useEffect(() => {
    if (state.status !== 'ready' || remainingTime <= 0) return;

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          // 시간 초과 - 새 챌린지 로드
          loadChallenge();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.status, remainingTime, loadChallenge]);

  // 답변 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (state.status !== 'ready' || !answer.trim()) return;

    setState({ status: 'submitting' });
    setAttempts((prev) => prev + 1);

    try {
      const result = await verifyChallenge(state.challenge.challengeId, answer.trim());

      if (result.success) {
        onSuccess();
      } else {
        // 실패
        if (attempts + 1 >= maxRetries) {
          setState({
            status: 'error',
            message: '최대 시도 횟수를 초과했습니다.',
          });
        } else {
          // 새 챌린지 로드
          setAnswer('');
          await loadChallenge();
        }
      }
    } catch (error) {
      setState({
        status: 'error',
        message: error instanceof Error ? error.message : '검증 실패',
      });
    }
  };

  // 시간 포맷
  const formatTime = (seconds: number): string => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          보안 확인
        </h2>

        {state.status === 'loading' && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <span className="ml-3 text-gray-600">로딩 중...</span>
          </div>
        )}

        {state.status === 'error' && (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{state.message}</p>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
            >
              닫기
            </button>
          </div>
        )}

        {state.status === 'ready' && (
          <form onSubmit={handleSubmit}>
            {/* 이미지 */}
            <div className="mb-4">
              <img
                src={state.challenge.imageUrl}
                alt="Challenge"
                className="w-full rounded-lg border"
              />
            </div>

            {/* 질문 */}
            <p className="text-gray-700 mb-4">
              {state.challenge.question}
            </p>

            {/* 남은 시간 */}
            <div className="flex justify-between items-center mb-4 text-sm">
              <span className="text-gray-500">
                시도 {attempts + 1} / {maxRetries}
              </span>
              <span className={`font-mono ${remainingTime <= 10 ? 'text-red-600' : 'text-gray-500'}`}>
                {formatTime(remainingTime)}
              </span>
            </div>

            {/* 입력 */}
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="답변을 입력하세요"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={!answer.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                확인
              </button>
            </div>
          </form>
        )}

        {state.status === 'submitting' && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <span className="ml-3 text-gray-600">확인 중...</span>
          </div>
        )}
      </div>
    </div>
  );
}
