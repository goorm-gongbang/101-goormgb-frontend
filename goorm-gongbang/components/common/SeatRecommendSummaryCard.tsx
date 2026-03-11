"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "hover" | "focused";

type SeatLine = {
    left: string;   // "000석 000블럭 00열 00번, 00번"
    right: string;  // "0원/매"
};

type Props = {
    variant?: Variant;

    orderLabel?: string;        // "1순위"
    totalPriceText: string;     // "총 0원"

    seats: SeatLine[];          // 1~N 줄
    tags: string[];             // "# 1루 내야" 등

    className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

function getCardStyles(variant: Variant) {
    const base =
        "w-96 p-6 rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] inline-flex flex-col justify-start items-start gap-3 overflow-hidden";

    if (variant === "hover") {
        return cn(base, "bg-[var(--foundation-neutral-980)]", "outline-[var(--foundation-neutral-760)]");
    }

    if (variant === "focused") {
        return cn(
            base,
            "bg-gradient-to-b from-[var(--foundation-primary-10)] to-white",
            "outline-[var(--foundation-primary-500)]"
        );
    }

    // default
    return cn(base, "bg-[var(--foundation-neutral-white)]", "outline-[var(--foundation-neutral-880)]");
}

function OrderBadge({ label }: { label: string }) {
    return (
        <div
            data-order={label}
            className="h-6 p-2 bg-[var(--foundation-secondary-400)] rounded-[100px] outline outline-1 outline-offset-[-1px] outline-[var(--foundation-secondary-300)] flex justify-center items-center"
        >
            <div className="text-center justify-center text-[var(--foundation-neutral-white)] text-xs font-semibold font-['Pretendard'] leading-5">
                {label}
            </div>
        </div>
    );
}

function TagChip({ text }: { text: string }) {
    return (
        <div
            data-icon="off"
            data-size="Small"
            data-state="Selected"
            className="h-6 min-w-14 p-2 bg-[var(--foundation-primary-10)] rounded-[100px] outline outline-1 outline-offset-[-1px] outline-[var(--foundation-primary-500)] flex justify-center items-center"
        >
            <div className="flex-1 text-center justify-center text-[var(--foundation-primary-700)] text-xs font-normal font-['Pretendard'] leading-5">
                {text}
            </div>
        </div>
    );
}

export function SeatRecommendSummaryCard({
    variant = "default",
    orderLabel = "1순위",
    totalPriceText,
    seats,
    tags,
    className,
    ...divProps
}: Props) {
    return (
        <div className={cn(getCardStyles(variant), className)} {...divProps}>
            {/* Top area */}
            <div className="self-stretch flex flex-col justify-start items-start gap-0.5">
                <div className="self-stretch inline-flex justify-start items-center gap-2">
                    <OrderBadge label={orderLabel} />
                    <div className="flex-1 justify-center text-[var(--foundation-neutral-160)] text-xl font-bold font-['Pretendard'] leading-7">
                        {totalPriceText}
                    </div>
                </div>

                {seats.map((line, idx) => (
                    <div key={idx} className="self-stretch inline-flex justify-start items-start">
                        <div className="justify-center text-[var(--foundation-neutral-240)] text-sm font-semibold font-['Pretendard'] leading-5">
                            {line.left}
                        </div>
                        <div className="flex-1 text-right justify-center text-[var(--foundation-neutral-240)] text-sm font-medium font-['Pretendard'] leading-5">
                            {line.right}
                        </div>
                    </div>
                ))}
            </div>

            {/* Tags */}
            <div className="w-80 inline-flex justify-end items-start gap-2 flex-wrap content-start">
                {tags.map((t, i) => (
                    <TagChip key={`${t}-${i}`} text={t} />
                ))}
            </div>
        </div>
    );
}
