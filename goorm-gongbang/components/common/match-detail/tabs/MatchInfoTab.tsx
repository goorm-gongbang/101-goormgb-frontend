"use client";

import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { AddressCopiedToast } from "@/components/common/match-detail/tabs/AddressCopiedToast";

type SeatPriceRow = {
    seatType: string;
    weekday: string;
    weekend: string;
};

type OutfieldPriceRow = {
    groupLabel?: string;
    category: string;
    weekday: string;
    weekend: string;
};

type Props = {
    homeKo: string;
    awayKo: string;
    ageLimitText: string;

    stadiumKo: string;
    stadiumAddress: string;

    matchAtText: string;

    seatPrices: SeatPriceRow[];
    outfieldPrices: OutfieldPriceRow[];
};

export function MatchInfoTab({
    homeKo,
    awayKo,
    ageLimitText,
    stadiumKo,
    stadiumAddress,
    matchAtText,
    seatPrices,
    outfieldPrices,
}: Props) {
    const [showCopiedToast, setShowCopiedToast] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(stadiumAddress);
        setShowCopiedToast(true);
    };

    useEffect(() => {
        if (!showCopiedToast) return;

        const timer = setTimeout(() => {
            setShowCopiedToast(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, [showCopiedToast]);

    return (
        <div className="flex flex-col gap-2">
            <InfoRowResponsive label="참가 팀명" value={`${homeKo} vs ${awayKo}`} />
            <InfoRowResponsive label="이용연령" value={ageLimitText} />

            <div className="px-2 flex gap-4 sm:gap-7">
                <div className="w-16 sm:w-24 text-[var(--text-normal-n240)] text-base font-normal font-['Pretendard'] leading-6">
                    장소
                </div>
                <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                    <div className="text-[var(--text-normal-n240)] text-base font-normal font-['Pretendard'] leading-6">
                        {stadiumKo}
                    </div>
                    <div className="flex items-center gap-1" onClick={handleCopy}>
                        <div className="min-w-0 truncate text-[var(--text-info-n600)] text-xs font-normal font-['Pretendard'] underline leading-4">
                            {stadiumAddress}
                        </div>
                        <div className="w-4 h-4 relative shrink-0 overflow-hidden">
                            <Copy className="cursor-pointer w-3.5 h-3.5 left-[1.33px] top-[1.33px] absolute text-[var(--text-info-n600)]" />
                        </div>
                    </div>
                </div>
            </div>

            <InfoRowResponsive label="경기 일정" value={matchAtText} />

            <div className="px-2 flex gap-4 sm:gap-7">
                <div className="w-16 sm:w-24 text-[var(--text-normal-n240)] text-base font-normal font-['Pretendard'] leading-6">
                    가격 정보
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-[720px] flex flex-col">
                    <div className="border-t border-b border-[var(--stroke-interactive-neutral-default)] inline-flex">
                        <div className="w-64 p-2.5 bg-[var(--background-grey)] border-r border-[var(--stroke-interactive-neutral-default)] flex items-center">
                            <div className="text-[var(--text-normal-n240)] text-sm font-medium font-['Pretendard'] leading-5">
                                권종
                            </div>
                        </div>
                        <div className="flex-1 p-2.5 bg-[var(--background-grey)] border-r border-[var(--stroke-interactive-neutral-default)] flex items-center">
                            <div className="text-[var(--text-normal-n240)] text-sm font-medium font-['Pretendard'] leading-5">
                                주중 가격
                            </div>
                        </div>
                        <div className="flex-1 p-2.5 bg-[var(--background-grey)] flex items-center">
                            <div className="text-[var(--text-normal-n240)] text-sm font-medium font-['Pretendard'] leading-5">
                                주말 가격
                            </div>
                        </div>
                    </div>

                    {seatPrices.map((row) => (
                        <div
                            key={row.seatType}
                            className="border-b border-[var(--stroke-interactive-neutral-default)] inline-flex"
                        >
                            <div className="w-64 px-2.5 py-1.5 border-r border-[var(--stroke-interactive-neutral-default)] flex items-center">
                                <div className="text-[var(--text-normal-n240)] text-sm font-medium font-['Pretendard'] leading-5">
                                    {row.seatType}
                                </div>
                            </div>
                            <div className="flex-1 px-2.5 py-1.5 border-r border-[var(--stroke-interactive-neutral-default)] flex items-center">
                                <div className="text-[var(--text-normal-n240)] text-sm font-medium font-['Pretendard'] leading-5">
                                    {row.weekday}
                                </div>
                            </div>
                            <div className="flex-1 px-2.5 py-1.5 flex items-center">
                                <div className="text-[var(--text-normal-n240)] text-sm font-medium font-['Pretendard'] leading-5">
                                    {row.weekend}
                                </div>
                            </div>
                        </div>
                    ))}

                    {outfieldPrices.map((row, idx) => {
                        const isFirst = idx === 0;
                        const isGroupRow = Boolean(row.groupLabel);

                        if (isFirst) {
                            return (
                                <div key={`out-${idx}`} className="inline-flex">
                                    <div className="w-24 h-8 px-2.5 py-1.5 border-r border-[var(--stroke-interactive-neutral-default)]" />
                                    <div className="w-40 px-2.5 py-1.5 border-r border-b border-[var(--stroke-interactive-neutral-default)] flex items-center">
                                        <div className="text-[var(--text-normal-n240)] text-sm font-medium font-['Pretendard'] leading-5">
                                            {row.category}
                                        </div>
                                    </div>
                                    <div className="flex-1 px-2.5 py-1.5 border-r border-b border-[var(--stroke-interactive-neutral-default)] flex items-center">
                                        <div className="text-[var(--text-normal-n240)] text-sm font-medium font-['Pretendard'] leading-5">
                                            {row.weekday}
                                        </div>
                                    </div>
                                    <div className="flex-1 px-2.5 py-1.5 border-b border-[var(--stroke-interactive-neutral-default)] flex items-center">
                                        <div className="text-[var(--text-normal-n240)] text-sm font-medium font-['Pretendard'] leading-5">
                                            {row.weekend}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        if (isGroupRow) {
                            return (
                                <div key={`out-${idx}`} className="inline-flex">
                                    <div className="w-24 px-2.5 py-1.5 border-r border-[var(--stroke-interactive-neutral-default)] flex items-center">
                                        <div className="text-[var(--text-normal-n240)] text-sm font-medium font-['Pretendard'] leading-5">
                                            {row.groupLabel}
                                        </div>
                                    </div>
                                    <div className="w-40 px-2.5 py-1.5 border-r border-b border-[var(--stroke-interactive-neutral-default)] flex items-center">
                                        <div className="text-[var(--text-normal-n240)] text-sm font-medium font-['Pretendard'] leading-5">
                                            {row.category}
                                        </div>
                                    </div>
                                    <div className="flex-1 px-2.5 py-1.5 border-r border-b border-[var(--stroke-interactive-neutral-default)] flex items-center">
                                        <div className="text-[var(--text-normal-n240)] text-sm font-medium font-['Pretendard'] leading-5">
                                            {row.weekday}
                                        </div>
                                    </div>
                                    <div className="flex-1 px-2.5 py-1.5 border-b border-[var(--stroke-interactive-neutral-default)] flex items-center">
                                        <div className="text-[var(--text-normal-n240)] text-sm font-medium font-['Pretendard'] leading-5">
                                            {row.weekend}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={`out-${idx}`} className="inline-flex">
                                <div className="w-24 h-8 px-2.5 py-1.5 border-r border-b border-[var(--stroke-interactive-neutral-default)]" />
                                <div className="w-40 px-2.5 py-1.5 border-r border-b border-[var(--stroke-interactive-neutral-default)] flex items-center">
                                    <div className="text-[var(--text-normal-n240)] text-sm font-medium font-['Pretendard'] leading-5">
                                        {row.category}
                                    </div>
                                </div>
                                <div className="flex-1 px-2.5 py-1.5 border-r border-b border-[var(--stroke-interactive-neutral-default)] flex items-center">
                                    <div className="text-[var(--text-normal-n240)] text-sm font-medium font-['Pretendard'] leading-5">
                                        {row.weekday}
                                    </div>
                                </div>
                                <div className="flex-1 px-2.5 py-1.5 border-b border-[var(--stroke-interactive-neutral-default)] flex items-center">
                                    <div className="text-[var(--text-normal-n240)] text-sm font-medium font-['Pretendard'] leading-5">
                                        {row.weekend}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-col gap-2 items-end">
                <div className="w-full">
                    <ul className="list-disc pl-5 space-y-1">
                        <li className="text-[var(--text-info-n600)] text-xs font-medium font-['Pretendard'] leading-4">
                            <span className="text-[var(--text-info-n600)]">주말 가격은 </span>
                            <span className="text-[var(--text-normal-n240)]">금요일, 토요일, 일요일, 공휴일</span>
                            <span className="text-[var(--text-info-n600)]"> 경기에 적용됩니다.</span>
                        </li>

                        <li className="text-[var(--text-info-n600)] text-xs font-medium font-['Pretendard'] leading-4">
                            입장권 할인은 본인만 가능하며, 중복 할인은 불가능합니다.
                        </li>

                        <li className="text-[var(--text-info-n600)] text-xs font-medium font-['Pretendard'] leading-4">
                            할인을 받으시려면 할인에 맞는 카드나 증명서 및 신분증을 제출하여야 합니다.
                        </li>

                        <li className="text-[var(--text-info-n600)] text-xs font-medium font-['Pretendard'] leading-4">
                            무료입장은 36개월(주민등록등본 지참)이하의 유아만 가능합니다. 단 좌석의 권한은 제공되지 않습니다.
                        </li>

                        <li className="text-[var(--text-normal-n240)] text-xs font-medium font-['Pretendard'] leading-4">
                            휠체어석, 장애인 할인 안내
                        </li>
                    </ul>
                </div>

                <div className="w-full px-2.5 py-4 bg-[var(--background-grey)] rounded-lg">
                    <ol className="list-decimal pl-5 space-y-1">
                        <li className="text-[var(--text-info-n600)] text-xs font-medium font-['Pretendard'] leading-4">
                            휠체어석에 한해 휠체어 장애인 및 동반 1인 50% 할인 (블루석,레드석)
                        </li>
                        <li className="text-[var(--text-info-n600)] text-xs font-medium font-['Pretendard'] leading-4">
                            장애인 본인에 한해 블루석 이하 좌석 선택 시 50% 할인
                        </li>
                        <li className="text-[var(--text-info-n600)] text-xs font-medium font-['Pretendard'] leading-4">
                            예매 및 구매자는 1매 표소 휠체어 장애인 창구에서 장애인증 및 휠체어 사용유무 확인 후 입장권 발권이 가능합니다.
                        </li>
                    </ol>
                </div>
            </div>

            {showCopiedToast && <AddressCopiedToast />}
        </div>
    );
}

function InfoRowResponsive({ label, value }: { label: string; value: string }) {
    return (
        <div className="px-2 flex gap-4 sm:gap-7">
            <div className="w-16 sm:w-24 text-[var(--text-normal-n240)] text-base font-normal font-['Pretendard'] leading-6">
                {label}
            </div>
            <div className="min-w-0 flex-1 text-[var(--text-normal-n240)] text-base font-normal font-['Pretendard'] leading-6">
                {value}
            </div>
        </div>
    );
}
