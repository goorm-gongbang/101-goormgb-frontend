"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Toggle } from "@/components/common/Toggle";
import { PriceRangeControl } from "@/components/common/PriceRangeControl";

type Props = {
  enabled: boolean;
  onChange: (next: boolean) => void;
  className?: string;
};

export function DesiredPriceCard({ enabled, onChange, className }: Props) {
  // 만원 단위
  const [range, setRange] = useState({ min: 4, max: 10 });

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
            원하는 가격대만 보기
          </div>
        </div>

        <Toggle checked={enabled} onCheckedChange={onChange} />
      </div>

      {/* 토글 ON일 때만 */}
      {enabled && (
        <PriceRangeControl
          value={range}
          onChange={setRange}
          minLimit={0}
          maxLimit={30}
          step={1}
          minGap={1}
        />
      )}
    </div>
  );
}
