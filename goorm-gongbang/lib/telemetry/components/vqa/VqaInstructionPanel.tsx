'use client';

type VqaInstructionPanelProps = {
  disabled?: boolean;
  onStart: () => void;
};

export function VqaInstructionPanel({
  disabled = false,
  onStart,
}: VqaInstructionPanelProps): React.ReactElement {
  return (
    <div className="w-full max-w-[520px] rounded-[28px] border border-cyan-300/35 bg-[linear-gradient(180deg,rgba(26,67,222,0.96)_0%,rgba(13,30,124,0.94)_100%)] px-8 py-9 text-center shadow-[0_0_0_2px_rgba(103,232,249,0.18),0_24px_80px_rgba(2,6,23,0.65)]">
      <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/90">VQA Game</p>
      <h2 className="mt-3 text-4xl font-black tracking-[0.08em] text-white">CATCH THE BALL</h2>
      <div className="mt-6 rounded-2xl border border-white/15 bg-black/20 px-5 py-4 text-left text-sm leading-7 text-cyan-50">
        <p>1. 글러브를 드래그해 공의 도착 지점으로 이동합니다.</p>
        <p>2. 하단 인디케이터의 강조 구간에 맞춰 손을 놓습니다.</p>
        <p>3. 위치와 타이밍이 모두 맞으면 보안 확인이 완료됩니다.</p>
      </div>
      <div className="mt-8 flex justify-center">
        <button
          type="button"
          className="flex h-32 w-32 items-center justify-center rounded-full border-[10px] border-fuchsia-950/45 bg-[radial-gradient(circle_at_35%_30%,#ff9fd2_0%,#ff5ca8_48%,#cf196f_100%)] text-2xl font-black uppercase tracking-[0.14em] text-white shadow-[inset_0_8px_0_rgba(255,255,255,0.26),inset_0_-10px_0_rgba(120,15,61,0.35),0_12px_0_rgba(58,18,120,0.82),0_26px_50px_rgba(0,0,0,0.45)] transition-transform hover:translate-y-[2px] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onStart}
          disabled={disabled}
          data-testid="catchball-start"
        >
          Start
        </button>
      </div>
    </div>
  );
}
