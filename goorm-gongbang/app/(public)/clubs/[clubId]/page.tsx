"use client";

import { useState, useMemo, useEffect, type CSSProperties } from "react";
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
  eachDayOfInterval,
} from "date-fns";
import { ChevronLeft, ChevronRight, Copy } from "lucide-react";
import { getClubById, getClubSchedule } from "@/lib/services";
import type {
  ClubDetail,
  SaleStatus,
  ClubMonthMatches,
  CalendarMatch,
} from "@/lib/types";
import { CDN_CLUBS_BASE_URL } from "@/lib/api/config";
import { ApiError } from "@/lib/api";
import { formatKST } from "@/lib/datetime";
import { ClubMatchCard } from "@/components/club-detail/ClubMatchCard";

/* ===========================
   Helpers
=========================== */
function resolveLogoSrc(input: string) {
  if (/^https?:\/\//i.test(input)) return input;
  if (!CDN_CLUBS_BASE_URL) return input;
  return new URL(input.replace(/^\//, ""), CDN_CLUBS_BASE_URL).toString();
}

const COPIED_STATE_RESET_DELAY_MS = 2000;
const HANHWA_EAGLES_CLUB_ID = 4; // 한화 이글스 클럽 ID 상수화
const CURRENT_YEAR = new Date().getFullYear(); // 현재 연도 동적 추출

const SALE_STATUS_CONFIG = {
  ON_SALE: { label: "예매 가능", color: "text-emerald-500" },
  SOLD_OUT: { label: "매진", color: "text-slate-800" },
  UPCOMING: { label: "판매 예정", color: "text-blue-500" },
  ENDED: { label: "판매 종료", color: "text-slate-500" },
} as const;

export default function ClubDetailPage() {
  const params = useParams();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(CURRENT_YEAR, 2, 1),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [club, setClub] = useState<ClubDetail | null>(null);
  const [copied, setCopied] = useState(false);
  const [matches, setMatches] = useState<CalendarMatch[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);

  const clubId = useMemo(() => {
    const raw = (params as Record<string, string | string[] | undefined>)
      ?.clubId;
    const str = Array.isArray(raw) ? raw[0] : raw;
    const n = str ? Number(str) : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [params]);

  useEffect(() => {
    if (!clubId) return;

    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getClubById(clubId);
        if (!alive) return;
        setClub((data as ClubDetail) ?? null);

        //console.log("detail data:", data);
      } catch (e) {
        if (!alive) return;
        if (e instanceof ApiError) {
          setError(e.message);
        } else {
          setError("서버 오류");
        }
        setClub(null);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [clubId]);

  // 월별 경기 데이터 호출
  useEffect(() => {
    if (!clubId) return;

    const fetchSchedule = async () => {
      setMatchLoading(true);
      try {
        const year = currentMonth.getFullYear();

        const month = currentMonth.getMonth() + 1;
        const res = await getClubSchedule(clubId, year, month);
        if (res && res.matches) {
          setMatches(res.matches);
        }
      } catch (err) {
        console.error("일정 로드 실패:", err);
      } finally {
        setMatchLoading(false);
      }
    };

    fetchSchedule();
  }, [clubId, currentMonth]); // 달이 바뀌거나 clubId가 바뀌면 다시 호출

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // matchMap을 matches 데이터를 기반으로 재구성
  const matchMap = useMemo(() => {
    const map: Record<string, CalendarMatch> = {};
    matches.forEach((m) => {
      // 1. formatKST를 사용하여 한국 기준 '2026. 03. 28.' 문자열 생성
      const kstString = formatKST(m.matchAt, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: undefined, // 시간은 제외
        minute: undefined, // 분도 제외
      });

      // 2. '2026-03-28' 형식으로 변환 (date-fns의 format 결과와 일치시키기 위함)
      const kstDateKey = kstString
        .replace(/\. /g, "-") // ". "을 "-"로
        .replace(/\./g, ""); // 마지막 남은 "." 제거

      map[kstDateKey] = m;
    });
    return map;
  }, [matches]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  if (!clubId) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <div className="text-sm text-slate-600">잘못된 clubId 입니다.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <div className="text-sm text-slate-600">{error}</div>
      </div>
    );
  }

  if (!club) return null;

  const logoSrc = resolveLogoSrc(club.logoImg);
  const bgColor = club.clubColor || "#121130";
  const stadiumName = club.stadium?.koName ?? "";

  const isYellowClub = clubId === HANHWA_EAGLES_CLUB_ID;

  // 주소 복사
  const handleCopyStadium = async () => {
    try {
      await navigator.clipboard.writeText(stadiumName);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, COPIED_STATE_RESET_DELAY_MS); // 2초 후 원복
    } catch (err) {
      console.error("복사 실패", err);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      {/* ===== Hero Section ===== */}
      <div
        className="w-full px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16 flex justify-center"
        style={{ background: bgColor }}
      >
        <div className="w-full max-w-6xl flex flex-col lg:flex-row  lg:items-start gap-8 lg:gap-12 xl:gap-16">
          {/* 1. 로고 영역 */}
          <div className="flex-shrink-0 w-36 h-36 sm:w-48 sm:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48">
              <Image
                src={logoSrc}
                alt={`${club.koName} 로고`}
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* 2. 팀 정보 영역 */}
          <div className="flex flex-col justify-end  h-full gap-4 sm:gap-5 lg:gap-6 text-white min-w-0 w-full lg:w-auto text-center lg:text-left ">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-2 break-words">
                {club.koName}
              </h1>

              <div
                className={cn(
                  "flex flex-wrap  justify-center lg:justify-start gap-2  text-xs sm:text-sm",
                  isYellowClub
                    ? "text-[var(--foundation-yellow-300)]"
                    : "text-[var(--foundation-red-300)]",
                )}
              >
                <span className="opacity-80">구장</span>
                <span className="text-white font-medium">{stadiumName}</span>
                <button
                  type="button"
                  onClick={handleCopyStadium}
                  className={cn(
                    "flex items-center gap-1 hover:text-white transition-colors border-b ",
                    isYellowClub ? "border-yellow-200" : "border-red-200",
                  )}
                >
                  {copied ? "복사됨" : "주소"} <Copy size={14} />
                </button>
              </div>
            </div>

            {club.homepageRedirectUrl && (
              <a
                href={club.homepageRedirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center lg:justify-start gap-1 text-sm font-medium hover:underline w-fit max-w-full group self-center lg:self-start"
              >
                <span className="truncate">공식 홈페이지로 이동하기</span>
                <ChevronRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </a>
            )}
          </div>

          {/* 3. 시즌 성적 영역 */}
          <div className="flex flex-col justify-end h-full gap-6 sm:gap-8 flex-1 w-full lg:min-w-0 lg:ml-4 xl:ml-10 mb-2">
            <div
              className={cn(
                " font-semibold tracking-wider text-xs sm:text-sm text-center lg:text-left",
                isYellowClub
                  ? "text-[var(--foundation-yellow-300)]"
                  : "text-[var(--foundation-red-300)]",
              )}
            >
              {club.currentSeasonStats?.seasonYear ?? CURRENT_YEAR} 시즌
            </div>

            <div className="grid grid-cols-1 gap-y-6 sm:gap-y-8">
              {club.currentSeasonStats ? (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 w-full gap-y-4">
                    {[
                      {
                        label: "순위",
                        value: club.currentSeasonStats.seasonRanking,
                      },
                      { label: "승", value: club.currentSeasonStats.wins },
                      { label: "무", value: club.currentSeasonStats.draws },
                      { label: "패", value: club.currentSeasonStats.losses },
                    ].map((stat, idx) => (
                      <div
                        key={stat.label}
                        className={cn(
                          "px-3 sm:px-4",
                          isYellowClub
                            ? "lg:border-yellow-400/30"
                            : "lg:border-red-400/30",
                          "lg:border-r lg:last:border-none",
                          idx % 2 === 0
                            ? cn(
                                "border-r",
                                isYellowClub
                                  ? "border-yellow-400/20"
                                  : "border-red-400/20",
                                "lg:border-r",
                              )
                            : "border-r-0",
                        )}
                      >
                        <div className="text-white text-[11px] sm:text-xs mb-1 opacity-80">
                          {stat.label}
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-white">
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 w-full gap-y-4">
                    {[
                      {
                        label: "승률",
                        value: club.currentSeasonStats.winRate,
                      },
                      {
                        label: "타율",
                        value: club.currentSeasonStats.battingAverage,
                      },
                      { label: "평균자책", value: club.currentSeasonStats.era },
                      {
                        label: "승차",
                        value: club.currentSeasonStats.gamesBehind,
                      },
                    ].map((stat, idx) => (
                      <div
                        key={stat.label}
                        className={cn(
                          "px-3 sm:px-4",
                          isYellowClub
                            ? "lg:border-yellow-400/30"
                            : "lg:border-red-400/30",
                          "lg:border-r lg:last:border-none",
                          idx % 2 === 0
                            ? cn(
                                "border-r",
                                isYellowClub
                                  ? "border-yellow-400/20"
                                  : "border-red-400/20",
                                "lg:border-r",
                              )
                            : "border-r-0",
                        )}
                      >
                        <div className="text-white text-[11px] sm:text-xs mb-1 opacity-80">
                          {stat.label}
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-white break-words">
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div
                  className={cn(
                    "text-sm text-center lg:text-left",
                    isYellowClub ? "text-yellow-100" : "text-red-100",
                  )}
                >
                  현재 시즌 정보가 준비 중입니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Calendar Section ===== */}
      <section className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-10 sm:py-12 font-sans">
        <div className="flex flex-col gap-6 sm:gap-8">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest">
              Team Schedules
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 break-words">
              {club.koName}의 모든 경기일정
            </h2>
          </div>

          <div className="flex items-center justify-center gap-4 sm:gap-8 lg:gap-10 py-2 sm:py-4">
            <button
              type="button"
              onClick={prevMonth}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ChevronLeft size={22} />
            </button>

            <h3 className="text-lg sm:text-2xl font-bold tracking-tight">
              {format(currentMonth, "yyyy. MM")}
            </h3>

            <button
              type="button"
              onClick={nextMonth}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          <div className="flex justify-end items-center gap-1.5 mb-1 sm:mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-semibold text-slate-500">
              홈 경기
            </span>
          </div>

          {/* 모바일에서는 가로 스크롤 허용 */}
          <div className="w-full overflow-x-auto">
            <div className="min-w-[840px]">
              <div className="grid grid-cols-7 border-y border-slate-200 text-[11px] font-bold py-3 sm:py-4">
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

              <div className="grid grid-cols-7 gap-2 mt-4">
                {days.map((day) => {
                  const dateKey = format(day, "yyyy-MM-dd");
                  const match = matchMap[dateKey];
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const config = match
                    ? SALE_STATUS_CONFIG[match.saleStatus]
                    : null;

                  return (
                    <div
                      key={dateKey}
                      className={cn(
                        "min-h-[160px] sm:min-h-[180px] lg:min-h-[200px]",
                        "border border-slate-200 rounded-lg flex flex-col items-center transition-all overflow-hidden",
                        !match && "bg-[var(--background-grey)]",
                        !isCurrentMonth && "opacity-30",
                      )}
                    >
                      <div className="w-full flex items-center px-2 sm:px-3 py-2 border-b border-slate-300">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "text-[11px] font-bold",
                              match
                                ? "text-[var(--text-normal-n240)]"
                                : "text-slate-400",
                            )}
                          >
                            {format(day, "d")}
                          </span>
                          <span
                            className={cn(
                              "text-[11px] font-bold",
                              match
                                ? "text-[var(--text-normal-n240)]"
                                : "text-slate-400",
                            )}
                          >
                            {match
                              ? formatKST(match.matchAt, {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  year: undefined,
                                  month: undefined,
                                  day: undefined,
                                })
                              : "-"}
                          </span>
                        </div>

                        {match?.isHomeMatch && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        )}
                      </div>

                      <div className="flex-1 w-full p-2 sm:p-3 flex flex-col items-center">
                        {match && config ? (
                          // (() => {
                          //   // 예매 가능 상태일 때만 링크 활성화
                          //   const isClickable = match.saleStatus === "ON_SALE";

                          //   const CardContent = (
                          //     <div
                          //       className={cn(
                          //         "w-full h-full flex flex-col items-center gap-2 sm:gap-3 group transition-opacity",
                          //         !isClickable && "cursor-default",
                          //       )}
                          //     >
                          //       <div className="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-14 mt-1 sm:mt-2 transition-transform group-hover:scale-105">
                          //         <Image
                          //           src={resolveLogoSrc(
                          //             match.opponentClub.logoImg,
                          //           )}
                          //           alt={match.opponentClub.koName}
                          //           fill
                          //           className="object-contain"
                          //         />
                          //       </div>
                          //       <div className="text-[11px] sm:text-[12px] font-black text-slate-900 text-center break-words leading-tight">
                          //         {match.opponentClub.koName}
                          //       </div>
                          //       <div
                          //         className={cn(
                          //           "mt-auto text-[10px] font-bold w-full py-1.5 transition-all text-center ",
                          //           config.color,
                          //         )}
                          //       >
                          //         {config.label}
                          //       </div>
                          //     </div>
                          //   );

                          //   return isClickable ? (
                          //     <Link
                          //       href={`/matches/${match.matchId}`}
                          //       className="w-full h-full cursor-pointer"
                          //     >
                          //       {CardContent}
                          //     </Link>
                          //   ) : (
                          //     <div className="w-full h-full">{CardContent}</div>
                          //   );
                          // })()
                          <ClubMatchCard match={match} config={config} />
                        ) : (
                          <div className="h-full flex items-center justify-center text-center">
                            <span className="text-[10px] text-slate-400 font-medium leading-tight">
                              경기가 없습니다
                            </span>
                          </div>
                        )}
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
