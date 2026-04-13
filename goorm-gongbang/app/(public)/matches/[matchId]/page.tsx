"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { SeatPreferenceRecommendCard } from "@/components/common/SeatPreferenceRecommendCard";
import { BookingButton, TabButton } from "@/components/common/Button";
import { MatchInfoTab } from "@/components/common/match-detail/tabs/MatchInfoTab";
import { MatchRecommendTab } from "@/components/common/match-detail/tabs/MatchRecommendTab";
import { MatchRefundTab } from "@/components/common/match-detail/tabs/MatchRefundTab";
import { useParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { getMatchById, getOnboardingPreferences, saveOnboardingPreferencesBlocks, saveBookingOptions, enterQueue } from "@/lib/services";
import { SaleStatus, PurchaseStatus, MatchDetail, BookingOptionsRequest, BookingOptionsResponse, QueueEnterResponse } from "@/lib/types";
import { CDN_CLUBS_BASE_URL } from "@/lib/api/config";
import { ApiError } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toDate } from "@/lib/datetime";
import { useAuthStore } from "@/stores/authStore";
import { LoginRequiredModal } from "@/components/common/LoginRequiredModal";
import { PreferredZoneModal } from "@/components/common/PreferredZoneModal";
import Image from "next/image";
import { toast } from "sonner";
import { useTelemetry } from "@/lib/telemetry";
import { TelemetryProvider } from "@/lib/telemetry/context";
import { VQAChallenge } from "@/lib/telemetry/components";
import { CircleHelp, ChevronRight } from "lucide-react";

/* ===========================
    UI TYPES
=========================== */
type SeatPriceRow = {
  seatType: string;
  weekday: string;
  weekend: string;
};

type OutfieldPriceRow = {
  groupLabel?: string;
  category: string;
  weekday: string;
  weekend: string;
};

type SaleBadgeText = "예매 가능" | "구매 불가" | "매진" | "예매 마감" | "판매 예정";

type TabKey = "INFO" | "RECOMMEND" | "REFUND";

type Props = {
  heroBgImageUrl?: string;
  seatPrices?: SeatPriceRow[];
  outfieldPrices?: OutfieldPriceRow[];
};

const DEFAULT_SEAT_PRICES: SeatPriceRow[] = [
  { seatType: "중앙석", weekday: "80,000", weekend: "80,000" },
  { seatType: "테이블석", weekday: "52,000", weekend: "58,000" },
  { seatType: "익사이팅존", weekday: "28,000", weekend: "33,000" },
  { seatType: "블루석", weekday: "22,000", weekend: "24,000" },
  { seatType: "오렌지석(응원석)", weekday: "20,000", weekend: "22,000" },
  { seatType: "레드석", weekday: "17,000", weekend: "19,000" },
  { seatType: "네이비석", weekday: "14,000", weekend: "16,000" },
];

const DEFAULT_OUTFIELD_PRICES: OutfieldPriceRow[] = [
  { groupLabel: "", category: "일반", weekday: "9,000", weekend: "10,000" },
  {
    groupLabel: "외야 지정석",
    category: "청소년, 군경",
    weekday: "7,000",
    weekend: "8,000",
  },
  {
    groupLabel: "",
    category: "어린이, 유공자, 경로자",
    weekday: "4,500",
    weekend: "5,000",
  },
];

/** =========================
 *  Helpers
 * ========================= */
function resolveLogoSrc(input: string) {
  if (/^https?:\/\//i.test(input)) return input; // input이 이미 https:// 로 시작하면 그대로 사용
  if (!CDN_CLUBS_BASE_URL) return input; // env가 없을 경우
  return new URL(input.replace(/^\//, ""), CDN_CLUBS_BASE_URL).toString(); // base + 상대경로 결합
}

function toSaleBadgeText(
  saleStatus: SaleStatus,
  purchaseStatus: PurchaseStatus,
): SaleBadgeText {
  if (purchaseStatus === "PURCHASABLE") return "예매 가능";
  if (saleStatus === "SOLD_OUT") return "매진";
  if (saleStatus === "ENDED") return "예매 마감";
  if (saleStatus === "UPCOMING") return "판매 예정";
  return "구매 불가";
}

// 99분이 넘어도 99:59로 고정
function mmssTwoDigitsMinutes(sec: number) {
  const s = Math.max(0, sec);
  const mmRaw = Math.floor(s / 60);
  const ss = s % 60;
  const mm = Math.min(mmRaw, 99);
  const ssShown = mmRaw > 99 ? 59 : ss;

  return `${String(mm).padStart(2, "0")} : ${String(ssShown).padStart(2, "0")}`;
}

export default function MatchDetailSectionResponsive({
  heroBgImageUrl = "/match/match-detail.png",
  seatPrices = DEFAULT_SEAT_PRICES,
  outfieldPrices = DEFAULT_OUTFIELD_PRICES,
}: Props) {
  const router = useRouter();
  const params = useParams();
  const matchId = useMemo(() => {
    const raw = (params as Record<string, string | string[] | undefined>)?.matchId;
    const str = Array.isArray(raw) ? raw[0] : raw;
    const n = str ? Number(str) : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [params]);
  // AI telemetry 연동: 서비스 레이어 preflight flush가 동작하려면
  // 페이지 진입 시 telemetry runtime이 먼저 등록돼 있어야 한다.
  const { setStage, precheck } = useTelemetry({
    matchId: matchId ?? 0,
    autoStart: matchId !== null,
  });

  const [enabled, setEnabled] = useState(true);
  const [nearbySeatEnabled, setNearbySeatEnabled] = useState(true);
  const [activeTab, setActiveTab] = React.useState<TabKey>("INFO");
  const [selectedBlocks, setSelectedBlocks] = useState<number[]>([]);
  const [people, setPeople] = useState(2);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MatchDetail | null>(null);

  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = bootstrapped && !!accessToken && !!user;

  const [isPreferredZoneModalOpen, setIsPreferredZoneModalOpen] = useState(false);
  const [isLoginRequiredModalOpen, setIsLoginRequiredModalOpen] = useState(false);
  const [isPracticeVqaOpen, setIsPracticeVqaOpen] = useState(false);

  useEffect(() => {
    if (matchId === null) return;
    // AI telemetry 연동: 현재 화면을 queue enter 직전 구간으로만 라벨링한다.
    // 기존 예매 비즈니스 로직이나 화면 이동 흐름은 바꾸지 않는다.
    setStage("QUEUE_ENTER_PRECLICK");
  }, [matchId, setStage]);

  const handleBlockToggle = (blockNum: number) => {
    setSelectedBlocks((prev) =>
      prev.includes(blockNum)
        ? prev.filter((v) => v !== blockNum)
        : prev.length >= 10
          ? prev
          : [...prev, blockNum],
    );
  };

  /* 예매하기 버튼 클릭 */
  const handleRev = async () => {
    if (!matchId) return;

    if (!isLoggedIn) {
      setIsLoginRequiredModalOpen(true);
      return;
    }

    const bookingBody: BookingOptionsRequest = {
      recommendationEnabled: enabled,
      nearAdjacentToggle: enabled ? nearbySeatEnabled : false,
      ticketCount: enabled ? people : null,
    };

    try {
      const bookingResponse: BookingOptionsResponse = await saveBookingOptions(matchId, bookingBody);

      // TODO(local-dev): Cloudflare Turnstile 미연동 상태라 로컬 통합 테스트용 dev token으로 precheck를 통과시킨다.
      // 실제 연동 시 Turnstile 발급 토큰으로 교체 필요.
      const precheckPassed = await precheck("ok-local-dev");
      if (!precheckPassed) {
        toast.error("보안 사전 검증에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }

      const queueResponse: QueueEnterResponse = await enterQueue(matchId);

      const params = new URLSearchParams({
        recommendationEnabled: String(bookingResponse.recommendationEnabled ?? false),
        nearbySeatEnabled: String(bookingResponse.nearAdjacentToggle ?? false),
        ticketCount: String(bookingResponse.ticketCount ?? ""),
        queueRank: String(queueResponse.rank ?? ""),
        queueTotalWaitingCount: String(queueResponse.totalWaitingCount ?? ""),
      });

      router.push(`/recommend/${matchId}?${params.toString()}`);
    } catch (e) {
      if (e instanceof ApiError) {
        console.error("handleRev failed:", e.message);
        toast.error(e.message);
      } else {
        console.error("handleRev failed:", e);
      }
    }
  };


  /* 설정하기 버튼 클릭 */
  const handlePreferredZonesClick = async () => {
    if (!isLoggedIn) {
      setIsLoginRequiredModalOpen(true);
      return;
    }

    try {
      const data = await getOnboardingPreferences();
      setSelectedBlocks(data.preferredBlockIds ?? []);
      setIsPreferredZoneModalOpen(true);
    } catch (e) {
      if (e instanceof ApiError) {
        console.error("onboarding preferences fetch failed:", e.message);
      } else {
        console.error("onboarding preferences fetch failed:", e);
      }
      setIsPreferredZoneModalOpen(true);
    }
  };

  /* 수정하기 버튼 클릭 */
  const handlePreferredZoneConfirm = async () => {
    if (!isLoggedIn) {
      setIsLoginRequiredModalOpen(true);
      return;
    }

    try {
      await saveOnboardingPreferencesBlocks({
        preferredBlockIds: selectedBlocks,
      });

      toast.success("선호 구역이 수정되었어요.");
      setIsPreferredZoneModalOpen(false);
    } catch (e) {
      if (e instanceof ApiError) {
        toast.error("선호 구역 수정에 실패했어요.");
        console.error("saveOnboardingPreferencesBlocks failed:", e.message);
      } else {
        toast.error("선호 구역 수정에 실패했어요.");
        console.error("saveOnboardingPreferencesBlocks failed:", e);
      }
    }
  };

  useEffect(() => {
    if (!matchId) return;

    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getMatchById(matchId);
        if (!alive) return;

        setData((data as MatchDetail) ?? null);
      } catch (e) {
        if (!alive) return;
        if (e instanceof ApiError) {
          setError(e.message);
        } else {
          setError("서버 오류");
        }
        setData(null);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [matchId]);

  if (!matchId) {
    return (
      <div className="p-6 text-sm text-[var(--foundation-neutral-720)]">
        잘못된 matchId 입니다.
      </div>
    );
  }
  if (loading || !data) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-0 z-10 grid min-h-screen place-items-center">
        <Spinner className="h-6 w-6" />
      </div>

      <section className="relative w-full bg-[var(--background-grey)] overflow-hidden">
        <div className="h-[420px] sm:h-96" />
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-28 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,720px)_minmax(0,360px)] gap-6 lg:gap-10 items-start">
          <div className="min-h-[70vh]" />
          <aside className="hidden lg:block min-h-[360px]" />
        </div>
      </section>
    </div>
  );
}


  if (error) {
    return (
      <div className="p-6 text-sm text-[var(--foundation-neutral-720)]">
        {error}
      </div>
    );
  }

  /** =========================
   *  API -> UI Mapping
   * ========================= */
  const homeKo = data.homeClub.koName;
  const homeEn = data.homeClub.enName;
  const awayKo = data.awayClub.koName;
  const awayEn = data.awayClub.enName;

  const stadiumKo = data.matchGuide.placeDisplay;
  const stadiumAddress = data.matchGuide.addressDisplay;

  const matchAtText = data.matchGuide.datetimeDisplay;
  const ageLimitText = data.matchGuide.ageLimit;

  const homeLogoUrl = resolveLogoSrc(data.homeClub.logoImg);
  const awayLogoUrl = resolveLogoSrc(data.awayClub.logoImg);

  const homeClubColor = data.homeClub.clubColor;
  const awayClubColor = data.awayClub.clubColor;

  const saleBadgeText = toSaleBadgeText(
    data.saleStatus,
    data.matchGuide.purchaseStatus,
  );
  const dDayText = `경기 ${data.matchGuide.matchDdayLabel}`;

  const SALE_BADGE_STYLE: Record<
    SaleBadgeText,
    { wrapper: string; text: string }
  > = {
    "예매 가능": {
      wrapper:
        "bg-[var(--foundation-primary-10)] outline-[var(--foundation-primary-600)]",
      text: "text-[var(--foundation-primary-600)]",
    },
    "구매 불가": {
      wrapper:
        "bg-[var(--foundation-neutral-900)] outline-[var(--foundation-neutral-720)]",
      text: "text-[var(--foundation-neutral-720)]",
    },
    매진: {
      wrapper:
        "bg-[var(--foundation-red-50)] outline-[var(--foundation-red-400)]",
      text: "text-[var(--foundation-red-400)]",
    },
    "예매 마감": {
      wrapper:
        "bg-[var(--foundation-neutral-900)] outline-[var(--foundation-neutral-720)]",
      text: "text-[var(--foundation-neutral-720)]",
    },
    "판매 예정": {
      wrapper:
        "bg-[var(--foundation-blue-50)] outline-[var(--foundation-blue-500)]",
      text: "text-[var(--foundation-blue-500)]",
    },
  };

  // BookingButton에 넘길 Date
  const matchAtDate = toDate(data.matchAt);
  const saleAtDate = new Date(matchAtDate);
  saleAtDate.setDate(saleAtDate.getDate() - 7);
  saleAtDate.setHours(11, 0, 0, 0);

  return (
    <div className="w-full">
      <section className="relative w-full bg-[var(--background-grey)] overflow-hidden">
        {/* background image */}
        <div className="absolute inset-x-0 -top-[300px] sm:-top-[380px] md:-top-[455px] h-[900px] sm:h-[997px] w-full">
          <Image
            src={heroBgImageUrl}
            fill
            sizes="100vw"
            alt=""
            loading="eager"
            fetchPriority="high"
            quality={25}
            className="object-cover blur-[2px]"
          />
        </div>
        <div className="absolute inset-0 opacity-30 bg-black blur-[2px]" />

        {/* content container */}
        <div className="relative w-full">
          <div className="h-[420px] sm:h-96" />

          {/* Home/Away cards */}
          <div className="absolute left-0 right-0 bottom-0 sm:bottom-0">
            <div className="w-full">
              <div className="relative">
                {/* VS  */}
                <div
                  className="
                  absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                  z-20
                  px-2 py-1 rounded-full
                  text-[var(--foundation-neutral-840)] font-normal font-['Pretendard']
                  text-xs sm:text-sm md:text-base
                  pointer-events-none
                "
                >
                  VS
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-0">
                  {/* Home */}
                  <div className="max-w-[1440px] relative" style={{ backgroundColor: homeClubColor }}>
                    <div className="h-24 sm:h-28 px-4 sm:px-6 lg:px-10 py-4 flex items-center">
                      <div className="w-full flex items-center justify-end">
                        <div className="flex items-center gap-3 sm:gap-10 md:gap-20 lg:gap-30 min-w-0">
                          {/* Logo */}
                          <div className="shrink-0 mr-1 sm:mr-2 -translate-y-0 sm:-translate-y-0 md:-translate-y-15">
                            <div className="relative w-22 h-22 sm:w-30 sm:h-30 md:w-40 md:h-40">
                              <Image
                                src={homeLogoUrl}
                                alt="home logo"
                                fill
                                sizes="(min-width: 768px) 160px, (min-width: 640px) 120px, 88px"
                                className="object-contain"
                                loading="eager"
                                fetchPriority="high"
                              />
                            </div>
                          </div>

                          {/* Text */}
                          <div className="min-w-0 flex flex-col items-end">
                            <div className="text-right text-[var(--foundation-neutral-940)] text-base font-medium font-['Pretendard'] leading-6">
                              홈
                            </div>

                            <div className="min-w-0 truncate text-[var(--foundation-neutral-white)] text-2xl sm:text-3xl font-semibold font-['Pretendard'] leading-9 sm:leading-10">
                              {homeKo}
                            </div>

                            <div className="min-w-0 truncate text-right text-[var(--foundation-neutral-840)] text-xs font-normal font-['Pretendard'] leading-4">
                              {homeEn}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Away */}
                  <div className="relative" style={{ backgroundColor: awayClubColor }}>
                    <div className="h-24 sm:h-28 px-4 sm:px-6 lg:px-10 py-4 flex items-center">
                      <div className="w-full flex items-center justify-start">
                        <div className="flex items-center gap-3 sm:gap-10 md:gap-20 lg:gap-30 min-w-0">
                          {/* Text */}
                          <div className="min-w-0 flex flex-col items-start">
                            <div className="text-left text-[var(--foundation-neutral-940)] text-base font-medium font-['Pretendard'] leading-6">
                              어웨이
                            </div>

                            <div className="min-w-0 truncate text-[var(--foundation-neutral-white)] text-2xl sm:text-3xl font-semibold font-['Pretendard'] leading-9 sm:leading-10">
                              {awayKo}
                            </div>

                            <div className="min-w-0 truncate text-left text-[var(--foundation-neutral-840)] text-xs font-normal font-['Pretendard'] leading-4">
                              {awayEn}
                            </div>
                          </div>

                          {/* Logo */}
                          <div className="shrink-0 ml-1 sm:ml-2 -translate-y-0 sm:-translate-y-0 md:-translate-y-15">
                            <div className="relative w-22 h-22 sm:w-30 sm:h-30 md:w-40 md:h-40">
                              <Image
                                src={awayLogoUrl}
                                alt="away logo"
                                fill
                                sizes="(min-width: 768px) 160px, (min-width: 640px) 120px, 88px"
                                className="object-contain"
                                loading="eager"
                                fetchPriority="high"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Body ===== */}
      <section className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-28 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,720px)_minmax(0,360px)] gap-6 lg:gap-10 items-start">
          {/* Left */}
          <div className="min-w-0 flex flex-col gap-4">
            {/* Tabs */}
            <div className="border-b border-[var(--foundation-neutral-720)] flex items-center gap-2">
              <TabButton
                active={activeTab === "INFO"}
                onClick={() => setActiveTab("INFO")}
                label="경기 안내"
              />
              <TabButton
                active={activeTab === "RECOMMEND"}
                onClick={() => setActiveTab("RECOMMEND")}
                label="추천구역 안내"
              />
              <TabButton
                active={activeTab === "REFUND"}
                onClick={() => setActiveTab("REFUND")}
                label="취소/환불"
              />
            </div>

            {/* Info */}
            <div className="h-[70vh] overflow-y-auto scrollbar-hide thin-scrollbar">
              {activeTab === "INFO" && (
                <MatchInfoTab
                  homeKo={homeKo}
                  awayKo={awayKo}
                  ageLimitText={ageLimitText}
                  stadiumKo={stadiumKo}
                  stadiumAddress={stadiumAddress}
                  matchAtText={matchAtText}
                  seatPrices={seatPrices}
                  outfieldPrices={outfieldPrices}
                />
              )}

              {/* 추천죄석 안내 */}
              {activeTab === "RECOMMEND" && <MatchRecommendTab />}

              {/* 취소/환불 */}
              {activeTab === "REFUND" && <MatchRefundTab />}
            </div>
          </div>
          {/* Right (sticky on desktop) */}
          <aside className="lg:sticky lg:top-6">
            <div className="w-full bg-[var(--background-white)] rounded-2xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-[var(--stroke-interactive-neutral-default)]">
              <div className="p-4 sm:p-6 flex flex-col items-center gap-3.5">
                <div className="w-full flex flex-col gap-6">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-full flex items-center gap-3">
                        {saleBadgeText &&
                          (saleBadgeText === "예매 가능" ||
                            saleBadgeText === "매진" ||
                            saleBadgeText === "판매 예정" ||
                            saleBadgeText === "예매 마감") &&
                          (() => {
                            const s = SALE_BADGE_STYLE[saleBadgeText];
                            return (
                              <div
                                className={[
                                  "h-6 px-2 rounded-[100px] outline outline-1 outline-offset-[-1px] flex items-center",
                                  s.wrapper,
                                ].join(" ")}
                              >
                                <div
                                  className={[
                                    "text-xs font-semibold font-['Pretendard'] leading-4",
                                    s.text,
                                  ].join(" ")}
                                >
                                  {saleBadgeText}
                                </div>
                              </div>
                            );
                          })()}
                        <div
                          className={`text-sm font-semibold font-['Pretendard'] leading-5 ${saleBadgeText === "판매 예정"
                              ? "text-[var(--foundation-blue-500)]"
                              : "text-[var(--foundation-red-500)]"
                            }`}
                        >
                          {dDayText}
                        </div>
                      </div>

                      <div className="w-full text-[var(--text-normal-n240)] text-lg sm:text-xl font-medium font-['Pretendard'] leading-7 sm:leading-8">
                        {homeKo} vs {awayKo}
                      </div>
                    </div>

                    <div className="text-[var(--text-info-n600)] text-sm font-normal font-['Pretendard'] leading-5">
                      일시 : {matchAtText} <br />
                      장소 : {stadiumAddress}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="h-0 outline outline-1 outline-offset-[-0.50px] outline-[var(--foundation-neutral-900)]" />

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-3.5">
                        <SeatPreferenceRecommendCard
                          enabled={enabled}
                          onChange={setEnabled}
                          nearbySeatEnabled={nearbySeatEnabled}
                          onNearbySeatChange={setNearbySeatEnabled}
                          onPreferredZonesClick={handlePreferredZonesClick}
                          people={people}
                          onPeopleChange={setPeople}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full">
                  <BookingButton
                    saleAt={saleAtDate}
                    disabled={
                      saleBadgeText === "매진" || saleBadgeText === "예매 마감"
                    }
                    disabledReason={
                      saleBadgeText === "매진"
                        ? "SOLD_OUT"
                        : saleBadgeText === "예매 마감"
                          ? "ENDED"
                          : "ETC"
                    }
                    countdownFormatter={mmssTwoDigitsMinutes}
                    onClick={handleRev}
                  />
                  <div className="relative mt-3 flex justify-center">
                    <div className="group relative inline-flex">
                      <button
                        type="button"
                        onClick={() => setIsPracticeVqaOpen(true)}
                        className="inline-flex items-center gap-1 text-sm font-medium leading-5 text-[var(--foundation-primary-500)] transition hover:text-[var(--foundation-primary-600)]"
                      >
                        <CircleHelp className="h-4 w-4 shrink-0" />
                        <span>예매 전 보안 인증을 미리 경험해보세요</span>
                        <ChevronRight className="h-4 w-4 shrink-0" />
                      </button>
                      <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-[320px] -translate-x-1/2 rounded-2xl border border-[var(--foundation-neutral-880)] bg-white px-4 py-3 text-left opacity-0 shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition duration-150 group-hover:opacity-100">
                        <p className="text-sm font-semibold leading-5 text-[var(--foundation-neutral-240)]">
                          보안 인증이란?
                        </p>
                        <p className="mt-2 text-xs font-medium leading-5 text-[var(--foundation-neutral-400)]">
                          예매 진행 시 사이버 보안 인증이 필요해요. 실제 예매와 동일한 방식으로 진행되며, 최대 3번의 기회가 주어져요. 미리 경험해두면 예매 시 더 쉽게 통과할 수 있어요.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* 선호 구역 설정 모달 */}
      {isPreferredZoneModalOpen && (
        <PreferredZoneModal
          open={isPreferredZoneModalOpen}
          selectedBlocks={selectedBlocks}
          onToggleBlock={handleBlockToggle}
          onReset={() => setSelectedBlocks([])}
          onClose={() => setIsPreferredZoneModalOpen(false)}
          onConfirm={handlePreferredZoneConfirm}
        />
      )}

      {/* 로그인 유도 모달 */}
      {isLoginRequiredModalOpen && (
        <LoginRequiredModal
          open={isLoginRequiredModalOpen}
          onClose={() => setIsLoginRequiredModalOpen(false)}
        />
      )}

      {isPracticeVqaOpen && matchId !== null && (
        <TelemetryProvider matchId={matchId} autoStart={false}>
          <VQAChallenge
            mode="practice"
            onSuccess={() => { }}
            onCancel={() => setIsPracticeVqaOpen(false)}
          />
        </TelemetryProvider>
      )}
    </div>
  );
}
