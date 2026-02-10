"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
    className?: string;

    /** data-logo 값 (예: "두산") */
    dataLogo: string;

    /** 팀 이름 (예: "두산 베어스") */
    teamName: string;

    /** 로고를 컴포넌트로 전달 (예: <IconPreview index={7} size="md" />) */
    logo: React.ReactNode;

    /** 버튼 텍스트 (기본: "상세 보기") */
    buttonText?: string;

    /** 버튼 클릭 */
    onButtonClick?: () => void;

    /** 카드 전체 클릭 */
    onClick?: () => void;

    /** 버튼 비활성 */
    buttonDisabled?: boolean;

    /** 로고 박스 class 추가 */
    logoBoxClassName?: string;

    hoverOverlay?: boolean;
};

export function TeamInfoCard({
    className,
    dataLogo,
    teamName,
    logo,
    buttonText = "상세 보기",
    onButtonClick,
    onClick,
    buttonDisabled = false,
    logoBoxClassName,
    hoverOverlay = true,
}: Props) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative rounded-2xl outline outline-1 outline-offset-[-1px]",
                "outline-[var(--foundation-neutral-880)]",
                "self-stretch px-4 py-3 inline-flex flex-col justify-start items-start gap-1.5",
                onClick && "cursor-pointer",
                className
            )}
        >
            {hoverOverlay && (
                <div
                    aria-hidden
                    className={cn(
                        "pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity",
                        "group-hover:opacity-30",
                        "bg-gradient-to-b from-[var(--foundation-primary-300)]/50 to-zinc-300/50"
                    )}
                />
            )}

            {/* Logo box */}
            <div
                data-logo={dataLogo}
                data-mode="Color"
                data-size="small"
                className={cn(
                    "w-full h-32 px-1 py-2.5 bg-[var(--background-grey)] flex flex-col justify-center items-center gap-1.5 overflow-hidden",
                    logoBoxClassName
                )}
            >
                <div className="flex flex-col justify-center items-center">
                    {logo}
                </div>
            </div>

            {/* Team name */}
            <div className="self-stretch flex flex-col justify-center items-center">
                <div className="self-stretch inline-flex justify-center items-center">
                    <div className="text-center justify-center text-[var(--foundation-neutral-20)] text-xs font-medium font-['Pretendard'] leading-4">
                        {teamName}
                    </div>
                </div>
            </div>

            {/* Button */}
            <button
                type="button"
                disabled={buttonDisabled}
                onClick={(e) => {
                    e.stopPropagation(); // 카드 클릭과 분리
                    onButtonClick?.();
                }}
                className={cn(
                    "cursor-pointer self-stretch h-6 min-w-14 p-2 rounded-md outline outline-1 outline-offset-[-1px] outline-[var(--foundation-primary-500)] inline-flex justify-center items-center",
                    "group-hover:bg-[var(--foundation-primary-10)]",
                    buttonDisabled && "opacity-50 cursor-not-allowed"
                )}
            >
                <span className="flex-1 text-center justify-center text-[var(--foundation-primary-500)] text-xs font-semibold font-['Pretendard'] leading-4">
                    {buttonText}
                </span>
            </button>
        </div>
    );
}
