'use client';

import { useState } from 'react';
import { VQAChallenge } from '@/lib/telemetry/components';
import { TelemetryProvider } from '@/lib/telemetry/context';

export default function VqaDemoPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [lastResult, setLastResult] = useState<'success' | 'cancelled' | null>(null);

  return (
    <TelemetryProvider matchId={9999} autoStart aiBaseUrl="/api/vqa-demo-ai">
      <main className="min-h-screen bg-[linear-gradient(180deg,#09131f_0%,#102a3c_100%)] p-6">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
          <h1 className="text-2xl font-semibold text-slate-900">VQA Demo Preview</h1>
          <p className="mt-2 text-sm text-slate-600">
            추천 플로우 없이 현재 VQA 모달만 확인하는 개발용 페이지입니다.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setLastResult(null);
                setIsOpen(true);
              }}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              VQA 다시 열기
            </button>
            {lastResult && (
              <span className="text-sm text-slate-600">
                마지막 상태: {lastResult === 'success' ? '성공' : '취소'}
              </span>
            )}
          </div>
        </div>

        {isOpen && (
          <VQAChallenge
            onSuccess={() => {
              setLastResult('success');
              setIsOpen(false);
            }}
            onCancel={() => {
              setLastResult('cancelled');
              setIsOpen(false);
            }}
          />
        )}
      </main>
    </TelemetryProvider>
  );
}
