"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
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
  eachDayOfInterval,
} from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Copy } from "lucide-react";

/* ===========================
    MOCK DATA & TYPES
=========================== */
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

// 제공해주신 API 응답 데이터 (달력 렌더링용)
const MOCK_API_RESPONSE = {
  data: {
    matches: [
      {
        matchId: 101,
        matchAt: "2026-03-28T14:00:00",
        opponentClub: {
          clubId: 1,
          koName: "kt 위즈",
          logoImg: "/logo/logo4.png",
        },
        saleStatus: "SOLD_OUT" as SaleStatus,
        isHomeMatch: true,
      },
      {
        matchId: 102,
        matchAt: "2026-03-29T14:00:00",
        opponentClub: {
          clubId: 2,
          koName: "kt 위즈",
          logoImg: "/logo/logo4.png",
        },
        saleStatus: "ON_SALE" as SaleStatus,
        isHomeMatch: true,
      },
      {
        matchId: 103,
        matchAt: "2026-03-31T18:30:00",
        opponentClub: {
          clubId: 3,
          koName: "기아 타이거즈",
          logoImg: "/logo/logo1.png",
        },
        saleStatus: "UPCOMING" as SaleStatus,
        isHomeMatch: false,
      },
    ],
  },
};

export default function ClubDetailPage() {
  const params = useParams();
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [params.clubId]);

  /* 1. 달력 날짜 생성 (useMemo) */
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  /* 2. 경기 데이터 매핑 최적화 (useMemo) */
  const matchMap = useMemo(() => {
    const map: Record<string, Match> = {};
    MOCK_API_RESPONSE.data.matches.forEach((match) => {
      const dateKey = format(new Date(match.matchAt), "yyyy-MM-dd");
      map[dateKey] = match;
    });
    return map;
  }, []);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  if (loading)
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner className="h-6 w-6" />
      </div>
    );

  return (
    <div className="w-full min-h-screen bg-white">
      {/* ===== Hero Section: 사용자 요청대로 이전 사이즈/스타일 완전 복원 ===== */}
      <div className="w-full bg-[#a32c41] py-16 px-4 flex justify-center items-center">
        <div className="max-w-6xl w-full flex flex-row items-center gap-16">
          {/* 1. 로고 영역 */}
          <div className="flex-shrink-0 w-64 h-64 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <div className="relative w-48 h-48">
              <Image
                src="/logo/logo4.png"
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
              href="#"
              className="flex items-center gap-1 text-sm font-medium hover:underline w-fit group"
            >
              공식 홈페이지로 이동하기
              <ChevronRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </a>
          </div>

          {/* 3. 시즌 성적 영역 (이전 디자인 그대로) */}
          <div className="flex flex-col gap-8 flex-1 ml-10">
            <div className="text-red-300 font-semibold tracking-wider text-sm">
              2026 시즌
            </div>
            <div className="grid grid-cols-1 gap-y-8">
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

      {/* ===== Calendar Section ===== */}
      <section className="mx-auto w-full max-w-[1200px] px-4 py-12 font-sans">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest">
              Team Schedules
            </span>
            <h2 className="text-2xl font-bold text-slate-900">
              LG 트윈스의 모든 경기일정
            </h2>
          </div>

          <div className="flex items-center justify-center gap-10 py-4">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <h3 className="text-2xl font-bold tracking-tight">
              {format(currentMonth, "yyyy. MM")}
            </h3>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="flex justify-end items-center gap-1.5 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-semibold text-slate-500">
              홈 경기
            </span>
          </div>

          {/* 달력 컨테이너: 요일 헤더에서 월요일에만 색상 부여 */}
          <div className="w-full">
            <div className="grid grid-cols-7 border-y border-slate-200 text-[11px] font-bold py-4">
              {["일", "월", "화", "수", "목", "금", "토"].map((day, i) => (
                <div
                  key={day}
                  className={cn(
                    "text-center",
                    i === 1 ? "text-emerald-500" : "text-slate-600",
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 날짜 그리드: 각 날짜가 개별 카드 형태 */}
            <div className="grid grid-cols-7 gap-2 mt-4">
              {days.map((day) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const match = matchMap[dateKey];
                const isCurrentMonth = isSameMonth(day, currentMonth);

                return (
                  <div
                    key={dateKey}
                    className={cn(
                      "min-h-[200px] p-3 border border-slate-200 rounded-lg flex flex-col items-center transition-all",
                      !match && "bg-slate-50", // 경기가 없으면 회색 배경 처리
                      !isCurrentMonth && "opacity-30",
                    )}
                  >
                    <div className="w-full flex items-center gap-1 mb-6">
                      <span className="text-[11px] font-bold text-slate-400">
                        {format(day, "d")}
                      </span>
                      <span className="text-[10px] text-slate-200">-</span>
                      {match?.isHomeMatch && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                    </div>

                    {match ? (
                      <Link
                        href={`/matches/${match.matchId}`}
                        className="w-full flex-1 flex flex-col items-center gap-3 group cursor-pointer"
                      >
                        <div className="text-[11px] font-bold text-slate-800">
                          {format(new Date(match.matchAt), "HH:mm")}
                        </div>
                        <div className="relative w-16 h-14 transition-transform group-hover:scale-110">
                          <Image
                            src={match.opponentClub.logoImg}
                            alt={match.opponentClub.koName}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="text-[12px] font-black text-slate-900">
                          {match.opponentClub.koName}
                        </div>
                        <div
                          className={cn(
                            "mt-auto text-[10px] font-bold w-full py-1.5 transition-all text-center",
                            match.saleStatus === "ON_SALE"
                              ? "text-emerald-500"
                              : match.saleStatus === "SOLD_OUT"
                                ? "text-slate-500"
                                : "text-blue-500",
                          )}
                        >
                          {match.saleStatus === "ON_SALE"
                            ? "예매 가능"
                            : match.saleStatus === "SOLD_OUT"
                              ? "매진"
                              : "판매 예정"}
                        </div>
                      </Link>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-center">
                        <span className="text-[10px] text-slate-400 font-medium leading-tight">
                          경기가 없습니다
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
