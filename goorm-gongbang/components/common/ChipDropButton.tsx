"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TriangleDownIcon } from "@radix-ui/react-icons";

type Variant = "neutral" | "primary";
type UIState = "default" | "hover" | "disabled";

type Props = {
    label: string;
    variant?: Variant;
    uiState?: UIState;
    leftIcon?: React.ReactNode;
    showChevron?: boolean;
    onClick?: () => void;
    className?: string;
};

function getContainerStyles(variant: Variant, uiState: UIState) {
    // 기본값들
    const base =
        "min-w-20 px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] inline-flex justify-center items-center";

    // 배경/아웃라인 토큰은 네가 준 그대로 매핑
    if (uiState === "disabled") {
        return cn(
            base,
            "bg-[var(--foundation-neutral-white)]",
            "outline-[var(--foundation-neutral-900)]"
        );
    }

    if (uiState === "hover") {
        return cn(
            base,
            "bg-[var(--foundation-neutral-960)]",
            "outline-[var(--foundation-neutral-760)]"
        );
    }

    // default
    if (variant === "primary") {
        return cn(base, "bg-[var(--foundation-primary-10)]", "outline-[var(--foundation-primary-500)]");
    }
    return cn(base, "bg-[var(--foundation-neutral-white)]", "outline-[var(--foundation-neutral-800)]");
}

function getLabelStyles(variant: Variant, uiState: UIState) {
    const base = "text-center justify-center text-sm font-normal font-['Pretendard'] leading-5";

    if (uiState === "disabled") {
        return cn(base, "text-[var(--foundation-neutral-720)]");
    }

    if (variant === "primary") {
        return cn(base, "text-[var(--foundation-primary-700)]");
    }

    return cn(base, "text-[var(--foundation-neutral-240)]");
}

/* 왼쪽 아이콘 자리 */
function LeftIconSlot({
    children,
    uiState,
}: {
    children: React.ReactNode;
    uiState: UIState;
}) {
    const iconColor =
        uiState === "disabled"
            ? "text-[var(--foundation-neutral-900)]"
            : "text-[var(--foundation-primary-500)]";

    return (
        <div className="w-6 h-6 pr-1 flex justify-start items-center gap-2.5">
            <div className="flex-1 self-stretch relative overflow-hidden">
                {children ? (
                    <div className={cn("absolute inset-0 flex items-center justify-center", iconColor)}>
                        {children}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export function ChipDropButton({
    label,
    variant = "neutral",
    uiState = "default",
    leftIcon,
    showChevron = true,
    onClick,
    className,
}: Props) {
    const disabled = uiState === "disabled";

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={disabled ? undefined : onClick}
            className={cn(getContainerStyles(variant, uiState), className)}
        >
            {/* Left icon (optional) */}
            {leftIcon ? <LeftIconSlot uiState={uiState}>{leftIcon}</LeftIconSlot> : null}

            {/* Label */}
            <div className="flex justify-center items-center gap-2.5">
                <div className={getLabelStyles(variant, uiState)}>{label}</div>
            </div>

            {/* TriangleDownIcon */}
            {showChevron ? (
                <div className="pl-2 flex justify-start items-center gap-2.5">
                    <TriangleDownIcon
                        className={cn(
                            "h-4 w-4",
                            uiState === "disabled"
                                ? "text-[var(--foundation-neutral-900)]"
                                : "text-[var(--foundation-primary-400)]"
                        )}
                    />
                </div>
            ) : null}
        </button>
    );
}
