"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button"; // shadcn/ui
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  eachDayOfInterval,
} from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Copy } from "lucide-react";

/* ===========================
    API TYPES (Mocked)
=========================== */
type ClubDetail = {
  clubId: number;
  koName: string;
  enName: string;
  logoImg: string;
  clubColor: string;
  stadiumName: string;
  stadiumAddress: string;
  description?: string;
};

type MatchSummary = {
  matchId: number;
  matchAt: string;
  homeClub: { koName: string; enName: string; logoImg: string };
  awayClub: { koName: string; enName: string; logoImg: string };
  stadiumName: string;
  saleStatus: "ON_SALE" | "UPCOMING" | "SOLD_OUT" | "ENDED";
};

/* ===========================
    MOCK DATA
=========================== */
const seasonStats = [
  { label: "순위", value: "3" },
  { label: "승", value: "32" },
  { label: "무", value: "2" },
  { label: "패", value: "13" },
];

const detailedStats = [
  { label: "승률", value: "0.582" },
  { label: "타율", value: "0.311" },
  { label: "평균자책", value: "2.9" },
  { label: "승차", value: "0.0" },
];

const MOCK_CLUB_DATA: Record<string, ClubDetail> = {
  "1": {
    clubId: 1,
    koName: "두산 베어스",
    enName: "Doosan Bears",
    logoImg: "/logo/logo1.png",
    clubColor: "#131230",
    stadiumName: "잠실 야구장",
    stadiumAddress: "서울특별시 송파구 올림픽로 25",
    description: "서울을 연고지로 하는 KBO 리그의 프로야구단입니다.",
  },
  "2": {
    clubId: 2,
    koName: "LG 트윈스",
    enName: "LG Twins",
    logoImg: "/logo/logo2.png",
    clubColor: "#C30452",
    stadiumName: "잠실 야구장",
    stadiumAddress: "서울특별시 송파구 올림픽로 25",
    description: "서울을 연고지로 하는 KBO 리그의 프로야구단입니다.",
  },
};

// 3월과 4월에 걸친 가상 경기 데이터
const MOCK_MATCHES: MatchSummary[] = [
  {
    matchId: 101,
    matchAt: "2026-03-24T18:30:00",
    homeClub: {
      koName: "두산 베어스",
      enName: "Doosan Bears",
      logoImg: "/logo/logo1.png",
    },
    awayClub: {
      koName: "삼성 라이온즈",
      enName: "Samsung Lions",
      logoImg: "/logo/logo3.png",
    },
    stadiumName: "잠실 야구장",
    saleStatus: "ENDED",
  },
  {
    matchId: 102,
    matchAt: "2026-03-29T14:00:00",
    homeClub: {
      koName: "두산 베어스",
      enName: "Doosan Bears",
      logoImg: "/logo/logo1.png",
    },
    awayClub: {
      koName: "SSG 랜더스",
      enName: "SSG Landers",
      logoImg: "/logo/logo4.png",
    },
    stadiumName: "잠실 야구장",
    saleStatus: "ON_SALE",
  },
  {
    matchId: 103,
    matchAt: "2026-04-05T14:00:00",
    homeClub: {
      koName: "키움 히어로즈",
      enName: "Kiwoom Heroes",
      logoImg: "/logo/logo5.png",
    },
    awayClub: {
      koName: "두산 베어스",
      enName: "Doosan Bears",
      logoImg: "/logo/logo1.png",
    },
    stadiumName: "고척 스카이돔",
    saleStatus: "UPCOMING",
  },
];

/* --- API Response Mock Data --- */
const MOCK_API_RESPONSE = {
  code: "OK",
  message: "조회 성공",
  data: {
    clubId: 6,
    year: 2026,
    month: 3,
    totalMatchCount: 2,
    matches: [
      {
        matchId: 101,
        matchAt: "2026-03-28T18:30:00",
        opponentClub: {
          clubId: 1,
          koName: "두산 베어스",
          logoImg: "/logo/doosan-bears.png", // 실제 경로에 맞춰 수정
        },
        saleStatus: "ON_SALE",
        isHomeMatch: true,
      },
      {
        matchId: 102,
        matchAt: "2026-03-29T18:30:00",
        opponentClub: {
          clubId: 2,
          koName: "삼성 라이온즈",
          logoImg: "/logo/samsung-lions.png",
        },
        saleStatus: "UPCOMING",
        isHomeMatch: false,
      },
    ],
  },
};

/* --- 타입 정의 (API 규격 기준) --- */
type SaleStatus = "ON_SALE" | "UPCOMING" | "SOLD_OUT" | "ENDED";

interface Match {
  matchId: number;
  matchAt: string;
  opponentClub: {
    clubId: number;
    koName: string;
    logoImg: string;
  };
  saleStatus: SaleStatus;
  isHomeMatch: boolean;
}

export default function ClubDetailPage() {
  const params = useParams();
  const clubId = useMemo(() => {
    const raw = (params as Record<string, string | string[] | undefined>)
      ?.clubId;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1)); // 2026년 3월 기준
  const [loading, setLoading] = useState(false);
  const [clubData, setClubData] = useState<ClubDetail | null>(null);
  const [matches, setMatches] = useState<MatchSummary[]>([]);

  useEffect(() => {
    if (!clubId) return;
    setLoading(true);
    setTimeout(() => {
      setClubData(MOCK_CLUB_DATA[clubId] || MOCK_CLUB_DATA["1"]);
      setMatches(MOCK_MATCHES);
      setLoading(false);
    }, 500);
  }, [clubId]);

  /* 달력 생성 로직 */
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (!clubData) return null;

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="w-full min-h-screen bg-[var(--background-white)]">
      {/* ===== Hero Section ===== */}
      {/* <section className="relative w-full h-[300px] sm:h-[400px] overflow-hidden bg-black">
        <div className="absolute inset-0">
          <Image
            src="/match/detail.png"
            alt="Club Background"
            fill
            className="object-cover blur-[4px] opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
        </div>

        <div className="relative h-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-28 flex flex-col justify-end pb-8 sm:pb-12">
          <div className="flex items-center gap-6 sm:gap-10">
            <div className="shrink-0 bg-white/10 rounded-2xl p-4 backdrop-blur-sm outline outline-1 outline-white/20">
              <img
                src={clubData.logoImg}
                alt={clubData.koName}
                className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
              />
            </div>
            <div className="flex flex-col gap-1 sm:gap-2">
              <h1 className="text-[var(--foundation-neutral-white)] text-3xl sm:text-5xl font-bold font-['Pretendard']">
                {clubData.koName}
              </h1>
              <p className="text-[var(--foundation-neutral-840)] text-sm sm:text-lg font-normal font-['Pretendard']">
                {clubData.enName}
              </p>
            </div>
          </div>
        </div>
      </section> */}
      <div className="w-full bg-[#a32c41] py-16 px-4 flex justify-center items-center">
        <div className="max-w-6xl w-full flex flex-row items-center gap-16">
          {/* 1. 로고 영역 */}
          <div className="flex-shrink-0 w-64 h-64 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <div className="relative w-48 h-48">
              <Image
                src="/logo/logo4.png" // 실제 경로로 수정 필요
                alt="LG 트윈스 로고"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* 2. 팀 정보 영역 */}
          <div className="flex flex-col gap-6 text-white min-w-[280px]">
            <div>
              <h1 className="text-5xl font-bold tracking-tight mb-2">
                LG 트윈스
              </h1>
              <div className="flex items-center gap-2 text-red-200 text-sm">
                <span className="opacity-80">구장</span>
                <span className="text-white font-medium">
                  잠실종합운동장 잠실야구장
                </span>
                <button className="flex items-center gap-1 hover:text-white transition-colors border-b border-red-200 ml-1">
                  주소 <Copy size={14} />
                </button>
              </div>
            </div>

            <a
              href="https://www.lgtwins.com"
              target="_blank"
              className="flex items-center gap-1 text-sm font-medium hover:underline w-fit group"
            >
              공식 홈페이지로 이동하기
              <ChevronRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </a>
          </div>

          {/* 3. 시즌 성적 영역 (Grid) */}
          <div className="flex flex-col gap-8 flex-1 ml-10">
            <div className="text-red-300 font-semibold tracking-wider text-sm">
              2026 시즌
            </div>

            <div className="grid grid-cols-1 gap-y-8">
              {/* 상단 스탯 (순위, 승, 무, 패) */}
              <div className="grid grid-cols-4 w-full">
                {seasonStats.map((stat, idx) => (
                  <div
                    key={idx}
                    className="border-r border-red-400/30 last:border-none px-4"
                  >
                    <div className="text-red-200 text-xs mb-1 opacity-80">
                      {stat.label}
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* 하단 스탯 (승률, 타율 등) */}
              <div className="grid grid-cols-4 w-full">
                {detailedStats.map((stat, idx) => (
                  <div
                    key={idx}
                    className="border-r border-red-400/30 last:border-none px-4"
                  >
                    <div className="text-red-200 text-xs mb-1 opacity-80">
                      {stat.label}
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Main Content ===== */}
      <section className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 py-12">
        <div className="flex flex-col gap-10">
          {/* Calendar Section */}
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[var(--foundation-neutral-20)] font-['Pretendard']">
                경기 일정
              </h2>

              {/* Calendar Controller */}
              <div className="flex items-center gap-6 bg-[var(--background-grey)] px-4 py-2 rounded-full border border-[var(--foundation-neutral-880)]">
                <button
                  onClick={prevMonth}
                  className="p-1 hover:bg-white rounded-full transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-lg font-bold min-w-[100px] text-center">
                  {format(currentMonth, "yyyy. MM", { locale: ko })}
                </span>
                <button
                  onClick={nextMonth}
                  className="p-1 hover:bg-white rounded-full transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Large Calendar Grid */}
            <div className="w-full bg-white rounded-3xl border border-[var(--foundation-neutral-880)] overflow-hidden shadow-sm">
              {/* Day Headers */}
              <div className="grid grid-cols-7 bg-[var(--background-grey)] border-b border-[var(--foundation-neutral-880)]">
                {["일", "월", "화", "수", "목", "금", "토"].map((day, i) => (
                  <div
                    key={day}
                    className={cn(
                      "py-4 text-center text-sm font-semibold",
                      i === 0
                        ? "text-red-500"
                        : i === 6
                          ? "text-blue-500"
                          : "text-[var(--foundation-neutral-400)]",
                    )}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid Cells */}
              <div className="grid grid-cols-7">
                {days.map((day, idx) => {
                  const dayMatches = matches.filter((m) =>
                    isSameDay(new Date(m.matchAt), day),
                  );
                  const isCurrentMonth = isSameMonth(day, currentMonth);

                  return (
                    <div
                      key={day.toString()}
                      className={cn(
                        "min-h-[140px] p-2 border-r border-b border-[var(--foundation-neutral-940)] flex flex-col gap-2",
                        !isCurrentMonth &&
                          "bg-[var(--background-grey)]/30 opacity-40",
                        (idx + 1) % 7 === 0 && "border-r-0",
                      )}
                    >
                      <span
                        className={cn(
                          "text-xs font-bold px-1.5 py-0.5 rounded-md self-start",
                          isSameDay(day, new Date())
                            ? "bg-[var(--foundation-primary-500)] text-white"
                            : "text-[var(--foundation-neutral-600)]",
                        )}
                      >
                        {format(day, "d")}
                      </span>

                      {/* Match Content in Cell */}
                      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[100px] scrollbar-hide">
                        {dayMatches.map((match) => {
                          const isHome =
                            match.homeClub.koName === clubData.koName;
                          const opponent = isHome
                            ? match.awayClub
                            : match.homeClub;
                          const status = match.saleStatus;

                          return (
                            <div
                              key={match.matchId}
                              className={cn(
                                "p-2 rounded-xl text-[10px] sm:text-xs font-medium border flex flex-col gap-1 cursor-pointer transition-all hover:scale-[1.02]",
                                isHome
                                  ? "bg-[var(--foundation-primary-50)] border-[var(--foundation-primary-200)]"
                                  : "bg-white border-[var(--foundation-neutral-880)]",
                              )}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span
                                  className={cn(
                                    "px-1 rounded",
                                    isHome
                                      ? "text-[var(--foundation-primary-600)]"
                                      : "text-[var(--foundation-neutral-400)]",
                                  )}
                                >
                                  {isHome ? "HOME" : "AWAY"}
                                </span>
                                <span className="text-[var(--foundation-neutral-600)]">
                                  {format(new Date(match.matchAt), "HH:mm")}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <img
                                  src={opponent.logoImg}
                                  className="w-4 h-4 object-contain"
                                  alt=""
                                />
                                <span className="truncate font-bold">
                                  vs {opponent.koName}
                                </span>
                              </div>
                              {status === "ON_SALE" && (
                                <div className="mt-1 text-[9px] text-center bg-[var(--foundation-red-500)] text-white py-0.5 rounded-full">
                                  예매중
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
