"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type DisabledReason = "SOLD_OUT" | "ENDED" | "ETC";

type Props = {
    /** 예매 오픈 시각 (둘 중 하나만 넘기면 됨) */
    saleAtISO?: string; // e.g. "2026-03-29T13:00:00+09:00"
    saleAt?: Date | null;

    /** 오픈 이후 클릭 핸들러 */
    onClick: () => void;

    /** 오픈 이후 disabled 처리(예: 매진/종료면 true) */
    disabled?: boolean;

    disabledReason?: DisabledReason;

    /** 오픈 전/후 버튼 텍스트 커스텀 */
    openLabel?: string; // default: "예매하기"

    /** 클래스 확장 */
    className?: string;

    /**
     * 기본은 mm:ss (00 : 01)
     * 필요하면 "D-1" 같은 형태로 바꾸려고 formatter 주입 가능
     */
    countdownFormatter?: (remainingSec: number) => string;
};

function pad2(n: number) {
    return String(n).padStart(2, "0");
}

function defaultFormatMMSS(totalSeconds: number) {
    const s = Math.max(0, totalSeconds);
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return `${pad2(mm)} : ${pad2(ss)}`;
}

function useCountdown(targetAt: Date | null) {
    const [remainingSec, setRemainingSec] = React.useState<number>(0);

    React.useEffect(() => {
        if (!targetAt) return;

        const tick = () => {
            const diffMs = targetAt.getTime() - Date.now();
            const sec = Math.ceil(diffMs / 1000); // 1초 단위로 자연스럽게
            setRemainingSec(sec);
        };

        tick();
        const id = window.setInterval(tick, 1000);
        return () => window.clearInterval(id);
    }, [targetAt?.getTime()]);

    const isBefore = targetAt ? remainingSec > 0 : false;
    const isOpen = targetAt ? remainingSec <= 0 : true;

    return { remainingSec, isBefore, isOpen };
}

export function BookingButton({
    saleAtISO,
    saleAt,
    onClick,
    disabled = false,
    disabledReason = "ETC",
    openLabel = "예매하기",
    className,
    countdownFormatter,
}: Props) {
    const targetAt = React.useMemo<Date | null>(() => {
        if (saleAt instanceof Date) return saleAt;
        if (typeof saleAtISO === "string" && saleAtISO.length > 0) return new Date(saleAtISO);
        return null;
    }, [saleAt, saleAtISO]);

    const { remainingSec, isBefore, isOpen } = useCountdown(targetAt);

    // 오픈 전: 타이머(Disabled)
    if (isBefore) {
        const text = (countdownFormatter ?? defaultFormatMMSS)(remainingSec);

        return (
            <div
                data-size="Large"
                data-state="Disabled"
                className={cn(
                    "w-full h-10 min-w-20 px-4 py-2 rounded-md inline-flex justify-center items-center",
                    "bg-[var(--foundation-neutral-900)]",
                    className
                )}
            >
                <div className="flex-1 text-center text-[var(--foundation-neutral-720)] text-sm font-semibold font-['Pretendard'] leading-5">
                    {text}
                </div>
            </div>
        );
    }

    // 오픈 후
    if (isOpen && disabled) {
        const disabledLabel =
            disabledReason === "SOLD_OUT" ? "매진" : disabledReason === "ENDED" ? "예매 마감" : "예매 불가";

        const disabledTextClass =
            disabledReason === "SOLD_OUT"
                ? "text-[var(--foundation-neutral-720)]"
                : disabledReason === "ENDED"
                    ? "text-[var(--foundation-neutral-720)]"
                    : "text-[var(--foundation-neutral-white)]";

        return (
            <button
                type="button"
                disabled
                className={cn(
                    "w-full h-10 min-w-20 px-4 py-2 rounded-md flex justify-center items-center",
                    "bg-[var(--foundation-neutral-900)] cursor-not-allowed",
                    className
                )}
            >
                <div className={cn("text-sm font-semibold font-['Pretendard'] leading-5", disabledTextClass)}>
                    {disabledLabel}
                </div>
            </button>
        );
    }
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "cursor-pointer w-full h-10 min-w-20 px-4 py-2 rounded-md flex justify-center items-center",
                "bg-[var(--foundation-primary-500)] hover:bg-[var(--foundation-primary-600)]",
                className
            )}
        >
            <div className="text-[var(--foundation-neutral-white)] text-sm font-semibold font-['Pretendard'] leading-5">
                {openLabel}
            </div>
        </button>
    );
}
