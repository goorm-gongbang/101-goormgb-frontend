"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ChipBlackVariant = "outlineStrong" | "outline" | "filled" | "dark";

type ChipBlackButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ChipBlackVariant;
};

const base =
  "h-9 rounded-[100px] inline-flex justify-center items-center px-3 py-1.5 select-none";
const baseText =
  "text-center justify-center text-xs leading-5 font-['Pretendard']";

const variants: Record<
  ChipBlackVariant,
  { wrap: string; text: string }
> = {
  // 1) bg white + outline neutral-800 + text normal
  outlineStrong: {
    wrap:
      "bg-[var(--foundation-neutral-white)] outline outline-1 outline-offset-[-1px] outline-[var(--foundation-neutral-800)]",
    text: "text-[var(--foundation-neutral-240)] font-normal",
  },

  // 2) bg white + outline neutral-640 + text normal
  outline: {
    wrap:
      "bg-[var(--foundation-neutral-white)] outline outline-1 outline-offset-[-1px] outline-[var(--foundation-neutral-640)]",
    text: "text-[var(--foundation-neutral-240)] font-normal",
  },

  // 3) bg neutral-60 + outline neutral-60 + text white (medium, leading-4)
  filled: {
    wrap:
      "bg-[var(--foundation-neutral-60)] outline outline-1 outline-offset-[-1px] outline-[var(--foundation-neutral-60)]",
    text: "text-[var(--foundation-neutral-white)] font-medium leading-4",
  },

  // 4) bg neutral-960 + text neutral-760 (no outline)
  dark: {
    wrap: "bg-[var(--foundation-neutral-960)]",
    text: "text-[var(--foundation-neutral-760)] font-normal",
  },
};

export function ChipBlackButton({
  variant = "outlineStrong",
  className,
  children = "Button",
  type = "button",
  ...props
}: ChipBlackButtonProps) {
  const v = variants[variant];

  return (
    <button
      type={type}
      className={cn(base, v.wrap, className)}
      {...props}
    >
      <span className={cn(baseText, v.text)}>{children}</span>
    </button>
  );
}
