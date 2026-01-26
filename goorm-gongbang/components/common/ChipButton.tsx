import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UiSize = "lg" | "md" | "sm";
type Tone = "strong" | "base" | "soft";

type ShadcnButtonProps = React.ComponentProps<typeof Button>;

type ChipButtonProps = Omit<ShadcnButtonProps, "size" | "variant"> & {
    uiSize?: UiSize;
    tone?: Tone;
    leftIcon?: React.ReactNode;
};

const sizeStyles: Record<UiSize, string> = {
    lg: "h-10 min-w-20 px-4 py-2 text-sm",
    md: "h-9  min-w-20 px-4 py-2 text-sm",
    sm: "h-6  min-w-14 p-2 text-xs",
};

const toneStyles: Record<Tone, string> = {
  soft: "bg-[var(--foundation-neutral-white)] border border-[var(--foundation-neutral-800)] text-[var(--foundation-neutral-240)] hover:bg-[var(--foundation-neutral-940)]",
  base: "bg-[var(--foundation-neutral-white)] border border-[var(--foundation-neutral-640)] text-[var(--foundation-neutral-240)] hover:bg-[var(--foundation-neutral-940)]",
  strong: "bg-[var(--foundation-primary-10)] border border-[var(--foundation-primary-500)] text-[var(--foundation-primary-700)] hover:bg-[var(--foundation-primary-50)]",
};


const disabledStyles =
    "bg-[var(--background-interactive-neutral-disabled)] text-[var(--text-interactive-neutral-disabled)] cursor-not-allowed";

export function ChipButton ({
    uiSize = "lg",
    tone = "base",
    disabled,
    leftIcon,
    className,
    children,
    ...props
}: ChipButtonProps) {
    return (
        <Button
            disabled={disabled}
            className={cn(
                "rounded-[100px] inline-flex justify-center items-center font-['Pretendard'] font-medium leading-5 transition",
                sizeStyles[uiSize],
                disabled ? disabledStyles : toneStyles[tone],
                !disabled && "cursor-pointer",
                className
            )}
            {...props}
        >
            {leftIcon && (
                <span className="flex items-center shrink-0">
                {leftIcon}
                </span>
            )}
            <span>{children}</span>
        </Button>
    );
}
