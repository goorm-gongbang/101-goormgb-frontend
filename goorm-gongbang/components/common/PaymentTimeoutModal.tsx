"use client";

type PaymentTimeoutModalProps = {
  open: boolean;
  onConfirm: () => void;
};

export function PaymentTimeoutModal({ open, onConfirm }: PaymentTimeoutModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[var(--background-white)] rounded-2xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-[var(--stroke-interactive-neutral-default)] inline-flex flex-col justify-start items-start">
        <div className="self-stretch p-8 flex flex-col justify-start items-start gap-8">
          <div className="flex flex-col justify-start items-start gap-6">
            <div className="self-stretch inline-flex justify-start items-center">
              <div className="flex-1 text-[var(--foundation-neutral-240)] text-xl font-bold font-['Pretendard'] leading-7">
                좌석 임시 확보 시간이 지났어요
              </div>
            </div>
            <div className="inline-flex justify-start items-center">
              <div className="text-[var(--foundation-neutral-240)] text-base font-medium font-['Pretendard'] leading-6">
                좌석 임시 확보 시간이 지나 예매를 처음부터 다시 진행해야 합니다.
                <br />
                다시 진행하려면 <span className="font-bold">경기 상세 화면</span>으로 이동해 주세요.
              </div>
            </div>
          </div>

          <div className="self-stretch inline-flex justify-start items-center gap-2">
            <button
              type="button"
              onClick={onConfirm}
              className="cursor-pointer flex-1 h-10 min-w-20 px-4 py-2 bg-[var(--foundation-primary-500)] rounded-md flex justify-center items-center"
            >
              <span className="text-center text-[var(--foundation-neutral-white)] text-sm font-semibold font-['Pretendard'] leading-5">
                확인
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
