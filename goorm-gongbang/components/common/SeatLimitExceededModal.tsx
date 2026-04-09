"use client";
import { CircleAlert } from 'lucide-react';

type Props = {
  open: boolean;
};

export function SeatLimitExceededModal({ open }: Props) {
  if (!open) return null;

  return (
    <div className="pointer-events-none fixed left-1/2 top-6 z-[100] -translate-x-1/2">
      <div className="rounded-2xl bg-gradient-to-b from-[var(--foundation-red-50)] to-[var(--foundation-neutral-white)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-[var(--foundation-red-400)]">
        <div className="p-8">
          <div className="inline-flex items-center justify-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center shrink-0">
              <CircleAlert className="h-5 w-5 text-[var(--foundation-red-500)]" />
            </div>
            <div className="flex items-center text-lg font-semibold leading-6 text-[var(--text-normal-n240)]">
              구매 수량을 초과하여 좌석을 선택할 수 없습니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
