"use client";

import { cn } from "@/lib/utils";

type SeatColor = "orange" | "red" | "navy" | "green" | "gray" | "purple" | "blue";

export type SeatRecommendItem = {
    id: string;
    seatLabel: string;
    blockLabel: string;
    blockNumber: number;
    remainCount: number;
    remainingSeatCount: number;
    priceText: string;
    color: SeatColor;
};

type Props = {
    items: SeatRecommendItem[];
    selectedId?: string | null;
    className?: string;
    onItemClick?: (item: SeatRecommendItem) => void;
    onItemHover?: (item: SeatRecommendItem) => void;
    onItemLeave?: () => void;
};

const badgeClassMap: Record<SeatColor, string> = {
    orange:
        "bg-[var(--foundation-orange-500)] outline-[var(--foundation-orange-400)]",
    red:
        "bg-[var(--foundation-red-500)] outline-[var(--foundation-red-400)]",
    navy:
        "bg-indigo-900 outline-slate-600",
    green:
        "bg-lime-600 outline-lime-500",
    gray:
        "bg-[var(--foundation-brown-500)] outline-[var(--foundation-brown-400)",
    purple:
        "bg-[var(--foundation-purple-500)] outline-[var(--foundation-purple-400)",
    blue:
        "bg-[var(--foundation-blue-500)] outline-[var(--foundation-blue-400)",

};

export function SeatRecommendSummaryCard({
    items,
    selectedId,
    className,
    onItemClick,
    onItemHover,
    onItemLeave,
}: Props) {
    return (
        <div
            className={cn(
                "inline-flex w-full flex-col items-start gap-3 self-stretch overflow-hidden",
                className
            )}
        >
            {items.map((item) => {
                const isSelected = item.id === selectedId;

                return (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onItemClick?.(item)}
                        onMouseEnter={() => onItemHover?.(item)}
                        onMouseLeave={() => onItemLeave?.()}
                        className={cn(
                            "inline-flex w-full flex-col justify-start items-start gap-3 overflow-hidden rounded-lg p-4 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] text-left transition-colors",
                            isSelected
                                ? "bg-gradient-to-b from-[var(--foundation-primary-10)] to-white outline-[var(--foundation-primary-500)]"
                                : "bg-[var(--background-white)] outline-[var(--stroke-interactive-neutral-default)] hover:bg-[var(--background-grey)] hover:outline-[var(--foundation-neutral-760)]"
                        )}
                    >
                        <div className="self-stretch flex flex-col justify-start items-start gap-3">
                            <div
                                className={cn(
                                    "inline-flex h-6 items-center justify-center rounded-[100px] p-2 outline outline-1 outline-offset-[-1px]",
                                    badgeClassMap[item.color]
                                )}
                            >
                                <div className="text-center text-xs font-semibold leading-5 text-[var(--foundation-neutral-white)] font-['Pretendard']">
                                    {item.seatLabel}
                                </div>
                            </div>

                            <div className="self-stretch inline-flex justify-start items-start gap-1">
                                <div className="text-right justify-center text-xl font-semibold leading-8 text-[var(--foundation-neutral-160)] font-['Pretendard_Variable']">
                                    {item.blockLabel}
                                </div>

                                <div className="flex flex-1 justify-end">
                                    <div className="inline-flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-4">
                                        <div className="inline-flex items-center gap-0.5 whitespace-nowrap">
                                            <span className="text-sm font-normal leading-6 text-[var(--foundation-neutral-600)] font-['Pretendard']">
                                                이용 가능 연석
                                            </span>
                                            <span className="pl-0.5 text-base font-semibold leading-6 text-[var(--foundation-primary-600)] font-['Pretendard_Variable']">
                                                {item.remainingSeatCount}개
                                            </span>
                                        </div>

                                        <div className="inline-flex items-center gap-0.5 whitespace-nowrap">
                                            <span className="text-sm font-normal leading-6 text-[var(--foundation-neutral-600)] font-['Pretendard']">
                                                잔여 좌석
                                            </span>
                                            <span className="pl-0.5 text-base font-semibold leading-6 text-[var(--foundation-primary-600)] font-['Pretendard_Variable']">
                                                {item.remainCount}석
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
