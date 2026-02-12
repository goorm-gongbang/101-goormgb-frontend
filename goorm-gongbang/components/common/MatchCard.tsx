"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

type MatchCardVariant = "default" | "comingSoon" | "soldOut" | "ended";

type Team = {
    ko: string;
    en: string;
    logo?: React.ReactNode;
    logoSrc?: string;
    dataLogo?: string;
};

type Props = {
    className?: string;
    elevated?: boolean;
    withOutline?: boolean;
    variant?: MatchCardVariant;

    dateText: string;
    timeText: string;

    stadiumKo: string;
    stadiumEn: string;

    away: Team;
    home: Team;

    overlayTopText?: string;
    overlayMainText?: string;

    disabledLook?: boolean;
};

export function MatchCard({
    className,
    elevated = false,
    withOutline = false,
    variant = "default",

    dateText,
    timeText,
    stadiumKo,
    stadiumEn,

    away,
    home,

    overlayTopText,
    overlayMainText,

    disabledLook,
}: Props) {
    const isOverlay = variant !== "default";
    const isDisabledLook = disabledLook ?? isOverlay;

    const textPrimary = isDisabledLook
        ? "text-[var(--foundation-neutral-720)]"
        : "text-[var(--foundation-neutral-240)]";
    const textSecondary = isDisabledLook
        ? "text-[var(--foundation-neutral-720)]"
        : "text-[var(--foundation-neutral-600)]";

    const overlayGradient =
        variant === "comingSoon"
            ? "from-[var(--foundation-neutral-white)] to-[var(--foundation-neutral-480)] opacity-40"
            : variant === "soldOut" || variant === "ended"
                ? "from-[var(--foundation-neutral-white)] to-[var(--foundation-neutral-720)] opacity-60"
                : "";

    const overlayOutline = withOutline
        ? "outline outline-1 outline-offset-[-0.50px] outline-[var(--foundation-neutral-880)]"
        : "";

    const overlayTop =
        overlayTopText ??
        (variant === "comingSoon"
            ? "Coming Soon"
            : variant === "soldOut"
                ? "Sold Out"
                : variant === "ended"
                    ? "Ended"
                    : "");

    const overlayMain =
        overlayMainText ??
        (variant === "comingSoon"
            ? "0월 0일 00:00 오픈"
            : variant === "soldOut"
                ? "예매 마감"
                : variant === "ended"
                    ? "경기 종료"
                    : "");

    const renderLogo = (team: Team, imgClassName: string) => {
        if (team.logo) return team.logo;
        if (team.logoSrc) return <img className={imgClassName} src={team.logoSrc} alt={team.en} />;
        return null;
    };

    return (
        <div
            className={cn(
                elevated && "shadow-[0px_0px_12px_0px_rgba(0,0,0,0.08)] rounded-2xl",
                "w-full inline-flex justify-start items-start",
                className
            )}
        >
            <div className="w-full h-28 relative">
                <div
                    className={cn(
                        "w-full h-28 overflow-hidden bg-[var(--foundation-neutral-white)] rounded-2xl",
                        "px-4 sm:px-6 lg:px-9",
                        withOutline && "outline outline-1 outline-offset-[-1px] outline-[var(--foundation-neutral-880)]",
                        "flex items-center"
                    )}
                >
                    <div className="w-full flex items-center justify-between gap-3 sm:gap-4 md:gap-6 lg:gap-8 min-w-0">
                        <div className="flex items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 min-w-0">
                            <div className="flex items-center gap-4 sm:gap-6 md:gap-8 min-w-0">
                                <div className="inline-flex flex-col justify-center items-center shrink-0">
                                    <div className="self-stretch justify-center">
                                        <span className={cn(textPrimary, "text-xl font-medium font-['Pretendard'] leading-8")}>
                                            {dateText}
                                            <br />
                                        </span>
                                        <span className={cn(textSecondary, "text-xs font-normal font-['Pretendard'] leading-4")}>
                                            {timeText}
                                        </span>
                                    </div>
                                </div>

                                <div className="hidden sm:inline-flex w-32 sm:w-40 md:w-48 lg:w-56 self-stretch flex-col justify-center items-start gap-px min-w-0">
                                    <div className="self-stretch h-12 min-w-0">
                                        <div
                                            className={cn(textPrimary, "text-base font-medium font-['Pretendard'] leading-6 truncate")}
                                            title={stadiumKo}
                                        >
                                            {stadiumKo}
                                        </div>
                                        <div
                                            className={cn(textSecondary, "text-xs font-normal font-['Pretendard'] leading-4 truncate")}
                                            title={stadiumEn}
                                        >
                                            {stadiumEn}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="h-28 flex justify-center items-center gap-3 md:gap-4 min-w-0">
                                {/* Away name */}
                                <div className="hidden sm:inline-flex w-20 sm:w-24 md:w-28 lg:w-32 self-stretch flex-col justify-center items-center min-w-0">
                                    <div className="self-stretch h-12 min-w-0">
                                        <div
                                            className={cn(textPrimary, "text-sm font-semibold font-['Pretendard'] leading-5 truncate")}
                                            title={away.ko}
                                        >
                                            {away.ko}
                                        </div>
                                        <div
                                            className={cn(textSecondary, "text-xs font-normal font-['Pretendard'] leading-4 truncate")}
                                            title={away.en}
                                        >
                                            {away.en}
                                        </div>
                                    </div>
                                </div>


                                <div
                                    data-logo={away.dataLogo ?? away.ko}
                                    data-mode="Color"
                                    data-size="small"
                                    className={cn(
                                        "h-28 px-[3.13px] py-9 bg-white inline-flex flex-col justify-center items-center gap-1.5 overflow-hidden shrink-0",
                                        isDisabledLook && "opacity-30"
                                    )}
                                >
                                    <div className="w-24 flex flex-col justify-center items-center gap-2">
                                        {renderLogo(away, "w-24 h-14")}
                                    </div>
                                </div>

                                <div className={cn("text-center text-xs font-normal font-['Pretendard'] leading-4 shrink-0", textPrimary)}>
                                    VS
                                </div>

                                <div
                                    data-logo={home.dataLogo ?? home.ko}
                                    data-mode="Color"
                                    data-size="small"
                                    className={cn(
                                        "h-28 px-[3.13px] py-6 bg-white inline-flex flex-col justify-center items-center gap-1.5 overflow-hidden shrink-0",
                                        isDisabledLook && "opacity-30"
                                    )}
                                >
                                    <div className="w-24 flex flex-col justify-center items-center gap-2">
                                        {renderLogo(home, "self-stretch h-20")}
                                    </div>
                                </div>

                                {/* Home name */}
                                <div className="hidden sm:flex w-20 sm:w-24 md:w-28 lg:w-32 self-stretch justify-center items-center min-w-0">
                                    <div className="flex-1 h-12 inline-flex flex-col justify-start items-end min-w-0">
                                        <div className="self-stretch text-right min-w-0">
                                            <div
                                                className={cn(textPrimary, "text-sm font-semibold font-['Pretendard'] leading-5 truncate")}
                                                title={home.ko}
                                            >
                                                {home.ko}
                                            </div>
                                            <div
                                                className={cn(textSecondary, "text-xs font-normal font-['Pretendard'] leading-4 truncate")}
                                                title={home.en}
                                            >
                                                {home.en}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ChevronRight */}
                        <div className="w-9 h-12 flex items-center justify-center shrink-0">
                            <ChevronRight
                                className={cn(
                                    "h-12 w-12 md:h-12 md:w-12",
                                    variant === "soldOut" || variant === "ended"
                                        ? "text-[var(--foundation-secondary-900)]"
                                        : "text-[var(--foundation-primary-500)]"
                                )}
                                strokeWidth={1}
                                aria-hidden="true"
                            />
                        </div>
                    </div>
                </div>

                {isOverlay && (
                    <>
                        <div className={cn("absolute inset-0 bg-gradient-to-r rounded-2xl", overlayGradient, overlayOutline)} />
                        <div className="absolute top-[28px] right-22 sm:right-22 lg:right-23 w-40 sm:w-52 inline-flex flex-col justify-center items-end min-w-0">
                            <div title={overlayTop} className="self-stretch opacity-50 text-right text-[var(--foundation-neutral-20)] text-sm font-semibold font-['Pretendard'] leading-5 truncate">
                                {overlayTop}
                            </div>
                            <div
                                title={overlayMain}
                                className={cn(
                                    "self-stretch text-right text-xl font-semibold font-['Pretendard'] leading-8 truncate",
                                    variant === "soldOut" || variant === "ended"
                                        ? "text-[var(--foundation-secondary-900)]"
                                        : "text-[var(--foundation-primary-700)]"
                                )}
                            >
                                {overlayMain}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
