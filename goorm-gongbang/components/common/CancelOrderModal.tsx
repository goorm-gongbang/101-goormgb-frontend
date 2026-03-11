"use client";
import { PrimaryButton, SecondaryButton } from "@/components/common/Button";

type CancelOrderModalProps = {
  open: boolean;
  onClose: () => void;
  onFindOtherSeat: () => void;
  onSelectAlternativeSeat: () => void;
};

export function CancelOrderModal({
  open,
  onClose,
  onFindOtherSeat,
  onSelectAlternativeSeat,
}: CancelOrderModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        data-button="on"
        data-icon="off"
        className="w-full max-w-md bg-[var(--foundation-neutral-white)] rounded-2xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-[var(--stroke-interactive-neutral-default)] inline-flex flex-col justify-start items-start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="self-stretch p-8 flex flex-col justify-start items-start gap-8">
          <div className="self-stretch flex flex-col justify-start items-start gap-6">
            <div className="self-stretch inline-flex justify-start items-center">
              <div className="flex-1 text-[var(--foundation-neutral-240)] text-xl font-bold font-['Pretendard'] leading-7">
                이전 단계로 돌아가시겠어요?
              </div>
            </div>
            <div className="self-stretch inline-flex justify-start items-center">
              <div className="flex-1 text-[var(--foundation-neutral-240)] text-base font-medium font-['Pretendard'] leading-6">
                이 화면을 나가면 현재 선택한 좌석은 유지되지 않을 수 있어요.
                <br />
                다시 예매하려면 <a className="text[var(--text-normal-n240)] text-base font-bold font-['Pretendard'] leading-6">대기열부터 다시 진행해야 할 수 있습니다.</a>
              </div>
            </div>
          </div>

          <div className="self-stretch inline-flex justify-start items-center gap-2">
            
            <SecondaryButton
              type="button"
              size="lg"
              tone="base"
              onClick={onFindOtherSeat}
              className="flex-1 min-w-20"
            >
              취소
            </SecondaryButton>

            <PrimaryButton
              type="button"
              size="lg"
              tone="base"
              onClick={onSelectAlternativeSeat}
              className="flex-1 min-w-20"
            >
              확인
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
