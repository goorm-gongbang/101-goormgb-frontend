"use client";

import { useEffect, useMemo, useState } from "react";
import { TodayInitSelectableDateStrip } from "@/components/common/TodayInitSelectableDateStrip";
import { MatchCard } from "@/components/common/MatchCard";
import { IconPreview } from "@/components/common/IconPreview";
import { TeamInfoCard } from "@/components/common/TeamInfoCard";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useMatchTracking } from "@/hooks/useAnalytics";
import { getMatches, getClubs } from "@/lib/services";
import { SaleStatus, Club, MatchesData, ClubsData } from "@/lib/types";
import { ApiError } from "@/lib/api";
import { formatKST } from "@/lib/datetime";

function toMatchCardVariant(saleState?: SaleStatus) {
  if (saleState === "UPCOMING") return "comingSoon" as const;
  if (saleState === "SOLD_OUT") return "soldOut" as const;
  if (saleState === "ENDED") return "ended" as const;
  return undefined;
}

function TeamLogo({
  club,
  priorityLoad = false,
}: {
  club: Club;
  priorityLoad?: boolean;
}) {
  return (
    <IconPreview
      logoImg={club.logoImg}
      size="md"
      priorityLoad={priorityLoad}
    />
  );
}

function TeamLogoClub({
  club,
  priorityLoad = false,
}: {
  club: Club;
  priorityLoad?: boolean;
}) {
  return (
    <IconPreview
      logoImg={club.logoImg}
      size="md_2"
      priorityLoad={priorityLoad}
    />
  );
}

function MatchCardSkeleton() {
  return (
    <div
      className={cn(
        "w-full max-w-[1074px] h-28 rounded-2xl bg-[var(--foundation-neutral-white)]",
        "outline outline-1 outline-offset-[-1px] outline-[var(--foundation-neutral-900)]",
        "px-4 sm:px-6 lg:px-9",
        "flex items-center",
      )}
    >
      <div className="w-full flex items-center justify-between gap-3 sm:gap-4 md:gap-6 lg:gap-8 min-w-0">
        <div className="flex items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 min-w-0">
          <div className="flex items-center gap-4 sm:gap-6 md:gap-8 min-w-0">
            <div className="flex w-20 shrink-0 flex-col gap-2">
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>

            <div className="hidden sm:flex w-32 sm:w-40 md:w-48 lg:w-56 flex-col gap-2">
              <Skeleton className="h-6 w-[70%] rounded-md" />
              <Skeleton className="h-4 w-[55%] rounded-md" />
            </div>
          </div>

          <div className="h-28 flex items-center gap-3 md:gap-4 min-w-0">
            <div className="hidden sm:flex w-20 sm:w-24 md:w-28 lg:w-32 flex-col items-end gap-2">
              <Skeleton className="h-5 w-[80%] rounded-md" />
              <Skeleton className="h-4 w-[65%] rounded-md" />
            </div>

            <div className="h-28 w-[102px] shrink-0 px-[3.13px] py-6 flex items-center justify-center">
              <Skeleton className="h-20 w-24 rounded-xl" />
            </div>

            <Skeleton className="h-4 w-5 shrink-0 rounded-md" />

            <div className="h-28 w-[102px] shrink-0 px-[3.13px] py-9 flex items-center justify-center">
              <Skeleton className="h-14 w-24 rounded-xl" />
            </div>

            <div className="hidden sm:flex w-20 sm:w-24 md:w-28 lg:w-32 flex-col gap-2">
              <Skeleton className="h-5 w-[80%] rounded-md" />
              <Skeleton className="h-4 w-[65%] rounded-md" />
            </div>

            <Skeleton className="h-6 w-20 shrink-0 rounded-full" />
          </div>
        </div>

        <div className="w-9 h-12 flex items-center justify-center shrink-0">
          <Skeleton className="h-10 w-5 rounded-md" />
        </div>
      </div>
    </div>
  );
}

function TeamCardSkeleton() {
  return (
    <div className="relative self-stretch rounded-2xl px-4 py-3 outline outline-1 outline-offset-[-1px] outline-[var(--foundation-neutral-880)]/50 inline-flex flex-col justify-start items-start gap-1.5">
      <div className="w-full h-32 px-1 py-2.5 bg-[var(--background-grey)] flex flex-col justify-center items-center gap-1.5 overflow-hidden">
        <Skeleton className="h-24 w-24 rounded-xl" />
      </div>

      <div className="self-stretch flex flex-col justify-center items-center">
        <div className="self-stretch inline-flex justify-center items-center">
          <Skeleton className="mb-2 h-5 w-24 rounded-md" />
        </div>
      </div>

      <Skeleton className="self-stretch h-8 min-w-14 rounded-md" />
    </div>
  );
}

function getTodayISOInKST() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

export default function Home() {
  const router = useRouter();
  const { onMatchClick } = useMatchTracking();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [matchesPayload, setMatchesPayload] = useState<MatchesData | null>(
    null,
  );
  const [teamsPayload, setTeamsPayload] = useState<ClubsData | null>(null);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(true);

  useEffect(() => {
    setSelectedDate(getTodayISOInKST());
  }, []);

  useEffect(() => {
    if (!selectedDate) return;

    let cancelled = false;
    setLoadingMatches(true);

    (async () => {
      try {
        const data = await getMatches(selectedDate);
        if (cancelled) return;

        setMatchesPayload(data ?? null);
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ApiError) {
          console.error("경기 목록 조회 실패:", e.message);
        } else {
          console.error("경기 목록 조회 실패:", e);
        }
        setMatchesPayload(null);
      } finally {
        if (!cancelled) setLoadingMatches(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

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
        } else {
          console.error("구단 목록 조회 실패:", e);
        }
        setTeamsPayload(null);
      } finally {
        if (!cancelled) setLoadingTeams(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const countText = useMemo(() => {
    if (!selectedDate) return "0월 00일은 총 0개의 경기가 있습니다.";

    const dateLabel = formatKST(selectedDate, {
      month: "long",
      day: "numeric",
      year: undefined,
      hour: undefined,
      minute: undefined,
    });
    const count = matchesPayload?.matchCount ?? 0;
    return `${dateLabel}은 총 ${count}개의 경기가 있습니다.`;
  }, [selectedDate, matchesPayload]);

  const matchCards = matchesPayload?.matches ?? [];
  const clubs = teamsPayload?.clubs ?? [];

  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-[120px]">
      <main className="w-full">
        <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-12">
          <section className="w-full flex flex-col gap-1">
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

            <div className="w-full flex flex-col items-center gap-4">
              <div className="w-full flex flex-col items-center gap-3">
                <div className="w-full max-w-[1088px] flex flex-col items-center gap-3">
                  {selectedDate ? (
                    <TodayInitSelectableDateStrip
                      onChange={(date) => {
                        const yyyy = date.getFullYear();
                        const mm = String(date.getMonth() + 1).padStart(2, "0");
                        const dd = String(date.getDate()).padStart(2, "0");
                        setSelectedDate(`${yyyy}-${mm}-${dd}`);
                      }}
                    />
                  ) : (
                    <div className="h-[156px] w-full" />
                  )}
                </div>
              </div>

              <div className="w-full max-w-[1088px]">
                <div className="w-full text-left text-[var(--foundation-primary-500)] text-sm font-medium font-['Pretendard'] leading-5">
                  {loadingMatches
                    ? "0월 00일은 총 0개의 경기가 있습니다."
                    : countText}
                </div>
              </div>

              <div className="w-full flex flex-col items-center gap-3 min-h-[608px]">
                {loadingMatches ? (
                  <div className="w-full flex flex-col items-center gap-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <MatchCardSkeleton key={i} />
                    ))}
                  </div>
                ) : matchCards.length === 0 ? (
                  <div className="w-full max-w-[1074px] rounded-2xl bg-[var(--foundation-neutral-white)] px-6 py-12 text-center">
                    <p className="text-base font-medium text-[var(--foundation-neutral-400)]">
                      선택한 날짜에는 예정된 경기가 없습니다.
                    </p>
                  </div>
                ) : (
                  matchCards.map((m, idx) => {
                    const dateText = formatKST(m.matchAt, {
                      month: "long",
                      day: "numeric",
                      year: undefined,
                      hour: undefined,
                      minute: undefined,
                    });
                    const timeText = `${new Intl.DateTimeFormat("ko-KR", { weekday: "short", timeZone: "Asia/Seoul" }).format(new Date(m.matchAt))} · ${formatKST(
                      m.matchAt,
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        year: undefined,
                        month: undefined,
                        day: undefined,
                      },
                    )}`;

                    const variant = toMatchCardVariant(m.saleStatus);
                    const isClickable = m.saleStatus !== "ENDED";
                    const isAboveFold = idx < 2;

                    return (
                      <button
                        key={m.matchId}
                        type="button"
                        disabled={!isClickable}
                        onClick={() => {
                          onMatchClick({ match_slug: String(m.matchId) });
                          router.push(`/matches/${m.matchId}`);
                        }}
                        className="w-full max-w-[1074px] text-left cursor-pointer"
                      >
                        <MatchCard
                          elevated={idx === 0}
                          variant={variant}
                          dateText={dateText}
                          timeText={timeText}
                          stadiumKo={m.stadium.koName}
                          stadiumEn={m.stadium.enName}
                          away={{
                            ko: m.awayClub.koName,
                            en: m.awayClub.enName,
                            dataLogo: m.awayClub.koName,
                            logo: (
                              <TeamLogo
                                club={m.awayClub}
                                priorityLoad={isAboveFold}
                              />
                            ),
                          }}
                          home={{
                            ko: m.homeClub.koName,
                            en: m.homeClub.enName,
                            dataLogo: m.homeClub.koName,
                            logo: (
                              <TeamLogo
                                club={m.homeClub}
                                priorityLoad={isAboveFold}
                              />
                            ),
                          }}
                        />
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-[var(--background-grey)] pb-48">
            <div className="px-4 sm:px-8 md:px-12 lg:px-18 xl:px-26 2xl:px-[120px]">
              <div className="w-full max-w-[1440px] mx-auto">
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

                <div className="w-full flex justify-center mt-6">
                  <div
                    className={cn(
                      "w-full max-w-[1088px]",
                      "grid gap-3.5",
                      "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5",
                    )}
                  >
                    {loadingTeams
                      ? Array.from({ length: 10 }).map((_, i) => (
                        <TeamCardSkeleton key={i} />
                      ))
                      : clubs.map((t, idx) => {
                        const isAboveFold = idx < 4;

                        return (
                          <TeamInfoCard
                            key={t.clubId}
                            dataLogo={t.koName}
                            teamName={t.koName}
                            logo={
                              <TeamLogoClub
                                club={t}
                                priorityLoad={isAboveFold}
                              />
                            }
                            onClick={() => router.push(`/clubs/${t.clubId}`)}
                          />
                        );
                      })}
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
