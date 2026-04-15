"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
    value: number;
    onChange: (next: number) => void;

    /** 1~max 까지 옵션 생성 */
    max?: number;

    /** Trigger 스타일 커스텀 */
    className?: string;

    /** Dropdown content 클래스 추가 */
    contentClassName?: string;

    /** 비활성화 */
    disabled?: boolean;

    /** aria-label */
    ariaLabel?: string;
};

export function DropDown({
    value,
    onChange,
    max = 10,
    className,
    contentClassName,
    disabled = false,
    ariaLabel = "값 선택",
}: Props) {
    const options = React.useMemo(() => {
        const m = Math.max(1, Math.floor(max));
        return Array.from({ length: m }, (_, i) => i + 1);
    }, [max]);

    const safeValue = React.useMemo(() => {
        const m = Math.max(1, Math.floor(max));
        return Math.min(Math.max(1, Math.floor(value)), m);
    }, [value, max]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={disabled}>
                <button
                    type="button"
                    aria-label={ariaLabel}
                    className={cn(
                        "w-20 h-10 px-2 bg-[var(--foundation-neutral-white)] rounded-md",
                        "outline outline-1 outline-offset-[-1px] outline-[var(--foundation-neutral-880)]",
                        "inline-flex justify-end items-center gap-4",
                        disabled && "opacity-60 cursor-not-allowed",
                        className
                    )}
                >
                    <span className="flex-1 p-2 flex justify-end items-center gap-4">
                        <span className="text-right justify-center text-[var(--foundation-neutral-200)] text-base font-medium font-['Pretendard'] leading-6">
                            {safeValue}
                        </span>

                        <ChevronDown className="h-4 w-4 text-[var(--light-foreground)]" aria-hidden="true" />
                    </span>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className={cn(
                    "w-20 p-0 bg-[var(--foundation-neutral-white)] rounded-md",
                    "outline outline-1 outline-offset-[-1px] outline-[var(--foundation-neutral-880)]",
                    "max-h-56 overflow-y-auto scrollbar-hide",
                    contentClassName
                )}
            >
                {options.map((n) => {
                    const selected = n === safeValue;
                    return (
                        <DropdownMenuItem
                            key={n}
                            onSelect={() => onChange(n)}
                            className={cn(
                                "p-2 flex justify-end items-center gap-4",
                                "text-Text-normal(N240) text-base font-medium font-['Pretendard'] leading-6",
                                selected && "bg-[var(--foundation-neutral-920)]",
                                "focus:bg-[var(--foundation-neutral-920)]"
                            )}
                        >
                            <span className="w-full text-right">{n}</span>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
