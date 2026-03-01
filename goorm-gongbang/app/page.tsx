"use client";

import { useEffect, useMemo, useState } from "react";
import { TodayInitSelectableDateStrip } from "@/components/common/TodayInitSelectableDateStrip";
import { MatchCard } from "@/components/common/MatchCard";
import { IconPreview } from "@/components/common/IconPreview";
import { TeamInfoCard } from "@/components/common/TeamInfoCard";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { getMatches, getClubs } from "@/lib/services";
import { ApiError } from "@/lib/api";

/* ===========================
   API TYPES
=========================== */
type ApiResponse<T> = {
  code: string;
  message: string;
  data: T;
}

// 경기 목록 조회 API
type ApiSaleStatus = "ON_SALE" | "UPCOMING" | "SOLD_OUT" | "ENDED";

type ApiMatchFromApi = {
  matchId: number;
  matchAt: string; // "2026-03-28T18:30:00"
  saleStatus: ApiSaleStatus;
  salesOpenAt: string; // "2026-02-13T11:00:00"
  homeClub: ApiClub;
  awayClub: ApiClub;
  stadium: ApiStadium;
};

type ApiStadium = {
  koName: string;
  enName: string;
};

type MatchesPayloadFromApi = {
  date: string; // YYYY-MM-DD
  matchCount: number;
  matches: ApiMatchFromApi[];
};

// 구단 목록 조회 API
type ApiClub = {
  clubId: number;
  koName: string;
  enName: string;
  logoImg: string;
}

type TeamsPayload = {
  clubs: ApiClub[];
}

/* ===========================
   UTIL
=========================== */
function formatKoreanDateLabel(isoDate: string) {
  // "2026-03-28" -> "3월 28일"
  const [, m, d] = isoDate.split("-").map((v) => Number(v));
  if (!m || !d) return isoDate;
  return `${m}월 ${d}일`;
}

const DOW_KO = ["일", "월", "화", "수", "목", "금", "토"] as const;

function formatMatchAt(matchAt: string) {
  // matchAt: "2026-03-28T18:30:00" -> 3월 28일, 토 · 14 : 00
  const dt = new Date(matchAt);

  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");

  const hh = String(dt.getHours()).padStart(2, "0");
  const mi = String(dt.getMinutes()).padStart(2, "0");

  const dateISO = `${yyyy}-${mm}-${dd}`;
  const dateText = formatKoreanDateLabel(dateISO);
  const weekdayKo = DOW_KO[dt.getDay()];
  const timeText = `${weekdayKo} · ${hh}:${mi}`;

  return { dateISO, dateText, timeText };
}

function formatSalesOpenAtKorean(salesOpenAt: string) {
  // salesOpenAt: "2026-03-21T16:00:00" -> 3월 21일 16:00
  if (!salesOpenAt) return "";

  const dt = new Date(salesOpenAt);

  if (Number.isNaN(dt.getTime())) return salesOpenAt; // 혹시 파싱 실패하면 원문 방어

  const m = dt.getMonth() + 1;
  const d = dt.getDate();
  const hh = String(dt.getHours()).padStart(2, "0");
  const mi = String(dt.getMinutes()).padStart(2, "0");

  return `${m}월 ${d}일 ${hh}:${mi}`;
}

function toMatchCardVariant(saleState?: ApiSaleStatus) {
  // MatchCard variant: comingSoon / soldOut / undefined
  if (saleState === "UPCOMING") return "comingSoon" as const;
  if (saleState === "SOLD_OUT") return "soldOut" as const;
  if (saleState === "ENDED") return "ended" as const;
  return undefined;
}

function overlayTexts(saleState: ApiSaleStatus, salesOpenAt?: string) {
  switch (saleState) {
    case "UPCOMING": {
      const openText = salesOpenAt ? `${formatSalesOpenAtKorean(salesOpenAt)} 오픈` : "오픈 예정";
      return { top: "Coming Soon", main: openText };
    }

    case "SOLD_OUT":
      return { top: "Sold Out", main: "예매 마감" };

    case "ENDED":
      return { top: "Ended", main: "경기 종료" };

    default:
      return { top: undefined, main: undefined };
  }
}

function TeamLogo({ club }: { club: ApiClub }) {
  return <IconPreview logoImg={club.logoImg} size="md" />;
}

function MatchCardSkeleton({ elevated }: { elevated?: boolean }) {
  return (
    <div
      className={cn(
        "w-full max-w-[1074px] rounded-2xl bg-[var(--foundation-neutral-white)]",
        elevated
          ? "outline outline-1 outline-offset-[-1px] outline-[var(--foundation-neutral-880)] shadow-sm"
          : "outline outline-1 outline-offset-[-1px] outline-[var(--foundation-neutral-880)]",
        "px-6 py-5"
      )}
    >
      {/* 상단: 날짜/시간 + 상태 뱃지 자리 */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-20 rounded-md" /> {/* 3월 28일 */}
          <Skeleton className="h-5 w-24 rounded-md" /> {/* 토 · 14:00 */}
        </div>
        <Skeleton className="h-6 w-24 rounded-full" /> {/* Coming Soon 등 */}
      </div>

      {/* 중단: 구장명 */}
      <div className="mt-3 flex flex-col gap-2">
        <Skeleton className="h-5 w-[60%] rounded-md" />
        <Skeleton className="h-4 w-[45%] rounded-md" />
      </div>

      {/* 하단: 원정/홈 팀 */}
      <div className="mt-5 flex items-center justify-between gap-6">
        {/* away */}
        <div className="flex items-center gap-3 min-w-0">
          <Skeleton className="h-10 w-10 rounded-xl" /> {/* 로고 */}
          <div className="flex flex-col gap-2 min-w-0">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-4 w-32 rounded-md" />
          </div>
        </div>

        {/* vs */}
        <Skeleton className="h-6 w-10 rounded-md" />

        {/* home */}
        <div className="flex items-center gap-3 min-w-0 justify-end">
          <div className="flex flex-col gap-2 items-end min-w-0">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-4 w-32 rounded-md" />
          </div>
          <Skeleton className="h-10 w-10 rounded-xl" /> {/* 로고 */}
        </div>
      </div>
    </div>
  );
}

function TeamCardSkeleton() {
  return (
    <div className="w-full rounded-2xl bg-[var(--foundation-neutral-white)] outline outline-1 outline-offset-[-1px] outline-[var(--foundation-neutral-120)] px-4 py-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" /> {/* 로고 */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24 rounded-md" /> {/* 팀명 */}
          <Skeleton className="h-4 w-16 rounded-md" /> {/* 서브텍스트 자리 */}
        </div>
      </div>
    </div>
  );
}



export default function Home() {
  const router = useRouter();
  const todayISO = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayISO); // 날짜(달력)
  const [matchesPayload, setMatchesPayload] = useState<MatchesPayloadFromApi | null>(null); // 경기 일정
  const [teamsPayload, setTeamsPayload] = useState<TeamsPayload | null>(null); // 팀 리스트
  const [loadingMatches, setLoadingMatches] = useState(false); // 로딩(spinner) - 경기 일정
  const [loadingTeams, setLoadingTeams] = useState(false); // 로딩(spinner) - 팀 리스트

  /* 경기 일정 - 날짜 변경 될 때마다 재 요청 */
  useEffect(() => {
    let cancelled = false;
    setLoadingMatches(true);

    (async () => {
      try {
        const data = await getMatches(selectedDate);
        if (cancelled) return;
        console.log("응답 data", data);
        setMatchesPayload(data ?? null);
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ApiError) {
          console.error("경기 목록 조회 실패:", e.message);
        }
        setMatchesPayload(null);
      } finally {
        if (!cancelled) setLoadingMatches(false);
      }
    })();

    return () => { cancelled = true; };
  }, [selectedDate]);

  /* 팀 리스트 요청 - 1회 요청 */
  useEffect(() => {
    let cancelled = false;
    setLoadingTeams(true);

    (async () => {
      try {
        const data = await getClubs();
        if (cancelled) return;
        setTeamsPayload(data ?? null);
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ApiError) {
          console.error("구단 목록 조회 실패:", e.message);
        }
        setTeamsPayload(null);
      } finally {
        if (!cancelled) setLoadingTeams(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  /* 3월 28일은 총 5개의 경기가 있습니다. */
  const countText = useMemo(() => {
    const dateLabel = formatKoreanDateLabel(selectedDate); // 날짜
    const count = matchesPayload?.matchCount ?? 0; // 개수
    return `${dateLabel}은 총 ${count}개의 경기가 있습니다.`
  }, [selectedDate, matchesPayload]);

  const matchCards = matchesPayload?.matches ?? []; // 경기 일정
  const clubs = teamsPayload?.clubs ?? []; // 팀 리스트

  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-[120px]">
      <main className="w-full">
        <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-12">
          <section className="w-full flex flex-col gap-1">
            {/* 섹션 타이틀 */}
            <div className="w-full flex justify-center">
              <div className="w-full max-w-[1088px] h-20 py-2.5 flex flex-col justify-center items-start">
                <div className="w-full text-left text-[var(--foundation-primary-500)] text-xs font-semibold font-['Pretendard'] leading-4">
                  Game Schedules
                </div>
                <div className="w-full text-left text-[var(--foundation-neutral-20)] text-xl font-medium font-['Pretendard'] leading-8">
                  일정별 경기
                </div>
              </div>
            </div>

            {/* 달력 + count + cards */}
            <div className="w-full flex flex-col items-center gap-4">
              <div className="w-full flex flex-col items-center gap-3">
                <div className="w-full max-w-[1088px] flex flex-col items-center gap-3">
                  <TodayInitSelectableDateStrip
                    onChange={(date) => {
                      const yyyy = date.getFullYear();
                      const mm = String(date.getMonth() + 1).padStart(2, "0");
                      const dd = String(date.getDate()).padStart(2, "0");
                      setSelectedDate(`${yyyy}-${mm}-${dd}`);
                    }}
                  />
                </div>
              </div>

              {/* count text */}
              <div className="w-full max-w-[1088px]">
                <div className="w-full text-left text-[var(--foundation-primary-500)] text-sm font-medium font-['Pretendard'] leading-5">
                  {loadingMatches ? "0월 00일은 총 0개의 경기가 있습니다." : countText}
                </div>
              </div>

              {/* MatchCard list */}
              <div className="w-full flex flex-col items-center gap-3">
                {loadingMatches ? (
                  <div className="w-full flex flex-col items-center gap-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <MatchCardSkeleton key={i} elevated={i === 0} />
                    ))}
                  </div>
                ) : (
                  matchCards.map((m, idx) => {
                    const { dateText, timeText } = formatMatchAt(m.matchAt); // 3월 28일, 토 · 14 : 00
                    const variant = toMatchCardVariant(m.saleStatus); // comming soon, soild out, ended
                    const overlay = overlayTexts(m.saleStatus, m.salesOpenAt); // 예매 중(ON_SALE), 판매 예정(UPCOMING), 매진(SOLD_OUT), 경기 종료(ENDED)
                    const isClickable = m.saleStatus === "ON_SALE";

                    return (
                      <button key={m.matchId} type="button" disabled={!isClickable} onClick={() => router.push(`/matches/${m.matchId}`)} className="w-full max-w-[1074px] text-left cursor-pointer">
                        <MatchCard
                          elevated={idx === 0}
                          withOutline={idx === 0}
                          variant={variant} // comming soon, soild out, ended
                          dateText={dateText} // 3월 28일
                          timeText={timeText} // 토 · 14 : 00
                          stadiumKo={m.stadium.koName} // 대구 삼성 라이온즈 파크
                          stadiumEn={m.stadium.enName} // Daegu Samsung Lions Park
                          away={{
                            ko: m.awayClub.koName, // SSG 랜더스
                            en: m.awayClub.enName, // SSG LANDERS
                            dataLogo: m.awayClub.koName, // SSG
                            logo: <TeamLogo club={m.awayClub} />, // logoImg
                          }}
                          home={{
                            ko: m.homeClub.koName, // 기아 타이거즈
                            en: m.homeClub.enName, // KIA TIGERS
                            dataLogo: m.homeClub.koName, // 기아
                            logo: <TeamLogo club={m.homeClub} />, // logoImg
                          }}
                          overlayTopText={overlay.top}
                          overlayMainText={overlay.main}
                        />
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          {/* ===========================
              Team Info Section (full-bleed bg + inner padding)
          =========================== */}
          <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-[var(--background-grey)] pb-48">
            <div className="px-4 sm:px-8 md:px-12 lg:px-18 xl:px-26 2xl:px-[120px]">
              <div className="w-full max-w-[1440px] mx-auto">
                {/* 섹션 타이틀 */}
                <div className="w-full flex justify-center">
                  <div className="w-full max-w-[1088px] h-20 py-2.5 flex flex-col justify-center items-start">
                    <div className="w-full text-left text-[var(--foundation-primary-500)] text-xs font-semibold font-['Pretendard'] leading-4">
                      Team Info
                    </div>
                    <div className="w-full text-left text-[var(--foundation-neutral-20)] text-xl font-medium font-['Pretendard'] leading-8">
                      구단 상세
                    </div>
                  </div>
                </div>

                {/* grid */}
                <div className="w-full flex justify-center mt-6">
                  <div
                    className={cn(
                      "w-full max-w-[1088px]",
                      "grid gap-3.5",
                      "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5"
                    )}
                  >
                    {loadingTeams ? (
                      Array.from({ length: 10 }).map((_, i) => <TeamCardSkeleton key={i} />)
                    ) : (
                      clubs.map((t) => (
                        <TeamInfoCard
                          key={t.clubId}
                          dataLogo={t.koName} // 두산 베어스
                          teamName={t.koName} // 두산 베어스
                          logo={<TeamLogo club={t} />} // <IconPreview index={7} size="md" />
                          onButtonClick={() => router.push(`/clubs/${t.clubId}`)}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
