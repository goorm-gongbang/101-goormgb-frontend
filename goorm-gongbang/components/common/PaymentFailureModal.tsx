"use client";

import { AlertCircle } from "lucide-react";

type PaymentFailureModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
};

const DEFAULT_TITLE = "결제를 완료하지 못했어요";
const DEFAULT_DESCRIPTION =
  "선택하신 결제 수단으로 결제가 진행되지 않았어요.\n다른 결제 수단을 선택해 다시 시도해 주세요.";

export function PaymentFailureModal({
  open,
  onClose,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
}: PaymentFailureModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-10"
      onClick={onClose}
    >
      <div
        data-button="off"
        data-icon="on"
        className="w-full max-w-md rounded-2xl bg-gradient-to-b from-[var(--foundation-red-50)] to-[var(--foundation-neutral-white)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-[var(--foundation-red-400)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-failure-modal-title"
      >
        <div className="flex flex-col gap-4 p-8">
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2">
              <AlertCircle
                className="h-4 w-4 text-[var(--foundation-red-500)]"
                strokeWidth={2}
              />
              <div
                id="payment-failure-modal-title"
                className="text-lg font-semibold leading-6 text-[var(--foundation-neutral-240)]"
              >
                {title}
              </div>
            </div>

            <div className="text-base font-medium leading-6 whitespace-pre-line text-[var(--foundation-neutral-240)]">
              {description}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer w-fit px-1 text-sm font-medium leading-5 underline text-[var(--foundation-neutral-600)]"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
