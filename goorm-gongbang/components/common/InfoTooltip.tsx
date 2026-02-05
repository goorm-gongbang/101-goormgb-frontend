"use client";

import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";

type InfoTooltipProps = {
    /** 툴팁 안에 들어갈 내용 */
    content: React.ReactNode;
    /** 버튼 접근성 라벨 */
    ariaLabel?: string;
    /** 툴팁 가로폭 */
    widthClassName?: string;
    /** 툴팁 세로폭 */
    heightClassName?: string;
    /** 아이콘 색상 */
    iconClassName?: string;
    /** 아이콘 클릭 시 색상 */
    activeIconClassName?: string;
    /** (옵션) 바깥에서 열기/닫기 제어하고 싶을 때 */
    defaultOpen?: boolean;
};

export function InfoTooltip({
    content,
    ariaLabel = "안내",
    widthClassName = "w-[299px]",
    heightClassName = "h-[120px]",
    iconClassName = "text-[var(--foundation-neutral-600,#999999)]",
    activeIconClassName = "text-[var(--foundation-primary-500,#00C292)]",
    defaultOpen = false,
}: InfoTooltipProps) {
    const [open, setOpen] = useState(defaultOpen);
    const wrapRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const onDown = (e: MouseEvent) => {
            if (!wrapRef.current) return;
            if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };

        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, []);

    return (
        <div ref={wrapRef} className="relative inline-flex items-center">
            <button
                type="button"
                aria-label={ariaLabel}
                aria-haspopup="dialog"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-black/5"
            >
                <Info 
                    className={[
                        "h-4 w-4 transition",
                        open ? activeIconClassName : iconClassName,
                    ].join(" ")}
                />
            </button>

            {open && (
                <div
                    role="dialog"
                    aria-label={`${ariaLabel} 툴팁`}
                    className={`
                        absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50
                        ${widthClassName}
                        ${heightClassName}
                        rounded-lg bg-[var(--light-background,#fff)]
                        shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)]
                        outline outline-1 outline-offset-[-1px] outline-[var(--light-border,#E6E6E6)]
                        p-4
                    `}
                >
                    {/* 화살표(왼쪽 방향) */}
                    <div
                        className="
                            absolute -left-2 top-1/2 -translate-y-1/2
                            h-0 w-0
                            border-y-8 border-y-transparent
                            border-r-8 border-r-[var(--light-border,#E6E6E6)]
                        "
                    />
                    <div
                        className="
                            absolute -left-[7px] top-1/2 -translate-y-1/2
                            h-0 w-0
                            border-y-[7px] border-y-transparent
                            border-r-[7px] border-r-[var(--light-background,#fff)]
                        "
                    />
                    <div className="w-full h-full text-left break-words">
                        {content}
                    </div>
                </div>
            )}
        </div>
    );
}
