"use client";

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
                다시 예매하려면 <a className="text-Text-normal(N240) text-base font-bold font-['Pretendard'] leading-6">대기열부터 다시 진행해야 할 수 있습니다.</a>
              </div>
            </div>
          </div>

          <div className="self-stretch inline-flex justify-start items-center gap-2">
            <button
              type="button"
              onClick={onFindOtherSeat}
              className="cursor-pointer flex-1 h-10 min-w-20 px-4 py-2 rounded-md outline outline-1 outline-offset-[-1px] outline-[var(--foundation-primary-500)] flex justify-center items-center"
            >
              <span className="text-[var(--foundation-primary-500)] text-sm font-semibold font-['Pretendard_Variable'] leading-5">
                취소
              </span>
            </button>

            <button
              type="button"
              onClick={onSelectAlternativeSeat}
              className="cursor-pointer flex-1 h-10 min-w-20 px-4 py-2 bg-[var(--foundation-primary-500)] rounded-md flex justify-center items-center"
            >
              <span className="text-[var(--foundation-neutral-white)] text-sm font-semibold font-['Pretendard_Variable'] leading-5">
                확인
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
