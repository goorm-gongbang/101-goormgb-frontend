import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tone = "strong" | "base" | "soft" | "lighter";

type ShadcnButtonProps = React.ComponentProps<typeof Button>;

type DestructiveButtonProps = Omit<ShadcnButtonProps, "size" | "variant"> & {
  tone?: Tone;
};

const sizeStyles =
  "h-10 px-4 py-2 inline-flex items-center justify-center";

const textStyles =
  "text-[var(--light-destructive-foreground)] text-sm font-medium font-['Inter'] leading-5";

const baseStyles =
  "rounded-md transition-colors";

const disabledStyles =
  "bg-[var(--background-interactive-neutral-disabled)] text-[var(--text-interactive-neutral-disabled)] cursor-not-allowed";

/* ===========================
   Tone styles
=========================== */
const toneStyles: Record<Tone, string> = {
  base:
    "bg-[var(--foundation-red-500)] hover:bg-[var(--foundation-red-600)]",
  strong:
    "bg-[var(--foundation-red-600)] hover:bg-[var(--foundation-red-700)]",
  soft:
    "bg-[var(--foundation-red-400)] hover:bg-[var(--foundation-red-500)]",
  lighter:
    "bg-[var(--foundation-red-200)] hover:bg-[var(--foundation-red-300)]",
};

export function DestructiveButton({
  tone = "base",
  disabled,
  className,
  children,
  ...props
}: DestructiveButtonProps) {
  return (
    <Button
      disabled={disabled}
      className={cn(
        baseStyles,
        sizeStyles,
        textStyles,
        disabled ? disabledStyles : toneStyles[tone],
        !disabled && "cursor-pointer",
        className
      )}
      {...props}
    >
      <span className="text-center">{children}</span>
    </Button>
  );
}
