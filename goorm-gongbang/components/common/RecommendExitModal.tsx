"use client";

import { PrimaryButton, SecondaryButton } from "@/components/common/Button";

type Props = {
  open: boolean;
  onExit: () => void;
  onClose: () => void;
};

export function RecommendExitModal({ open, onExit, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="inline-flex w-full max-w-[420px] flex-col items-start gap-8 overflow-hidden rounded-2xl bg-white p-8">
        <div className="flex w-full flex-col items-start gap-6">
          <div className="w-full text-xl font-bold leading-7 text-[var(--foundation-neutral-240)] font-['Pretendard']">
            이 화면을 나가시겠어요?
          </div>
          <div className="w-full text-base font-medium leading-6 text-[var(--foundation-neutral-240)] font-['Pretendard']">
            돌아가면 예매 대기부터 다시 진행해야 할 수 있어요. 현재 선택한 정보는 유지되지 않습니다.
          </div>
        </div>
        <div className="inline-flex w-full items-center gap-2">
          <SecondaryButton onClick={onExit} className="flex flex-1">
            나가기
          </SecondaryButton>
          <PrimaryButton onClick={onClose} className="flex flex-1">
            계속 예매하기
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
