"use client";

import { PrimaryButton } from "@/components/common/Button";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function RecommendSeatUnavailableModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="inline-flex w-96 flex-col items-start justify-start rounded-2xl bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-[var(--stroke-interactive-neutral-default)]">
        <div className="flex self-stretch flex-col items-start justify-start gap-8 overflow-hidden p-8">
          <div className="self-stretch flex flex-col items-start justify-start">
            <div className="self-stretch flex flex-col items-start justify-start gap-6">
              <div className="self-stretch inline-flex items-center justify-start">
                <div className="flex-1 text-xl font-bold leading-7 text-[var(--foundation-neutral-240)] font-['Pretendard']">
                  지금 선택한 좌석을 예매할 수 없어요
                </div>
              </div>
              <div className="inline-flex items-center justify-start">
                <div className="text-base font-medium leading-6 text-[var(--foundation-neutral-240)] font-['Pretendard']">
                  현재 해당 좌석은 예매할 수 없는 상태입니다.
                  <br />
                  다른 좌석을 선택해 주세요.
                </div>
              </div>
            </div>
          </div>

          <div className="self-stretch inline-flex items-center justify-start gap-2">
            <PrimaryButton onClick={onClose} className="flex-1">
              확인
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
