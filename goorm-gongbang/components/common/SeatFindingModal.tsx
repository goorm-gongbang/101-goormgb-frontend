"use client";

type Props = {
  open: boolean;
  rank: number | null;
  totalWaitingCount: number | null;
};

export function SeatFindingModal({ open, rank, totalWaitingCount }: Props) {
  if (!open) return null;

  const safeRank = rank ?? 0;
  const safeTotalWaitingCount = totalWaitingCount ?? 0;
  const progressPercent = safeRank > 0 && safeTotalWaitingCount > 0 ? ((safeTotalWaitingCount - safeRank + 1) / safeTotalWaitingCount) * 100 : 0;
  const clampedProgress = Math.min(100, Math.max(progressPercent, 0));
  const progressWidth = clampedProgress > 0 ? Math.max(clampedProgress, 6) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gradient-to-b from-black/90 to-teal-950/50 backdrop-blur-[5px]">
      <div className="absolute left-1/2 top-1/2 inline-flex w-110 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-12">
        <div className="flex h-40 flex-col items-center justify-end gap-4">
          <div className="w-96 text-center text-5xl font-extrabold leading-[72px] text-white font-['Pretendard']">
            {rank !== null ? `${rank.toLocaleString()}번째` : "-"}
          </div>

          <div className="relative h-4 w-96 overflow-hidden rounded-full bg-[var(--foundation-neutral-940)]">
            <div style={{ width: `${progressWidth}%` }} className="absolute left-0 top-0 h-4 w-20 bg-gradient-to-r from-[var(--foundation-secondary-600)] to-[var(--foundation-primary-500)]" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 self-stretch">
          <div className="self-stretch text-center text-2xl font-semibold leading-8 text-white font-['Pretendard']">
            선호하신 조건에 맞는 좌석을 찾고 있어요!
          </div>
          <div className="text-center text-base font-bold leading-6 text-white font-['Pretendard']">
            현재 뒤로 가거나 새로고침 하면 <span className="text-[var(--foundation-primary-100)]">대기 순서가 초기화 돼요.</span>
            <br />
            조금만 기다려 주세요!
          </div>
        </div>
      </div>
    </div>
  );
}
