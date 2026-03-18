"use client";

import { PrimaryButton } from "@/components/common/Button";

type Props = {
  open: boolean;
  onMoveToSeatMap: () => void;
};

export function RecommendSoldOutModal({ open, onMoveToSeatMap }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="inline-flex max-w-[420px] flex-col items-start gap-8 rounded-2xl bg-white p-8">
        <div className="flex w-full flex-col items-start gap-6">
          <div className="w-full text-xl font-bold leading-7 text-[var(--foundation-neutral-240)] font-['Pretendard']">
            추천 좌석이 모두 소진되었어요
          </div>
          <div className="text-base leading-6 text-[var(--foundation-neutral-240)]">
            <span className="font-medium font-['Pretendard']">
              설정하신 조건에 맞는 추천 좌석이 모두 예매되었어요. 지금은 추천 대신
            </span>
            <span className="font-semibold font-['Pretendard_Variable']">
              {" "}좌석 맵에서 직접 선택
            </span>
            <span className="font-medium font-['Pretendard']">
              하실 수 있어요.
            </span>
          </div>
        </div>

        <PrimaryButton onClick={onMoveToSeatMap} className="flex w-full">
          좌석 맵으로 이동하기
        </PrimaryButton>
      </div>
    </div>
  );
}
