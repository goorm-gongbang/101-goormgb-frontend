"use client";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { CDN_CLUBS_BASE_URL } from "@/lib/api/config";

type Size = "xl" | "lg" | "md" | "md_2" | "sm";

type Props = {
  logoImg: string;
  size?: Size;
  fit?: "contain" | "cover";
  className?: string;
  imgClassName?: string;
  priorityLoad?: boolean;
};

const SIZE_PRESETS: Record<
  Size,
  {
    container: string;
    inner: string;
    img: string;
    sizes: string;
  }
> = {
  xl: {
    container:
      "w-60 h-56 px-2 py-9 bg-transparent inline-flex flex-col justify-center items-center gap-2 overflow-hidden",
    inner: "self-stretch flex flex-col justify-start items-start gap-2.5",
    img: "self-stretch h-40",
    sizes: "240px",
  },
  lg: {
    container:
      "w-48 px-1 py-5 bg-transparent inline-flex flex-col justify-center items-center gap-2 overflow-hidden",
    inner: "self-stretch h-40 flex flex-col justify-start items-center gap-2.5",
    img: "self-stretch h-32",
    sizes: "192px",
  },
  md: {
    container:
      "w-24 h-24 px-3.13 py-4 bg-transparent inline-flex flex-col justify-center items-center gap-1.5 overflow-hidden",
    inner: "flex flex-col justify-start items-center gap-2",
    img: "w-24 h-16",
    sizes: "96px",
  },
  md_2: {
    container:
      "w-24 h-24 px-3.13 py-4 bg-transparent inline-flex flex-col justify-center items-center gap-1.5 overflow-hidden",
    inner: "flex flex-col justify-start items-center gap-2",
    img: "w-[91px] h-[88px]",
    sizes: "91px",
  },
  sm: {
    container:
      "w-8 h-8 px-1 py-5 bg-transparent inline-flex flex-col justify-center items-center gap-2 overflow-hidden",
    inner: "flex flex-col justify-center items-center gap-2.5",
    img: "w-8 h-5",
    sizes: "32px",
  },
};


function resolveLogoSrc(input: string) {
  if (/^https?:\/\//i.test(input)) return input; // input이 이미 https:// 로 시작하면 그대로 사용
  if (!CDN_CLUBS_BASE_URL) return input; // env가 없을 경우
  return new URL(input.replace(/^\//, ""), CDN_CLUBS_BASE_URL).toString(); // base + 상대경로 결합
}

export function IconPreview({
  logoImg,
  size = "xl",
  fit = "contain",
  className,
  imgClassName,
  priorityLoad = false,
}: Props) {
  const preset = SIZE_PRESETS[size];

  return (
    <div className={cn(preset.container, className)}>
      <div className={preset.inner}>
        <div className={cn("relative", preset.img)}>
          <Image
            src={resolveLogoSrc(logoImg)}
            alt=""
            fill
            sizes={preset.sizes}
            loading={priorityLoad ? "eager" : "lazy"}
            fetchPriority={priorityLoad ? "high" : "auto"}
            className={cn(
              fit === "contain" ? "object-contain" : "object-cover",
              imgClassName
            )}
          />
        </div>
      </div>
    </div>
  );
}
