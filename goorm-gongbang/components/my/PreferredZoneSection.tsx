/* ===========================
   선호 구역 선택 섹션 컴포넌트
   - 경기장 맵을 통해 블록을 선택하는 UI
   - 선택된 블록 개수 표시 (최대 10개)
=========================== */

"use client";

import { StadiumMap } from "./StadiumMap";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";

interface PreferredZoneSectionProps {
    selectedBlocks: number[];
    onToggle: (index: number) => void;
    onReset: () => void;
}

export function PreferredZoneSection({ selectedBlocks, onToggle, onReset }: PreferredZoneSectionProps) {
    const MAX_SELECTION = 10;

    const handleToggle = (index: number) => {
        if (!selectedBlocks.includes(index) && selectedBlocks.length >= MAX_SELECTION) {
            toast.error(`최대 ${MAX_SELECTION}개까지 선택 가능합니다.`);
            return;
        }
        onToggle(index);
    };

    return (
        <div className="bg-white rounded-2xl border border-[#E8E8E8] px-5 py-5 mb-3">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-[#1A1A1A]">선호 구역 선택</h2>
                    <span className="text-sm font-bold" style={{ color: "var(--foundation-primary-500)" }}>*</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onReset}
                        className="flex items-center gap-1 text-[13px] text-[#999] hover:text-[#666] transition-colors"
                        title="선택 초기화"
                    >
                        <RotateCcw size={14} />
                        초기화
                    </button>
                    <div className="text-sm font-medium text-[#666]">
                        선택한 블럭 : <span style={{ color: "var(--foundation-primary-500)" }}>{selectedBlocks.length}</span> / {MAX_SELECTION}
                    </div>
                </div>
            </div>

            <div className="h-px bg-[#F0F0F0] mb-4" />

            {/* 안내 문구 */}
            <p className="text-[13px] text-[#666] leading-relaxed mb-4">
                경기장에서 가장 선호하는 블록을 선택해주세요.<br />
                선택하신 정보를 바탕으로 가장 좋은 자리를 추천해드릴게요.
            </p>

            {/* 경기장 맵 */}
            <StadiumMap
                selectedIndices={selectedBlocks}
                onToggle={handleToggle}
            />

            {/* [TODO] 하단에 선택된 블록 리스트 칩들을 추가할 수 있습니다. */}
        </div>
    );
}
