"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { CalendarMatch } from "@/lib/types";
import { CDN_CLUBS_BASE_URL } from "@/lib/api/config";

// 로고 URL 해결 함수
function resolveLogoSrc(input: string) {
  if (/^https?:\/\//i.test(input)) return input;
  if (!CDN_CLUBS_BASE_URL) return input;
  return new URL(input.replace(/^\//, ""), CDN_CLUBS_BASE_URL).toString();
}

interface MatchCardProps {
  match: CalendarMatch;
  // readonly를 추가하여 부모의 as const 데이터와 타입을 맞춥니다.
  config: {
    readonly label: string;
    readonly color: string;
  };
}

export function ClubMatchCard({ match, config }: MatchCardProps) {
  const isClickable = match.saleStatus !== "ENDED";
  const isEnded = match.saleStatus === "ENDED";
  const CardContent = (
    <div
      className={cn(
        "w-full h-full flex flex-col items-center gap-2 sm:gap-3 group transition-opacity",
        isEnded && "bg-[var(--background-grey)]",
        !isClickable && "cursor-default",
      )}
    >
      <div className={cn(
        "relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-14 mt-1 sm:mt-2 transition-transform",
        isEnded && "grayscale opacity-70",
      )}
      >
        <Image
          src={resolveLogoSrc(match.opponentClub.logoImg)}
          alt={match.opponentClub.koName}
          fill
          sizes="(max-width: 768px) 50vw, 100px"
          className="object-contain"
        />
      </div>
      <div className={cn(
        "text-[11px] sm:text-[12px] font-black text-slate-900 text-center break-words leading-tight",
        isEnded
              ? "text-[var(--text-info-n600)]"
              : "text-slate-900",
        )}
      >
        {match.opponentClub.koName}
      </div>
      <div
        className={cn(
          "mt-auto text-[10px] font-bold w-full py-1.5 transition-all text-center",
          config.color,
        )}
      >
        {config.label}
      </div>
    </div>
  );

  if (isClickable) {
    return (
      <Link
        href={`/matches/${match.matchId}`}
        className="w-full h-full cursor-pointer block"
      >
        {CardContent}
      </Link>
    );
  }

  return <div className="w-full h-full">{CardContent}</div>;
}
