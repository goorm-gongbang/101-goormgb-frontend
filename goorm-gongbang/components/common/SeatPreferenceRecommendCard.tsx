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
        "w-96 px-6 py-4 bg-[var(--foundation-neutral-white)] rounded-2xl",
        "outline outline-1 outline-offset-[-1px] outline-[var(--foundation-neutral-880)]",
        "inline-flex flex-col justify-start items-start gap-2",
        className
      )}
    >
      {/* Header */}
      <div className="self-stretch h-8 inline-flex justify-between items-center">
        <div className="flex justify-center items-center gap-2">
          <div className="justify-center text-[var(--foundation-neutral-black)] text-base font-semibold font-['Pretendard'] leading-6">
            사용자 선호 좌석 추천
          </div>
        </div>

        <Toggle checked={enabled} onCheckedChange={onChange} />
      </div>

      {/* 토글 ON일 때만 아래 영역 표시 */}
      {enabled && (
        <>
          {/* Divider */}
          <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-[var(--foundation-neutral-840)]" />

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