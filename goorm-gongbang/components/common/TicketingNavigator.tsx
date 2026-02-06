"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type StepKey = "seat" | "order" | "pay";

type TicketingNavigatorProps = {
  active: StepKey;
  className?: string;
};

const steps: { key: StepKey; label: string }[] = [
  { key: "seat", label: "좌석 선택" },
  { key: "order", label: "주문서" },
  { key: "pay", label: "결제하기" },
];

const baseText =
  "text-center justify-center text-sm leading-5 font-['Pretendard']";
const strongText = "text-[var(--foundation-neutral-160)] font-semibold";
const infoText = "text-[var(--foundation-neutral-600)] font-normal";

export function TicketingNavigator({ active, className }: TicketingNavigatorProps) {
  return (
    <div className={cn("inline-flex justify-start items-center gap-2", className)}>
      {steps.map((s, idx) => {
        const isActive = s.key === active;

        return (
          <React.Fragment key={s.key}>
            <div className="flex justify-center items-center gap-2">
              <div className={cn(baseText, isActive ? strongText : infoText)}>
                {s.label}
              </div>
            </div>

            {idx !== steps.length - 1 && (
              <div className={cn(baseText, infoText)}>&gt;</div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
