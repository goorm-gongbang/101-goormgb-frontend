"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RotateCw, type LucideProps } from "lucide-react";

type IconCircleState = "default" | "hover" | "pressed";

type ButtonReloadProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  state?: IconCircleState;
  icon?: React.ReactNode;
  iconProps?: LucideProps;
};

const bgByState: Record<IconCircleState, string> = {
  default: "bg-[var(--foundation-neutral-white)]",
  hover: "bg-[var(--foundation-neutral-960)]",
  pressed: "bg-[var(--foundation-neutral-940)]",
};

export function ButtonReload({
  state = "default",
  icon,
  iconProps,
  className,
  type = "button",
  ...props
}: ButtonReloadProps) {
  return (
    <button
      type={type}
      className={cn(
        "w-9 h-9 rounded-[100px] inline-flex justify-center items-center",
        "outline outline-1 outline-offset-[-1px] outline-[var(--foundation-neutral-800)]",
        bgByState[state],
        className
      )}
      {...props}
    >
      <span className="w-4 h-4 inline-flex items-center justify-center">
        {icon ?? (
          <RotateCw
            size={16}
            strokeWidth={2}
            className={cn("text-[var(--text-normal-n240)]", iconProps?.className)}
            {...iconProps}
          />
        )}
      </span>
    </button>
  );
}
