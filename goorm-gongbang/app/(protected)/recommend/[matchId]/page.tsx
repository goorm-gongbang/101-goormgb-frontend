"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { BlockSeatDetailView } from "@/components/common/BlockSeatDetailView";
import { PrimaryButton } from "@/components/common/Button";
import { RecommendExitModal } from "@/components/common/RecommendExitModal";
import { RecommendSeatUnavailableModal } from "@/components/common/RecommendSeatUnavailableModal";
import { RecommendSoldOutModal } from "@/components/common/RecommendSoldOutModal";
import { SeatFindingModal } from "@/components/common/SeatFindingModal";
import { SeatRecommendSummaryCard, type SeatRecommendItem } from "@/components/common/SeatRecommendSummaryCard";
import { TicketingNavigator } from "@/components/common/TicketingNavigator";
import { Toggle } from "@/components/common/Toggle";
import { StadiumMap } from "@/components/my/StadiumMap";
import { CDN_CLUBS_BASE_URL } from "@/lib/api/config";
import { QueueStatusType } from "@/lib/types";
import { getQueueStatus } from "@/lib/services";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";

type SeatListItem = {
  name: string;
  count: number;
  blockNumbers: number[];
  color: SeatRecommendItem["color"];
};

type SeatSection = {
  title: string;
  items: SeatListItem[];
};

const recommendItems: SeatRecommendItem[] = [
  {
    id: "205",
    seatLabel: "오렌지석(응원석)",
    blockLabel: "205블럭",
    blockNumber: 205,
    remainCount: 132,
    priceText: "20,000원/매",
    color: "orange",
  },
  {
    id: "208",
    seatLabel: "오렌지석(응원석)",
    blockLabel: "208블럭",
    blockNumber: 208,
    remainCount: 110,
    priceText: "20,000원/매",
    color: "orange",
  },
  {
    id: "103",
    seatLabel: "레드석",
    blockLabel: "103블럭",
    blockNumber: 103,
    remainCount: 60,
    priceText: "20,000원/매",
    color: "red",
  },
];

const seatSections: SeatSection[] = [
  {
    title: "프리미엄",
    items: [
      {
        name: "테라존(중앙 프리미엄석)",
        count: 20,
        blockNumbers: [1],
        color: "navy",
      },
    ],
  },
  {
    title: "1루 구역",
    items: [
      {
        name: "1루 퍼플석(테이블석)",
        count: 10,
        blockNumbers: [111, 110, 213, 212],
        color: "navy",
      },
      {
        name: "1루 익사이팅존",
        count: 14,
        blockNumbers: [2],
        color: "red",
      },
      {
        name: "1루 블루석",
        count: 37,
        blockNumbers: [107, 108, 109, 209, 210, 211],
        color: "green",
      },
      {
        name: "1루 오렌지석(응원석)",
        count: 31,
        blockNumbers: [205, 206, 207, 208],
        color: "orange",
      },
      {
        name: "1루 레드석",
        count: 20,
        blockNumbers: [101, 102, 103, 104, 105, 106, 201, 202, 203, 204],
        color: "red",
      },
      {
        name: "1루 네이비석",
        count: 520,
        blockNumbers: [301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317],
        color: "navy",
      },
      {
        name: "1루 그린석(외야석)",
        count: 680,
        blockNumbers: [401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411],
        color: "green",
      },
    ],
  },
  {
    title: "3루 구역",
    items: [
      {
        name: "3루 퍼플석(테이블석)",
        count: 7,
        blockNumbers: [112, 113, 214, 215],
        color: "navy",
      },
      {
        name: "3루 익사이팅존",
        count: 20,
        blockNumbers: [3],
        color: "red",
      },
      {
        name: "3루 블루석",
        count: 30,
        blockNumbers: [114, 115, 116, 216, 217, 218],
        color: "green",
      },
      {
        name: "3루 오렌지석(응원석)",
        count: 7,
        blockNumbers: [219, 220, 221, 222],
        color: "orange",
      },
      {
        name: "3루 레드석",
        count: 7,
        blockNumbers: [117, 118, 119, 120, 121, 122, 226, 225, 224, 223],
        color: "red",
      },
      {
        name: "3루 네이비석",
        count: 7,
        blockNumbers: [318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 333, 334],
        color: "navy",
      },
      {
        name: "3루 그린석(외야석)",
        count: 7,
        blockNumbers: [412, 413, 414, 415, 416, 417, 418, 419, 420, 421, 422],
        color: "green",
      },
    ],
  },
];

export default function Page() {
  const searchParams = useSearchParams();
  const recommendationEnabled =
    searchParams.get("recommendationEnabled") === "true";

  const nearbySeatEnabled = recommendationEnabled
    ? searchParams.get("nearbySeatEnabled") === "true"
    : false;

  const ticketCount = recommendationEnabled
    ? searchParams.get("ticketCount")
      ? Number(searchParams.get("ticketCount"))
      : null
    : null;

  const initialQueueRank = searchParams.get("queueRank")
    ? Number(searchParams.get("queueRank"))
    : null;

  const initialQueueTotalWaitingCount = searchParams.get("queueTotalWaitingCount")
    ? Number(searchParams.get("queueTotalWaitingCount"))
    : null;

  const [queueStatus, setQueueStatus] = useState<QueueStatusType | null>(null);
  const [queueRank, setQueueRank] = useState<number | null>(initialQueueRank);
  const [totalWaitingCount, setTotalWaitingCount] = useState<number | null>(initialQueueTotalWaitingCount);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const [pollingMs, setPollingMs] = useState<number>(3000);


  const router = useRouter();
  const params = useParams();
  const matchId = useMemo(() => {
    const raw = (params as Record<string, string | string[] | undefined>)?.matchId;
    const value = Array.isArray(raw) ? raw[0] : raw;
    const parsed = value ? Number(value) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [params]);

  const [loading, setLoading] = useState(false);

  const pollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasHandledQueueEndRef = useRef(false);
  const clearQueuePolling = () => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
  };
  const scheduleNextPoll = (ms: number, callback: () => void) => {
    clearQueuePolling();
    pollingTimeoutRef.current = setTimeout(callback, ms);
  };

  const [isPreferredRecommendOn, setIsPreferredRecommendOn] = useState(recommendationEnabled);
  const [selectedRecommendId, setSelectedRecommendId] = useState<string | null>(null);
  const [hoveredRecommendBlock, setHoveredRecommendBlock] = useState<number | null>(null);

  const [hoveredSeatBlocks, setHoveredSeatBlocks] = useState<number[]>([]);
  const [selectedSeatListItem, setSelectedSeatListItem] = useState<SeatListItem | null>(null);
  const [selectedSeatBlocks, setSelectedSeatBlocks] = useState<number[]>([]);
  const [activeSeatDetailBlock, setActiveSeatDetailBlock] = useState<number | null>(null);
  const [selectedDetailSeats, setSelectedDetailSeats] = useState<string[]>([]);

  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isSoldOutModalOpen, setIsSoldOutModalOpen] = useState(false);
  const selectedRecommend = recommendItems.find((item) => item.id === selectedRecommendId);
  const isRecommendEmpty = recommendItems.length === 0;
  const isSeatDetailOpen = !isPreferredRecommendOn && selectedSeatListItem !== null && selectedSeatBlocks.length > 0 && activeSeatDetailBlock !== null;
  const [isSeatUnavailableModalOpen, setIsSeatUnavailableModalOpen] = useState(false);
  const [isFindingSeat, setIsFindingSeat] = useState(true);

  const selectedSeatRows = useMemo(() => {
    if (!selectedSeatListItem) return [];

    return selectedDetailSeats.map((seatKey) => {
      const [blockNumber, rowLabel, seatNumber] = seatKey.split("-");

      return {
        key: seatKey,
        gradeLabel: selectedSeatListItem.name,
        seatLabel: `${blockNumber}블럭 ${rowLabel}열 ${seatNumber}번`,
      };
    });
  }, [selectedDetailSeats, selectedSeatListItem]);

  const handleProceedToPayment = () => {
    if (!matchId) return;
    router.push(`/pay/${matchId}`);
  };

  const handleBack = () => setIsExitModalOpen(true);
  const handleExit = () => {
    if (!matchId) {
      router.back();
      return;
    }

    router.push(`/matches/${matchId}`);
  };

  const handleSelectSeatListItem = (item: SeatListItem) => {
    setSelectedSeatListItem(item);
    setSelectedSeatBlocks(item.blockNumbers);
    setActiveSeatDetailBlock(item.blockNumbers[0] ?? null);
    setSelectedDetailSeats([]);
  };

  const handleToggleDetailSeat = (seatKey: string) => {
    setSelectedDetailSeats((prev) =>
      prev.includes(seatKey)
        ? prev.filter((value) => value !== seatKey)
        : [...prev, seatKey],
    );
  };

  const stadiumSelectedIndices = isPreferredRecommendOn
    ? hoveredRecommendBlock
      ? [hoveredRecommendBlock]
      : selectedRecommend
        ? [selectedRecommend.blockNumber]
        : []
    : hoveredSeatBlocks.length > 0
      ? hoveredSeatBlocks
      : selectedSeatBlocks;

  const logoImg = "lg-twins.png";

  const canGoNext = useMemo(() => {
    if (isPreferredRecommendOn) return selectedRecommendId !== null;

    return selectedSeatListItem !== null && selectedDetailSeats.length > 0;
  }, [isPreferredRecommendOn, selectedDetailSeats.length, selectedRecommendId, selectedSeatListItem]);

  function resolveLogoSrc(input: string) {
    if (/^https?:\/\//i.test(input)) return input;
    if (!CDN_CLUBS_BASE_URL) return input;
    return new URL(input.replace(/^\//, ""), CDN_CLUBS_BASE_URL).toString();
  }

  useEffect(() => {
    if (!matchId) return;

    hasHandledQueueEndRef.current = false;
    clearQueuePolling();

    let cancelled = false;

    const poll = async () => {
      try {
        const response = await getQueueStatus(matchId);

        if (cancelled) return;

        const status = response.status ?? null; // 현재 대기 상태
        const rank = response.rank ?? null; // 현재 사용자 대기 순번
        const total = response.totalWaitingCount ?? null; // 전체 대기 인원 수
        const nextPollingMs = response.pollingMs ?? 3000; // 상태 확인(polling)할 권장 주기
        const nextExpiresIn = response.expiresIn ?? null; // 토큰 만료까지 남은 시간(초)

        setQueueStatus(status);
        setQueueRank(rank);
        setTotalWaitingCount(total);
        setPollingMs(nextPollingMs);
        setExpiresIn(nextExpiresIn);

        console.log("[recommend] queueStatus", response);

        // stattus 응답에 따른 분기
        if (status === "WAITING") { // 대기열에서 순번을 기다리는 상태
          setIsFindingSeat(true);
          scheduleNextPoll(nextPollingMs, poll);
          return;
        }

        if (status === "READY") { // Seat 서비스에 입장 가능한 상태
          setIsFindingSeat(false);
          return;
        }

        if (status === "EXPIRED") { // 입장 가능 시간이 만료된 상태
          if (hasHandledQueueEndRef.current) return;
          hasHandledQueueEndRef.current = true;

          setIsFindingSeat(false);
          clearQueuePolling();

          toast.error("입장 가능 시간이 만료되었습니다. 다시 대기열에 진입해주세요.");
          router.push(`/matches/${matchId}`);

          return;
        }

        if (status === "ENTERED") {
          if (hasHandledQueueEndRef.current) return;
          hasHandledQueueEndRef.current = true;

          setIsFindingSeat(false);
          clearQueuePolling();
          return;
        }
      } catch (e) {
        if (cancelled || hasHandledQueueEndRef.current) return;

        if (e instanceof ApiError && e.message === "해당 경기의 대기열에 등록되어 있지 않습니다.") {
          hasHandledQueueEndRef.current = true;
          setIsFindingSeat(false);
          clearQueuePolling();
          toast.error("입장 가능 시간이 만료되었습니다. 다시 대기열에 진입해주세요.");
          router.push(`/matches/${matchId}`);
          return;
        }

        setIsFindingSeat(true);
        console.error("queue polling failed:", e);
        scheduleNextPoll(pollingMs ?? 3000, poll);
      }
    };

    poll();

    return () => {
      cancelled = true;
      clearQueuePolling();
    };
  }, [matchId, router]);


  useEffect(() => {
    if (!loading && isRecommendEmpty) {
      setIsSoldOutModalOpen(true);
    }
  }, [isRecommendEmpty, loading]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-white">
      <div className="w-full border-b border-[var(--foundation-neutral-880)] bg-white">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-4 sm:px-6 md:px-8 xl:px-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex items-start gap-3 sm:items-center sm:gap-4">
            <button
              type="button"
              className="cursor-pointer flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
              aria-label="뒤로가기"
              onClick={handleBack}
            >
              <ChevronLeft
                className="h-6 w-6 text-[var(--foundation-neutral-160)]"
                strokeWidth={1.5}
              />
            </button>

            <div className="min-w-0 flex flex-wrap items-center gap-x-2 gap-y-1 sm:gap-x-3">
              <div className="text-sm font-semibold leading-5 text-[var(--foundation-neutral-240)] sm:text-base lg:text-lg sm:leading-6">
                2026년 3월 29일 (일) 14:00
              </div>
              <div className="text-sm font-semibold leading-5 text-[var(--foundation-neutral-240)] sm:text-base lg:text-lg sm:leading-6">
                LG vs KT
              </div>
              <div className="hidden text-sm leading-5 text-[var(--foundation-neutral-600)] sm:block sm:text-base">
                |
              </div>
              <div className="min-w-0 flex items-center gap-2">
                <div className="h-7 w-7 overflow-hidden rounded-full bg-white sm:h-8 sm:w-8">
                  <img
                    className="h-full w-full object-cover"
                    src={resolveLogoSrc(logoImg)}
                    alt={`alt-${logoImg}`}
                  />
                </div>
                <div className="min-w-0 truncate text-sm font-medium leading-5 text-[var(--foundation-neutral-400)] sm:text-base sm:leading-6">
                  잠실종합운동장 잠실야구장
                </div>
              </div>
            </div>
          </div>

          <div className="w-full overflow-x-auto lg:w-auto">
            <TicketingNavigator active="seat" />
          </div>
        </div>
      </div>

      <div className="w-full flex-1">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 pb-8 pt-4 sm:px-6 md:px-8 xl:gap-8 xl:px-12 lg:flex-row lg:items-start">
          <div className="min-w-0 flex w-full flex-1 justify-center px-0 lg:px-2 xl:px-4">
            <div className="w-full max-w-none lg:max-w-[calc(100vw-480px)] xl:max-w-[calc(100vw-520px)] 2xl:max-w-[960px]">
              {isSeatDetailOpen && selectedSeatListItem ? (
                <BlockSeatDetailView
                  blockNumbers={selectedSeatListItem.blockNumbers} // 현재 선택한 좌석 리스트 항목에 포함된 블럭 번호들
                  selectedBlockNumber={activeSeatDetailBlock} // 현재 상세 뷰에서 활성화되어 있는 블럭 번호
                  selectedSeats={selectedDetailSeats} // 사용자가 상세 뷰에서 선택한 좌석 key 목록
                  onSelectBlock={setActiveSeatDetailBlock} // 활성 블럭을 바꿀 때 사용하는 setter
                  onToggleSeat={handleToggleDetailSeat} // 좌석 선택/해제를 처리하는 핸들러
                  selectedIndices={stadiumSelectedIndices} // StadiumMap에서 강조할 블럭 번호 목록
                />
              ) : (
                <StadiumMap
                  selectedIndices={stadiumSelectedIndices}
                  onToggle={() => { }}
                />
              )}
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-col items-end gap-6 lg:w-[360px] xl:w-[400px] 2xl:w-[460px]">
            <div className="w-full rounded-2xl bg-[var(--foundation-neutral-white)] px-6 py-4 outline outline-1 outline-offset-[-1px] outline-[var(--stroke-interactive-neutral-default)]">
              <div className="flex h-8 w-full items-center justify-between">
                <div className="text-base font-semibold leading-6 text-black font-['Pretendard_Variable']">
                  사용자 선호 구역 추천
                </div>

                <Toggle
                  checked={isPreferredRecommendOn}
                  onCheckedChange={(next) => {
                    setIsPreferredRecommendOn(next);
                    setHoveredRecommendBlock(null);
                    setHoveredSeatBlocks([]);
                  }}
                />
              </div>
            </div>

            {isPreferredRecommendOn ? (
              <div className="flex w-full flex-1 flex-col items-start gap-4">
                <div className="flex w-full flex-col items-start gap-3">
                  <div className="w-full text-base font-semibold leading-6 text-[var(--foundation-neutral-240)] sm:text-lg">
                    좌석 추천 리스트
                  </div>
                  <div className="w-full text-xs font-medium leading-5 text-[var(--foundation-neutral-600)] sm:text-sm">
                    추천 구역을 선택하면 해당 블럭에서 연속 좌석을 확인할 수 있어요.
                  </div>
                </div>

                <div className="w-full overflow-hidden">
                  {loading ? (
                    <div className="inline-flex w-full flex-col items-start gap-3 self-stretch overflow-hidden">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <div
                          key={index}
                          className="flex w-full flex-col items-start gap-3 overflow-hidden rounded-lg bg-[var(--background-white)] p-4 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-[var(--stroke-interactive-neutral-default)]"
                        >
                          <div className="flex w-full flex-col items-start gap-1">
                            <div className="h-6 w-24 rounded-[50px] bg-gradient-to-r from-[var(--foundation-neutral-920)] to-[var(--foundation-neutral-880)] animate-pulse" />
                            <div className="flex w-full flex-col items-end gap-1">
                              <div className="h-7 w-full rounded-[50px] bg-gradient-to-r from-[var(--foundation-neutral-940)] to-[var(--foundation-neutral-900)] animate-pulse" />
                              <div className="h-5 w-40 rounded-[50px] bg-gradient-to-r from-[var(--foundation-neutral-960)] to-[var(--foundation-neutral-940)] animate-pulse" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : isRecommendEmpty ? (
                    <div className="flex min-h-[240px] w-full items-center justify-center rounded-lg bg-[var(--background-white)] p-6">
                      <div className="text-center text-base font-medium leading-6 text-[var(--text-info-n600)] font-['Pretendard']">
                        현재 추천 가능한 좌석이 없어요
                      </div>
                    </div>
                  ) : (
                    <SeatRecommendSummaryCard
                      items={recommendItems}
                      selectedId={selectedRecommendId}
                      onItemClick={(item) => setSelectedRecommendId(item.id)}
                      onItemHover={(item) =>
                        setHoveredRecommendBlock(item.blockNumber)
                      }
                      onItemLeave={() => setHoveredRecommendBlock(null)}
                    />
                  )}
                </div>
              </div>
            ) : selectedSeatRows.length > 0 ? (
              <div className="flex w-full flex-col items-end gap-6 self-stretch">
                <div className="flex w-full flex-col items-start gap-4 rounded-2xl bg-[var(--foundation-neutral-white)] px-6 py-4 outline outline-1 outline-offset-[-1px] outline-[var(--stroke-interactive-neutral-default)]">
                  <div className="flex w-full items-center justify-between gap-3">
                    <div className="text-base font-semibold leading-6 text-black font-['Pretendard_Variable']">
                      선택한 좌석
                    </div>
                    <div className="text-right text-sm font-normal leading-5 text-[var(--foundation-secondary-600)] font-['Pretendard']">
                      총 {selectedSeatRows.length}석 선택되었습니다
                    </div>
                  </div>

                  <div className="flex w-full flex-col items-start gap-3">
                    <div className="flex w-full items-center">
                      <div className="flex flex-1 items-center gap-2">
                        <div className="h-3 w-3 rounded-[3px] border border-[var(--foundation-orange-500)] bg-[var(--foundation-orange-300)]" />
                        <div className="text-sm font-medium leading-5 text-[var(--foundation-neutral-240)] sm:text-base sm:leading-6">
                          예매가능한 좌석
                        </div>
                      </div>
                      <div className="flex flex-1 items-center gap-2">
                        <div className="flex h-3 w-3 items-center justify-center rounded-[3px] bg-[var(--foundation-orange-600)] outline outline-1 outline-[var(--foundation-orange-800)]">
                          <ChevronDown className="text-[var(--foundation-orange-50)]" />
                        </div>
                        <div className="text-sm font-medium leading-5 text-[var(--foundation-neutral-240)] sm:text-base sm:leading-6">
                          선택된 좌석
                        </div>
                      </div>
                    </div>

                    <div className="flex w-full items-center">
                      <div className="flex flex-1 items-center gap-2">
                        <div className="h-3 w-3 rounded-[3px] border border-[var(--foundation-neutral-800)] bg-[var(--background-interactive-neutral-default)]" />
                        <div className="text-sm font-medium leading-5 text-[var(--foundation-neutral-240)] sm:text-base sm:leading-6">
                          예매 불가
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full flex-col overflow-hidden outline outline-1 outline-offset-[-1px] outline-[var(--stroke-interactive-neutral-default)]">
                    <div className="inline-flex w-full items-start gap-2">
                      <div className="flex flex-1 items-center gap-3 bg-[var(--foundation-neutral-940)] p-2">
                        <div className="text-sm font-semibold leading-5 text-[var(--foundation-neutral-240)] font-['Pretendard_Variable']">
                          좌석 등급
                        </div>
                      </div>
                      <div className="flex flex-1 items-center gap-3 bg-[var(--foundation-neutral-980)] p-2">
                        <div className="text-sm font-semibold leading-5 text-[var(--foundation-neutral-240)] font-['Pretendard_Variable']">
                          좌석 번호
                        </div>
                      </div>
                    </div>

                    <div className="flex h-125 w-full flex-col overflow-y-auto items-start bg-[var(--foundation-neutral-white)]">
                      {selectedSeatRows.map((seat) => (
                        <div key={seat.key} className="inline-flex h-10 min-h-10 w-full items-center gap-2 px-4">
                          <div className="flex flex-1 items-center gap-2">
                            <div className="text-[14px] font-medium leading-5 text-[var(--foundation-neutral-240)]">
                              {seat.gradeLabel}
                            </div>
                          </div>
                          <div className="flex flex-1 items-center gap-2">
                            <div className="text-[14px] font-medium leading-5 text-[var(--foundation-primary-600)]">
                              {seat.seatLabel}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="inline-flex w-full flex-col items-start gap-4 self-stretch">
                <div className="w-full text-lg font-semibold leading-6 text-[var(--foundation-neutral-240)] font-['Pretendard_Variable']">
                  좌석 리스트
                </div>

                <div className="flex w-full flex-col items-start gap-3 overflow-hidden rounded-2xl px-2 outline outline-1 outline-offset-[-1px] outline-[var(--stroke-interactive-neutral-default)]">
                  <div className="flex w-full flex-col items-start bg-[var(--foundation-neutral-white)]">
                    {seatSections.map((section) => (
                      <div key={section.title} className="flex w-full flex-col items-start">
                        <div className="inline-flex w-full items-center justify-start gap-3 bg-[var(--foundation-neutral-980)] p-2">
                          <div className="text-sm font-semibold leading-5 text-[var(--foundation-neutral-480)] font-['Pretendard_Variable']">
                            {section.title}
                          </div>
                        </div>

                        <div className="flex w-full flex-col items-start">
                          {section.items.map((item) => (
                            <button
                              key={item.name}
                              type="button"
                              onMouseEnter={() => setHoveredSeatBlocks(item.blockNumbers)}
                              onMouseLeave={() => setHoveredSeatBlocks([])}
                              onClick={() => handleSelectSeatListItem(item)}
                              className={[
                                "inline-flex w-full items-center justify-start gap-3 px-4 py-2 text-left transition-all",
                                selectedSeatListItem?.name === item.name
                                  ? "bg-[var(--foundation-primary-10)] shadow-[0px_0px_15px_0px_rgba(11,234,178,0.25)] outline outline-1 outline-offset-[-1px] outline-[var(--foundation-primary-500)]"
                                  : "cursor-pointer hover:bg-[var(--background-grey)]",
                              ].join(" ")}
                            >
                              <div className="text-base font-medium leading-6 text-[var(--foundation-secondary-800)] font-['Pretendard']">
                                {item.name}
                              </div>
                              <div className="text-sm font-normal leading-5 text-[var(--foundation-neutral-720)] font-['Pretendard']">
                                |
                              </div>
                              <div className="text-base font-semibold leading-6 text-[var(--foundation-primary-600)] font-['Pretendard_Variable']">
                                {item.count}석
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="inline-flex w-full flex-col items-center gap-2 self-stretch">
              <div className="flex w-full items-start gap-2">
                <PrimaryButton
                  type="button"
                  size="lg"
                  tone="base"
                  className="flex-1"
                  onClick={handleProceedToPayment}
                  disabled={!canGoNext}
                >
                  예매하기
                </PrimaryButton>
              </div>
              <div className="text-center text-sm font-medium leading-5 text-[var(--text-info-n600)] font-['Pretendard']">
                예매 진행 후에는 좌석 변경이 어렵습니다.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 추천 좌석 소진 모달 */}
      {isSoldOutModalOpen && (
        <RecommendSoldOutModal
          open={isSoldOutModalOpen}
          onMoveToSeatMap={() => {
            setIsSoldOutModalOpen(false);
            setIsPreferredRecommendOn(false);
          }}
        />
      )}

      {/* 뒤로가기 확인 모달 */}
      {isExitModalOpen && (
        <RecommendExitModal
          open={isExitModalOpen}
          onExit={handleExit}
          onClose={() => setIsExitModalOpen(false)}
        />
      )}

      {/* 예매할 수 없는 상태 모달 */}
      {isSeatUnavailableModalOpen && (
        <RecommendSeatUnavailableModal
          open={isSeatUnavailableModalOpen}
          onClose={() => setIsSeatUnavailableModalOpen(false)}
        />
      )}

      {/* 대기열 모달 */}
      {isFindingSeat && (
        <SeatFindingModal
          open={isFindingSeat && queueStatus === "WAITING"}
          rank={queueRank}
          totalWaitingCount={totalWaitingCount}
        />
      )}

    </div>
  );
}
