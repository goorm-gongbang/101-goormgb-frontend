import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UiSize = "lg" | "md" | "sm";
type Tone = "strong" | "base" | "soft";

type ShadcnButtonProps = React.ComponentProps<typeof Button>;

type SecondaryButtonProps = Omit<ShadcnButtonProps, "size" | "variant"> & {
    uiSize?: UiSize;
    tone?: Tone;
};

const sizeStyles: Record<UiSize, string> = {
    lg: "h-10 min-w-20 px-4 py-2 text-sm",
    md: "h-9  min-w-20 px-4 py-2 text-sm",
    sm: "h-6  min-w-14 p-2 text-xs",
};

const toneStyles: Record<Tone, string> = {
  strong: "bg-[var(--foundation-primary-10)] border border-[var(--Foundation-Primary-600)] text-[var(--foundation-primary-600)] hover:bg-[var(--foundation-primary-20)]",
  base: "bg-transparent border border-[var(--Foundation-Primary-500)] text-[var(--foundation-primary-500)] hover:bg-[var(--foundation-primary-10)]",
  soft: "bg-transparent border border-[var(--Foundation-Primary-400)] text-[var(--foundation-primary-400)] hover:bg-[var(--foundation-primary-10)]",
};


const disabledStyles =
    "bg-[var(--background-interactive-neutral-disabled)] text-[var(--text-interactive-neutral-disabled)] cursor-not-allowed";

export function SecondaryButton ({
    uiSize = "lg",
    tone = "base",
    disabled,
    className,
    ...props
}: SecondaryButtonProps) {
    return (
        <Button
            disabled={disabled}
            className={cn(
                "rounded-md inline-flex justify-center items-center font-['Pretendard'] font-medium leading-5 transition",
                sizeStyles[uiSize],
                disabled ? disabledStyles : toneStyles[tone],
                !disabled && "cursor-pointer",
                className
            )}
            {...props}
        />
    );
}
