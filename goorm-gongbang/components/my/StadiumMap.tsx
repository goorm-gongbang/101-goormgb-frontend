/* ===========================
   잠실 경기장 인터랙티브 맵 컴포넌트
   - SVG 경로들을 렌더링하며 클릭 이벤트를 처리
   - 선택된 블록들은 강조색(Red)으로 표시
=========================== */

"use client";

import { cn } from "@/lib/utils";
import { STADIUM_PATHS } from "./StadiumMapData";

interface StadiumMapProps {
    selectedIndices: number[];
    onToggle: (index: number) => void;
}

export function StadiumMap({ selectedIndices, onToggle }: StadiumMapProps) {
    const isBlock = (index: number) => {
        const path = STADIUM_PATHS[index];
        if (!path) return false;

        const fill = path.fill.toUpperCase();
        const SEAT_COLORS = [
            "#262853", // 남색 (최외곽)
            "#339601", // 초록색 (외야)
            "#6D6D6D", // 회색 (익사이팅존)
            "#0460DA", // 파란색 (테라존)
            "#7C0165", // 보라색 (내야)
            "#489AF0", // 하늘색 (내야)
            "#DF002F", // 빨간색 (내야)
            "#E16902", // 주황색 (내야)
        ];

        return SEAT_COLORS.includes(fill);
    };

    const getFill = (index: number, originalFill: string) => {
        return originalFill;
    };

    const getOpacity = (index: number) => {
        if (!isBlock(index)) return 1;
        return selectedIndices.includes(index) ? 1 : 0.25; // 비선택 시 25% 투명도로 색상을 살짝 살림
    };

    return (
        <div className="w-full flex justify-center py-4 overflow-hidden bg-[#F9F9F9] rounded-xl border border-[#EEE]">
            <svg
                width="600"
                height="550"
                viewBox="0 0 600 550"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="max-w-full h-auto"
            >
                {STADIUM_PATHS.map((path, idx) => {
                    const active = isBlock(idx);
                    return (
                        <path
                            key={idx}
                            d={path.d}
                            fill={path.fill}
                            className={cn(
                                "transition-all duration-300",
                                active ? "cursor-pointer" : "pointer-events-none",
                                active && !selectedIndices.includes(idx) && "opacity-25 hover:opacity-50",
                                active && selectedIndices.includes(idx) && "opacity-100",
                                !active && "opacity-100"
                            )}
                            onClick={active ? () => onToggle(idx) : undefined}
                        />
                    );
                })}
            </svg>
        </div>
    );
}
