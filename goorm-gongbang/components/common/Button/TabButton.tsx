"use client";

import { cn } from "@/lib/utils";

type Props = {
    label: string;
    active: boolean;
    onClick: () => void;
    className?: string;
};

export function TabButton({ label, active, onClick, className }: Props) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "h-10 min-w-20 px-3 py-2 flex justify-center items-center",
                active
                    ? "border-b border-[var(--foundation-primary-500)]"
                    : "border-b border-transparent",
                className
            )}
        >
            <div
                className={cn(
                    "text-base font-medium font-['Pretendard'] leading-5",
                    active
                        ? "text-[var(--foundation-primary-500)]"
                        : "text-[var(--foundation-neutral-720)]"
                )}
            >
                {label}
            </div>
        </button>
    );
}
