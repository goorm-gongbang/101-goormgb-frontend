import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tone = "strong" | "base" | "soft";

type ShadcnButtonProps = React.ComponentProps<typeof Button>;

type ButtonWithIconProps = Omit<ShadcnButtonProps, "size" | "variant"> & {
    tone?: Tone;
    leftIcon?: React.ReactNode;
};

const sizeStyles = "h-10 px-4 py-2 inline-flex items-center justify-center text-sm";

const iconSizeStyles = "w-4 h-4";

// const iconWrapperStyles = "pr-2 flex items-center";
const iconWrapperStyles = "";

const disabledStyles =
    "bg-[var(--background-interactive-neutral-disabled)] text-[var(--text-interactive-neutral-disabled)] cursor-not-allowed";

/* ===========================
   Primary
=========================== */
const primaryToneStyles: Record<Tone, string> = {
    strong: "bg-[var(--foundation-primary-600)] text-[var(--foundation-neutral-white)] hover:bg-[var(--foundation-primary-700)]",
    base: "bg-[var(--foundation-primary-500)] text-[var(--foundation-neutral-white)] hover:bg-[var(--foundation-primary-600)]",
    soft: "bg-[var(--foundation-primary-400)] text-[var(--foundation-neutral-white)] hover:bg-[var(--foundation-primary-500)]",
};

export function PrimaryButtonWithIcon({
    tone = "base",
    leftIcon,
    children,
    disabled,
    className,
    ...props
}: ButtonWithIconProps) {
    return (
        <Button
            disabled={disabled}
            className={cn(
                "rounded-md font-['Pretendard'] font-medium leading-5 transition",
                sizeStyles,
                disabled ? disabledStyles : primaryToneStyles[tone],
                !disabled && "cursor-pointer hover:brightness-95",
                className
            )}
            {...props}
        >
            {leftIcon && (
                <span className={iconWrapperStyles}>
                    <span className={cn("flex-shrink-0", iconSizeStyles)}>{leftIcon}</span>
                </span>
            )}
            <span className="text-center">{children}</span>
        </Button>
    );
}

/* ===========================
   Secondary
=========================== */
const secondaryToneStyles: Record<Tone, string> = {
    strong:
        "bg-[var(--foundation-primary-10)] border border-[var(--Foundation-Primary-600)] text-[var(--foundation-primary-600)] hover:bg-[var(--foundation-primary-20)]",
    base:
        "bg-transparent border border-[var(--Foundation-Primary-500)] text-[var(--foundation-primary-500)] hover:bg-[var(--foundation-primary-10)]",
    soft:
        "bg-transparent border border-[var(--Foundation-Primary-400)] text-[var(--foundation-primary-400)] hover:bg-[var(--foundation-primary-10)]",
};

export function SecondaryButtonWithIcon({
    tone = "base",
    leftIcon,
    children,
    disabled,
    className,
    ...props
}: ButtonWithIconProps) {
    return (
        <Button
            disabled={disabled}
            className={cn(
                "rounded-md font-['Pretendard'] font-medium leading-5 transition",
                sizeStyles,
                disabled ? disabledStyles : secondaryToneStyles[tone],
                !disabled && "cursor-pointer",
                className
            )}
            {...props}
        >
            {leftIcon && (
                <span className={iconWrapperStyles}>
                    <span className={cn("flex-shrink-0", iconSizeStyles)}>{leftIcon}</span>
                </span>
            )}
            <span className="text-center">{children}</span>
        </Button>
    );
}

/* ===========================
   Tertiary
=========================== */
const tertiaryToneStyles: Record<Tone, string> = {
    strong: "bg-transparent text-[var(--foundation-primary-600)] hover:bg-[var(--foundation-primary-10)]",
    base: "bg-transparent text-[var(--foundation-primary-500)] hover:bg-[var(--foundation-primary-10)]",
    soft: "bg-[var(--foundation-primary-10)] text-[var(--foundation-primary-500)] hover:bg-[var(--foundation-primary-20)]",
};

export function TertiaryButtonWithIcon({
    tone = "base",
    leftIcon,
    children,
    disabled,
    className,
    ...props
}: ButtonWithIconProps) {
    return (
        <Button
            disabled={disabled}
            className={cn(
                "rounded-md font-['Pretendard'] font-medium leading-5 transition",
                sizeStyles,
                disabled ? disabledStyles : tertiaryToneStyles[tone],
                !disabled && "cursor-pointer",
                className
            )}
            {...props}
        >
            {leftIcon && (
                <span className={iconWrapperStyles}>
                    <span className={cn("flex-shrink-0", iconSizeStyles)}>{leftIcon}</span>
                </span>
            )}
            <span className="text-center">{children}</span>
        </Button>
    );
}
