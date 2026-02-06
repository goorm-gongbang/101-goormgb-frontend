"use client";

import { cn } from "@/lib/utils";

type Size = "xl" | "lg" | "md" | "sm";

type Props = {
  index: number;     // 0~9
  size?: Size;

  /** object-fit */
  fit?: "contain" | "cover";

  className?: string;
  imgClassName?: string;
};

const SIZE_PRESETS: Record<
  Size,
  {
    container: string;
    inner: string;
    img: string;
  }
> = {
  // ✅ (예시1) w-60 h-56 px-2 py-9 + img self-stretch h-40
  xl: {
    container:
      "w-60 h-56 px-2 py-9 bg-white inline-flex flex-col justify-center items-center gap-2 overflow-hidden",
    inner: "self-stretch flex flex-col justify-start items-start gap-2.5",
    img: "self-stretch h-40",
  },

  // ✅ 큰 카드지만 이미지 조금 더 크게(여기만 필요에 맞게 조정 가능)
  lg: {
    container:
      "w-60 h-56 px-2.5 py-6 bg-white inline-flex flex-col justify-center items-center gap-2 overflow-hidden",
    inner: "self-stretch flex flex-col justify-start items-center gap-2.5",
    img: "w-52 h-48",
  },

  // ✅ 큰 카드 + 정사각(예시: w-52 h-52)
  md: {
    container:
      "w-60 h-56 px-2.5 py-2.5 bg-white inline-flex flex-col justify-center items-center gap-2 overflow-hidden",
    inner: "self-stretch flex flex-col justify-start items-center gap-2.5",
    img: "w-52 h-52",
  },

  // ✅ (예시4) 작은 아이콘: w-8 h-8 px-1 py-5 + img w-8 h-5
  sm: {
    container:
      "w-8 h-8 px-1 py-5 bg-white inline-flex flex-col justify-center items-center gap-2 overflow-hidden",
    inner: "flex flex-col justify-center items-center gap-2.5",
    img: "w-8 h-5",
  },
};

export function IconPreview({
  index,
  size = "xl",
  fit = "contain",
  className,
  imgClassName,
}: Props) {
  const preset = SIZE_PRESETS[size];

  return (
    <div className={cn(preset.container, className)}>
      <div className={preset.inner}>
        <img
          src={`/logo/logo${index + 1}.png`}
          alt={`icon-${index + 1}`}
          className={cn(preset.img, fit === "contain" ? "object-contain" : "object-cover", imgClassName)}
        />
      </div>
    </div>
  );
}
