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

  xl: {
    container:
      "w-60 h-56 px-2 py-9 bg-transparent inline-flex flex-col justify-center items-center gap-2 overflow-hidden",
    inner: "self-stretch flex flex-col justify-start items-start gap-2.5",
    img: "self-stretch h-40",
  },

  lg: {
    container:
      "w-48 px-1 py-5 bg-transparent inline-flex flex-col justify-center items-center gap-2 overflow-hidden",
    inner: "self-stretch h-40 flex flex-col justify-start items-center gap-2.5",
    img: "self-stretch h-32",
  },

  md: {
    container:
      "w-24 h-24 px-3.13 py-4 bg-transparent inline-flex flex-col justify-center items-center gap-1.5 overflow-hidden",
    inner: "flex flex-col justify-start items-center gap-2",
    img: "w-24 h-16",
  },

  sm: {
    container:
      "w-8 h-8 px-1 py-5 bg-transparent inline-flex flex-col justify-center items-center gap-2 overflow-hidden",
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
