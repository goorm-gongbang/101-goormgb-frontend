"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Rank = 1 | 2 | 3 | 4 | 5;

type RankChipProps = React.HTMLAttributes<HTMLDivElement> & {
  rank: Rank;
  label?: string; // 기본: `${rank}순위`
};

const rankStyles: Record<
  Rank,
  { bg: string; outline: string; text: string }
> = {
  1: {
    bg: "bg-[var(--foundation-secondary-400)]",
    outline: "outline-[var(--foundation-secondary-300)]",
    text: "text-[var(--foundation-neutral-white)]",
  },
  2: {
    bg: "bg-[var(--foundation-primary-500)]",
    outline: "outline-[var(--foundation-primary-400)]",
    text: "text-[var(--foundation-neutral-white)]",
  },
  3: {
    bg: "bg-[var(--foundation-yellow-500)]",
    outline: "outline-[var(--foundation-yellow-400)]",
    text: "text-[var(--foundation-neutral-white)]",
  },
  4: {
    bg: "bg-[var(--foundation-orange-500)]",
    outline: "outline-[var(--foundation-orange-400)]",
    text: "text-[var(--foundation-neutral-white)]",
  },
  5: {
    bg: "bg-[var(--foundation-red-500)]",
    outline: "outline-[var(--foundation-red-400)]",
    text: "text-[var(--foundation-neutral-white)]",
  },
};

export function RankChipButton({
  rank,
  label,
  className,
  ...props
}: RankChipProps) {
  const s = rankStyles[rank];
  const text = label ?? `${rank}순위`;

  return (
    <div
      className={cn(
        "h-6 rounded-[100px] p-2 inline-flex items-center justify-center",
        "outline outline-1 outline-offset-[-1px]",
        s.bg,
        s.outline,
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "text-center text-xs font-semibold leading-5",
          "font-['Pretendard']",
          s.text
        )}
      >
        {text}
      </div>
    </div>
  );
}
