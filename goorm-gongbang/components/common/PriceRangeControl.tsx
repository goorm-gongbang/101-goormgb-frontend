"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import * as SliderPrimitive from "@radix-ui/react-slider";

type Range = { min: number; max: number };

type Props = {
  value: Range;
  onChange: (next: Range) => void;

  /** 전체 범위 (만원 단위) */
  minLimit?: number;
  maxLimit?: number;

  /** 슬라이더 이동 단위 */
  step?: number;

  /** 최소-최대 사이 최소 간격 */
  minGap?: number;

  className?: string;
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function snap(n: number, step: number) {
  return Math.round(n / step) * step;
}

const FoundationRangeSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      {/* Track */}
      <SliderPrimitive.Track
        className={cn(
          "relative h-1.5 w-full grow overflow-hidden rounded-[999px]",
          "bg-[var(--foundation-neutral-900)]"
        )}
      >
        {/* Range */}
        <SliderPrimitive.Range className="absolute h-full bg-[var(--foundation-primary-500)]" />
      </SliderPrimitive.Track>

      {/* Thumbs (value 길이가 2라서 thumb 2개 렌더) */}
      <SliderPrimitive.Thumb
        className={cn(
          "block h-5 w-5 rounded-full",
          "bg-[var(--foundation-neutral-white)]",
          "shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)]",
          "border-[0.20px] border-[var(--foundation-primary-400)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--foundation-primary-400)]"
        )}
      />
      <SliderPrimitive.Thumb
        className={cn(
          "block h-5 w-5 rounded-full",
          "bg-[var(--foundation-neutral-white)]",
          "shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)]",
          "border-[0.20px] border-[var(--foundation-primary-400)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--foundation-primary-400)]"
        )}
      />
    </SliderPrimitive.Root>
  );
});
FoundationRangeSlider.displayName = "FoundationRangeSlider";

export function PriceRangeControl({
  value,
  onChange,
  minLimit = 0,
  maxLimit = 30,
  step = 1,
  minGap = 1,
  className,
}: Props) {
  // 안전 정규화
  const safe = React.useMemo(() => {
    let min = clamp(snap(value.min, step), minLimit, maxLimit);
    let max = clamp(snap(value.max, step), minLimit, maxLimit);

    if (min > max) [min, max] = [max, min];

    // gap 보정(초기값/외부값이 잘못 들어왔을 때만)
    if (max - min < minGap) {
      const tryMax = clamp(min + minGap, minLimit, maxLimit);
      const tryMin = clamp(tryMax - minGap, minLimit, maxLimit);
      return { min: tryMin, max: tryMax };
    }

    return { min, max };
  }, [value.min, value.max, minLimit, maxLimit, step, minGap]);

  const sliderValue = React.useMemo(
    () => [safe.min, safe.max] as number[],
    [safe.min, safe.max]
  );

  // 입력창 텍스트 상태(입력 중 UX 유지)
  const [minInput, setMinInput] = React.useState(String(safe.min));
  const [maxInput, setMaxInput] = React.useState(String(safe.max));

  React.useEffect(() => {
    setMinInput(String(safe.min));
    setMaxInput(String(safe.max));
  }, [safe.min, safe.max]);

  const parseOrNull = (s: string) => {
    if (s.trim() === "") return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  // Slider 변경(드래그)
  const onSliderChange = (vals: number[]) => {
    let [min, max] = vals;
    if (min > max) [min, max] = [max, min];

    min = clamp(snap(min, step), minLimit, maxLimit);
    max = clamp(snap(max, step), minLimit, maxLimit);

    if (max - min < minGap) {
      max = clamp(min + minGap, minLimit, maxLimit);
      min = clamp(max - minGap, minLimit, maxLimit);
    }

    onChange({ min, max });
  };

  const commitMinFromInput = () => {
    const n = parseOrNull(minInput);
    if (n === null) {
      setMinInput(String(safe.min));
      return;
    }
    const nextMin = clamp(snap(n, step), minLimit, safe.max - minGap);
    onChange({ min: nextMin, max: safe.max });
  };

  const commitMaxFromInput = () => {
    const n = parseOrNull(maxInput);
    if (n === null) {
      setMaxInput(String(safe.max));
      return;
    }
    const nextMax = clamp(snap(n, step), safe.min + minGap, maxLimit);
    onChange({ min: safe.min, max: nextMax });
  };

  return (
    <div className={cn("w-full flex flex-col gap-3", className)}>
      {/* Slider (Foundation custom) */}
      <FoundationRangeSlider
        value={sliderValue}
        onValueChange={onSliderChange}
        min={minLimit}
        max={maxLimit}
        step={step}
        // 최소 간격 (step 단위)
        minStepsBetweenThumbs={Math.ceil(minGap / step)}
        className="w-full"
      />

      {/* Inputs */}
      <div className="w-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          <div className="px-2.5 py-0.5 rounded-md outline outline-[0.50px] outline-offset-[-0.50px] outline-[var(--stroke-interactive-neutral-default)]">
            <input
              inputMode="numeric"
              value={minInput}
              onChange={(e) => setMinInput(e.target.value.replace(/[^\d]/g, ""))}
              onBlur={commitMinFromInput}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
              }}
              className="w-10 bg-transparent text-[var(--text-normal-n240)] text-base font-medium font-['Pretendard'] leading-6 outline-none text-center"
            />
          </div>
          <div className="text-[var(--text-normal-n240)] text-xs font-medium font-['Pretendard'] leading-4">
            만원
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="px-2.5 py-0.5 rounded-md outline outline-[0.50px] outline-offset-[-0.50px] outline-[var(--stroke-interactive-neutral-default)]">
            <input
              inputMode="numeric"
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value.replace(/[^\d]/g, ""))}
              onBlur={commitMaxFromInput}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
              }}
              className="w-10 bg-transparent text-[var(--text-normal-n240)] text-base font-medium font-['Pretendard'] leading-6 outline-none text-center"
            />
          </div>
          <div className="text-[var(--text-normal-n240)] text-xs font-medium font-['Pretendard'] leading-4">
            만원
          </div>
        </div>
      </div>

      <div className="w-full text-right text-[var(--text-info-n600)] text-xs font-normal font-['Pretendard'] leading-4">
        1매 기준 가격 입니다
      </div>
    </div>
  );
}
