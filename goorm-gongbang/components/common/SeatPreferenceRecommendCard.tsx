"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Toggle } from "@/components/common/Toggle";
import { DropDown } from "@/components/common/DropDown"

type Props = {
  enabled: boolean;
  onChange: (next: boolean) => void;
  className?: string;
};

export function SeatPreferenceRecommendCard({
  enabled,
  onChange,
  className,
}: Props) {

  const [people, setPeople] = useState(2);

  return (
    <div
      className={cn(
        "w-full py-4 bg-[var(--foundation-neutral-white)] rounded-2xl",
        "inline-flex flex-col justify-start items-start gap-4",
        className
      )}
    >
      {/* Header */}
      <div className="self-stretch h-8 inline-flex justify-between items-center">
        <div className="flex justify-center items-center gap-2">
          <div className="justify-center text-[var(--foundation-neutral-black)] text-base font-semibold font-['Pretendard'] leading-6">
            사용자 선호 좌석 추천
            <div className="text-[var(--foundation-primary-500)] text-xs font-normal font-['Pretendard'] leading-4">
              {enabled ? (
                <>
                  선호도에 맞는 좌석을 추천해드려요.
                </>
              ) : 
                <>
                  추천 기능이 비활성화 되었습니다. 좌석을 직접 선택합니다.
                </>
              }
            </div>
          </div>

        </div>

        <Toggle checked={enabled} onCheckedChange={onChange} />
      </div>

      {/* 토글 ON일 때만 아래 영역 표시 */}
      {enabled && (
        <>
          {/* People count row */}
          <div className="self-stretch inline-flex justify-between items-center">
            <div className="flex justify-center items-center gap-2">
              <div className="justify-center text-[var(--foundation-neutral-240)] text-base font-semibold font-['Pretendard'] leading-6">
                인원 수
              </div>
            </div>

            <DropDown value={people} onChange={setPeople} max={10} />
          </div>
        </>
      )}
    </div>
  );
}