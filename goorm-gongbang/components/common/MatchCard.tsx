"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { TicketStatusBadge } from "@/components/common/TicketStatusBadge";

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
    variant?: MatchCardVariant;

    dateText: string;
    timeText: string;

    stadiumKo: string;
    stadiumEn: string;

    away: Team;
    home: Team;
};

export function MatchCard({
    className,
    elevated = false,
    variant = "default",

    dateText,
    timeText,
    stadiumKo,
    stadiumEn,

    away,
    home,
}: Props) {
    const badgeStatus =
        variant === "soldOut" ? "soldOut"
        : variant === "comingSoon" ? "upcoming" 
        : variant === "ended" ? "soldOut"
        : "available";


    const renderLogo = (team: Team, imgClassName: string) => {
        if (team.logo) return team.logo;
        if (team.logoSrc) return <img className={imgClassName} src={team.logoSrc} alt={team.en} />;
        return null;
    };

    return (
        <div
            className={cn(
                elevated && "rounded-2xl",
                "w-full inline-flex justify-start items-start",
                className
            )}
        >
            <div className="w-full h-28 relative">
                <div
                    className={cn(
                        "w-full h-28 overflow-hidden bg-[var(--foundation-neutral-white)] rounded-2xl",
                        "px-4 sm:px-6 lg:px-9",
                        "outline outline-1 outline-offset-[-1px] outline-[var(--foundation-neutral-880)]",
                        "flex items-center",
                        "hover:shadow-[0px_0px_12px_0px_rgba(0,0,0,0.08)]"
                    )}
                >
                    <div className="w-full flex items-center justify-between gap-3 sm:gap-4 md:gap-6 lg:gap-8 min-w-0">
                        <div className="flex items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 min-w-0">
                            <div className="flex items-center gap-4 sm:gap-6 md:gap-8 min-w-0">
                                <div className="inline-flex flex-col justify-center items-center shrink-0">
                                    <div className="self-stretch justify-center">
                                        <span className={cn("text-[var(--foundation-neutral-240)] text-xl font-medium font-['Pretendard'] leading-8")}>
                                            {dateText}
                                            <br />
                                        </span>
                                        <span className={cn("text-[var(--foundation-neutral-600)] text-xs font-normal font-['Pretendard'] leading-4")}>
                                            {timeText}
                                        </span>
                                    </div>
                                </div>

                                <div className="hidden sm:inline-flex w-32 sm:w-40 md:w-48 lg:w-56 self-stretch flex-col justify-center items-start gap-px min-w-0">
                                    <div className="self-stretch h-12 min-w-0">
                                        <div
                                            className={cn("text-[var(--foundation-neutral-240)] text-base font-medium font-['Pretendard'] leading-6 truncate")}
                                            title={stadiumKo}
                                        >
                                            {stadiumKo}
                                        </div>
                                        <div
                                            className={cn("text-[var(--foundation-neutral-600)] text-xs font-normal font-['Pretendard'] leading-4 truncate")}
                                            title={stadiumEn}
                                        >
                                            {stadiumEn}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="h-28 flex justify-center items-center gap-3 md:gap-4 min-w-0">

                                {/* Home name */}
                                <div className="hidden sm:flex w-20 sm:w-24 md:w-28 lg:w-32 self-stretch justify-center items-center min-w-0">
                                    <div className="flex-1 h-12 inline-flex flex-col justify-start items-end min-w-0">
                                        <div className="self-stretch text-right min-w-0">
                                            <div
                                                className={cn("text-[var(--foundation-neutral-240)] text-sm font-semibold font-['Pretendard'] leading-5 truncate")}
                                                title={home.ko}
                                            >
                                                {home.ko}
                                            </div>
                                            <div
                                                className={cn("text-[var(--foundation-neutral-600)] text-xs font-normal font-['Pretendard'] leading-4 truncate")}
                                                title={home.en}
                                            >
                                                {home.en}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    data-logo={home.dataLogo ?? home.ko}
                                    data-mode="Color"
                                    data-size="small"
                                    className={cn(
                                        "h-28 px-[3.13px] py-6 bg-white inline-flex flex-col justify-center items-center gap-1.5 overflow-hidden shrink-0",
                                        "text-[var(--foundation-neutral-240)]"
                                    )}
                                >
                                    <div className="w-24 flex flex-col justify-center items-center gap-2">
                                        {renderLogo(home, "self-stretch h-20")}
                                    </div>
                                </div>

                                <div className={cn("text-center text-xs font-normal font-['Pretendard'] leading-4 shrink-0 text-[var(--foundation-neutral-240)]")}>
                                    VS
                                </div>

                                <div
                                    data-logo={away.dataLogo ?? away.ko}
                                    data-mode="Color"
                                    data-size="small"
                                    className={cn(
                                        "h-28 px-[3.13px] py-9 bg-white inline-flex flex-col justify-center items-center gap-1.5 overflow-hidden shrink-0",
                                        "text-[var(--foundation-neutral-240)]"
                                    )}
                                >
                                    <div className="w-24 flex flex-col justify-center items-center gap-2">
                                        {renderLogo(away, "w-24 h-14")}
                                    </div>
                                </div>

                                {/* Away name */}
                                <div className="hidden sm:inline-flex w-20 sm:w-24 md:w-28 lg:w-32 self-stretch flex-col justify-center items-center min-w-0">
                                    <div className="self-stretch h-12 min-w-0">
                                        <div
                                            className={cn("text-[var(--foundation-neutral-240)] text-sm font-semibold font-['Pretendard'] leading-5 truncate")}
                                            title={away.ko}
                                        >
                                            {away.ko}
                                        </div>
                                        <div
                                            className={cn("text-[var(--foundation-neutral-600)] text-xs font-normal font-['Pretendard'] leading-4 truncate")}
                                            title={away.en}
                                        >
                                            {away.en}
                                        </div>
                                    </div>
                                </div>
                                <TicketStatusBadge status={badgeStatus} />
                            </div>
                        </div>

                        {/* ChevronRight */}
                        <div className="w-9 h-12 flex items-center justify-center shrink-0">
                            <ChevronRight
                                className={cn(
                                    "h-12 w-12 md:h-12 md:w-12",
                                    "text-[var(--foundation-neutral-600)]"
                                )}
                                strokeWidth={1}
                                aria-hidden="true"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
