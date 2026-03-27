"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { CDN_CLUBS_BASE_URL } from "@/lib/api/config";
import { PrimaryButton } from "@/components/common/Button";
import { BlockSeatDetailView } from "@/components/common/BlockSeatDetailView";
import { RecommendExitModal } from "@/components/common/RecommendExitModal";
import { RecommendSeatUnavailableModal } from "@/components/common/RecommendSeatUnavailableModal";
import { RecommendSoldOutModal } from "@/components/common/RecommendSoldOutModal";
import { SeatRecommendSummaryCard, type SeatRecommendItem } from "@/components/common/SeatRecommendSummaryCard";
import { SeatFindingModal } from "@/components/common/SeatFindingModal";
import { TicketingNavigator } from "@/components/common/TicketingNavigator";
import { Toggle } from "@/components/common/Toggle";
import { StadiumMap } from "@/components/my/StadiumMap";
import {
  assignRecommendedSeats,
  getQueueStatus,
  getRecommendationBlocks,
  getRecommendationSeatEntry,
  getSeatGroupsEntry,
  getSectionBlocks,
  createSeatHold,
} from "@/lib/services";
import type {
  BlockRecommendationResponse,
  QueueStatusType,
  SeatEntryResponse,
  SeatGroupsEntryResponse,
  SectionBlock,
} from "@/lib/types";
import { VQAChallenge } from "@/lib/telemetry/components";
import { TelemetryProvider, useTelemetryContext } from "@/lib/telemetry/context";

type SeatListItem = {
  sectionId: number;
  name: string;
  count: number;
  blockNumbers: number[];
  color: SeatRecommendItem["color"];
};

type SeatSection = {
  title: string;
  items: SeatListItem[];
};

type SelectedSeatDetail = {
  seatId: number;
  seatNo: number;
  rowNo: number;
  blockId: number;
  blockCode: string;
  blockDisplayName: string;
  sectionName: string;
};

type VqaPromptState = {
  reason: "proactive" | "fallback";
  requestName: string;
};

class VqaChallengeCancelledError extends Error {
  constructor() {
    super("VQA challenge was cancelled.");
    this.name = "VqaChallengeCancelledError";
  }
}

class ProtectedRequestCancelledError extends Error {
  constructor() {
    super("Protected request was cancelled.");
    this.name = "ProtectedRequestCancelledError";
  }
}

const MAX_VQA_FALLBACK_RETRIES = 2;

function getErrorStatus(error: unknown): number | null {
  if (error instanceof ApiError) {
    return error.status;
  }

  if (typeof error === "object" && error !== null && "status" in error) {
    const raw = (error as { status?: unknown }).status;
    if (typeof raw === "number") {
      return raw;
    }

    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

const PRICE_TEXT_MAP: Record<string, string> = {
  익사이팅존: "주중: 28,000원, 주말: 33,000/매",
  블루석: "주중: 22,000원, 주말: 24,000/매",
  오렌지석: "주중: 20,000원, 주말: 22,000/매",
  레드석: "주중: 17,000원, 주말: 19,000/매",
  네이비석: "주중: 14,000원, 주말: 16,000/매",
  그린석: "주중: 15,000원, 주말: 17,000/매", //★
  퍼플석: "주중: 15,000원, 주말: 17,000/매", //★
  "테라존(중앙 프리미엄석)": "주중: 25,000원, 주말: 27,000/매", //★
};

function getPriceTextBySeatLabel(seatLabel: string) {
  return PRICE_TEXT_MAP[seatLabel] ?? "-";
}

const getSeatColor = (sectionName: string): SeatRecommendItem["color"] => {
  if (sectionName.includes("익사이팅존")) return "gray";
  if (sectionName.includes("블루석")) return "blue";
  if (sectionName.includes("오렌지석")) return "orange";
  if (sectionName.includes("레드석")) return "red";
  if (sectionName.includes("네이비석")) return "navy";
  if (sectionName.includes("그린석")) return "green";
  if (sectionName.includes("퍼플석")) return "purple";
  return "orange";
};

const toSeatSections = (seatGroupsEntry: SeatGroupsEntryResponse): SeatSection[] => {
  return seatGroupsEntry.seatGroups.map((area) => ({
    title: area.areaName,
    items: area.sections.map((section) => ({
      sectionId: section.sectionId,
      name: section.displayName,
      count: section.remainingSeatCount,
      blockNumbers: section.blockIds,
      color: getSeatColor(section.sectionName),
    })),
  }));
};

export default function Page() {
  const params = useParams();

  const matchId = useMemo(() => {
    const raw = (params as Record<string, string | string[] | undefined>)?.matchId;
    const value = Array.isArray(raw) ? raw[0] : raw;
    const parsed = value ? Number(value) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [params]);

  return (
    <TelemetryProvider matchId={matchId ?? 0} autoStart={matchId !== null}>
      <RecommendPageContent key={matchId ?? "unknown-match"} matchId={matchId} />
    </TelemetryProvider>
  );
}

function RecommendPageContent({ matchId }: { matchId: number | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setStage } = useTelemetryContext();

  const recommendationEnabled = searchParams.get("recommendationEnabled") === "true";
  const initialQueueRank = searchParams.get("queueRank")
    ? Number(searchParams.get("queueRank"))
    : null;
  const initialQueueTotalWaitingCount = searchParams.get("queueTotalWaitingCount")
    ? Number(searchParams.get("queueTotalWaitingCount"))
    : null;

  const pollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasHandledQueueEndRef = useRef(false);
  const isVqaVerifiedRef = useRef(false);
  const vqaDeferredRef = useRef<{
    promise: Promise<boolean>;
    resolve: (value: boolean) => void;
  } | null>(null);

  const [queueStatus, setQueueStatus] = useState<QueueStatusType | null>(null);
  const [queueRank, setQueueRank] = useState<number | null>(initialQueueRank);
  const [totalWaitingCount, setTotalWaitingCount] = useState<number | null>(
    initialQueueTotalWaitingCount,
  );
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [isFindingSeat, setIsFindingSeat] = useState(true);

  const [seatEntry, setSeatEntry] = useState<SeatEntryResponse | null>(null);
  const [recommendItems, setRecommendItems] = useState<SeatRecommendItem[]>([]);
  const [preferredRecommendBlocks, setPreferredRecommendBlocks] = useState<number[]>([]);
  const [seatGroupsEntry, setSeatGroupsEntry] = useState<SeatGroupsEntryResponse | null>(null);
  const [seatSections, setSeatSections] = useState<SeatSection[]>([]);

  const [isPreferredRecommendOn, setIsPreferredRecommendOn] = useState(recommendationEnabled);
  const [selectedRecommendId, setSelectedRecommendId] = useState<string | null>(null);
  const [hoveredRecommendBlock, setHoveredRecommendBlock] = useState<number | null>(null);

  const [hoveredSeatBlocks, setHoveredSeatBlocks] = useState<number[]>([]);
  const [selectedSeatListItem, setSelectedSeatListItem] = useState<SeatListItem | null>(null);
  const [selectedSeatBlocks, setSelectedSeatBlocks] = useState<number[]>([]);
  const [sectionBlocks, setSectionBlocks] = useState<SectionBlock[]>([]);
  const [sectionBlocksLoading, setSectionBlocksLoading] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState<number | null>(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);

  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isSoldOutModalOpen, setIsSoldOutModalOpen] = useState(false);
  const [isSeatUnavailableModalOpen, setIsSeatUnavailableModalOpen] = useState(false);
  const [vqaPrompt, setVqaPrompt] = useState<VqaPromptState | null>(null);

  const matchInfo = isPreferredRecommendOn ? seatEntry?.match ?? null : seatGroupsEntry?.match ?? null;
  const homeClub = matchInfo?.homeClub ?? null;
  const awayClub = matchInfo?.awayClub ?? null;
  const stadiumName = matchInfo?.stadium?.koName ?? "";
  const homeLogoImg = homeClub?.logoImg ?? "";

  const formattedMatchAt = useMemo(() => {
    return formatMatchAt(matchInfo?.matchAt);
  }, [matchInfo?.matchAt]);

  const selectedRecommend =
    recommendItems.find((item) => item.id === selectedRecommendId) ?? null;
  const isRecommendEmpty = recommendItems.length === 0;

  const isSeatDetailOpen =
    !isPreferredRecommendOn &&
    selectedSeatListItem !== null &&
    selectedSeatBlocks.length > 0 &&
    activeBlockId !== null;

  const stadiumSelectedIndices = useMemo(() => {
    if (isPreferredRecommendOn) {
      if (hoveredRecommendBlock) return [hoveredRecommendBlock];
      if (preferredRecommendBlocks.length > 0) return preferredRecommendBlocks;
      if (selectedRecommend) return [selectedRecommend.blockNumber];
      return [];
    }

    return hoveredSeatBlocks.length > 0 ? hoveredSeatBlocks : selectedSeatBlocks;
  }, [
    hoveredRecommendBlock,
    hoveredSeatBlocks,
    isPreferredRecommendOn,
    preferredRecommendBlocks,
    selectedRecommend,
    selectedSeatBlocks,
  ]);

  const selectedSeatRows = useMemo(() => {
    if (!selectedSeatListItem) return [];

    return selectedSeatIds
      .map((seatId) => findSeatDetail(sectionBlocks, seatId, selectedSeatListItem.name))
      .filter((seat): seat is SelectedSeatDetail => seat !== null)
      .map((seat) => ({
        key: String(seat.seatId),
        gradeLabel: seat.sectionName,
        seatLabel: `${seat.blockDisplayName} ${seat.rowNo}열 ${seat.seatNo}번`,
      }));
  }, [sectionBlocks, selectedSeatIds, selectedSeatListItem]);

  const canGoNext = useMemo(() => {
    if (isPreferredRecommendOn) return selectedRecommendId !== null;
    return selectedSeatIds.length > 0;
  }, [isPreferredRecommendOn, selectedRecommendId, selectedSeatIds.length]);

  const clearQueuePolling = useCallback(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (matchId === null) return;
    // AI telemetry 연동: 현재 화면을 좌석 탐색 구간으로만 라벨링한다.
    // 기존 좌석 추천/선점 비즈니스 로직에는 관여하지 않는다.
    setStage("SEAT_STAGE");
  }, [matchId, setStage]);

  useEffect(() => {
    return () => {
      if (!vqaDeferredRef.current) return;

      const pending = vqaDeferredRef.current;
      vqaDeferredRef.current = null;
      pending.resolve(false);
    };
  }, []);

  const scheduleNextPoll = useCallback((ms: number, callback: () => void) => {
    clearQueuePolling();
    pollingTimeoutRef.current = setTimeout(callback, ms);
  }, [clearQueuePolling]);

  const toRecommendItems = (response: BlockRecommendationResponse): SeatRecommendItem[] =>
    response.blocks.map((block) => ({
      id: String(block.blockId),
      seatLabel: block.sectionName,
      blockLabel: `${block.blockCode}블럭`,
      blockNumber: block.blockId,
      remainCount: block.remainingSeatCount,
      priceText: getPriceTextBySeatLabel(block.sectionName),
      color: getSeatColor(block.sectionName),
    }));

  const resetManualSeatSelection = () => {
    setHoveredSeatBlocks([]);
    setSelectedSeatListItem(null);
    setSelectedSeatBlocks([]);
    setSectionBlocks([]);
    setActiveBlockId(null);
    setSelectedSeatIds([]);
  };

  const handleBack = () => setIsExitModalOpen(true);

  const handleExit = () => {
    if (!matchId) {
      router.back();
      return;
    }

    router.push(`/matches/${matchId}`);
  };

  const settleVqaPrompt = useCallback((passed: boolean) => {
    const pending = vqaDeferredRef.current;
    vqaDeferredRef.current = null;
    setVqaPrompt(null);
    isVqaVerifiedRef.current = passed;
    pending?.resolve(passed);
  }, []);

  const requestVqaGate = useCallback(
    (
      reason: VqaPromptState["reason"],
      requestName: string,
      force = false,
    ): Promise<boolean> => {
      if (!force && isVqaVerifiedRef.current) {
        return Promise.resolve(true);
      }

      if (vqaDeferredRef.current) {
        return vqaDeferredRef.current.promise;
      }

      let resolvePromise!: (value: boolean) => void;
      const promise = new Promise<boolean>((resolve) => {
        resolvePromise = resolve;
      });

      vqaDeferredRef.current = {
        promise,
        resolve: resolvePromise,
      };

      setVqaPrompt({ reason, requestName });

      if (reason === "proactive") {
        console.log(`[Recommend][VQA] READY gate requested before ${requestName}`);
      } else {
        console.log(`[Recommend][VQA] 428 fallback requested for ${requestName}`);
      }

      return promise;
    },
    [],
  );

  const executeProtectedRequest = useCallback(
    async <T,>(requestName: string, requestFactory: () => Promise<T>): Promise<T> => {
      const verified = await requestVqaGate("proactive", requestName);
      if (!verified) {
        throw new VqaChallengeCancelledError();
      }

      for (let attemptIndex = 0; attemptIndex <= MAX_VQA_FALLBACK_RETRIES; attemptIndex += 1) {
        try {
          return await requestFactory();
        } catch (error) {
          const status = getErrorStatus(error);
          if (status !== 428) {
            throw error;
          }

          if (attemptIndex >= MAX_VQA_FALLBACK_RETRIES) {
            console.warn(
              `[Recommend][VQA] repeated 428 from ${requestName}; retries exhausted`,
              error,
            );
            throw error;
          }

          isVqaVerifiedRef.current = false;
          console.log(
            `[Recommend][VQA] 428 received from ${requestName}; retrying after challenge (retry ${attemptIndex + 1}/${MAX_VQA_FALLBACK_RETRIES})`,
          );

          const retryVerified = await requestVqaGate("fallback", requestName, true);
          if (!retryVerified) {
            throw new VqaChallengeCancelledError();
          }
        }
      }

      throw new Error("unreachable");
    },
    [requestVqaGate],
  );

  const handleSelectSeatListItem = async (item: SeatListItem) => {
    if (!matchId) return;

    setSelectedSeatListItem(item);
    setSelectedSeatBlocks(item.blockNumbers);
    setSectionBlocks([]);
    setSelectedSeatIds([]);
    setActiveBlockId(null);
    setSectionBlocksLoading(true);

    try {
      const response = await executeProtectedRequest(
        `GET /seat/matches/${matchId}/sections/${item.sectionId}/blocks`,
        () => getSectionBlocks(matchId, item.sectionId),
      );
      console.log("getSectionBlocks:", response);
      setSectionBlocks(response.blocks);
      setActiveBlockId(response.blocks[0]?.blockId ?? null);
    } catch (e) {
      if (e instanceof VqaChallengeCancelledError) {
        return;
      }

      const status = getErrorStatus(e);

      if (status === 401) {
        toast.error("유효하지 않은 입장 토큰입니다.");
        router.push(`/matches/${matchId}`);
        return;
      }

      if (status === 404) {
        toast.error("해당 구역의 좌석 정보를 찾을 수 없습니다.");
        return;
      }

      if (status === 410) {
        toast.error("좌석 진입 가능 시간이 만료되었습니다.");
        router.push(`/matches/${matchId}`);
        return;
      }

      if (status === 428) {
        toast.error("보안 인증이 필요합니다. 다시 시도해 주세요.");
        return;
      }

      console.error("[Recommend] getSectionBlocks failed", e);
      toast.error("블럭 좌석 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setSectionBlocksLoading(false);
    }
  };

  const handleToggleDetailSeat = (seatId: number) => {
    const clickedSeat = findSeatDetail(
      sectionBlocks,
      seatId,
      selectedSeatListItem?.name ?? "",
    );

    if (!clickedSeat) return;

    const targetSeat = sectionBlocks
      .flatMap((block) => block.rows.flatMap((row) => row.seats))
      .find((seat) => seat.seatId === seatId);

    if (!targetSeat || targetSeat.saleStatus !== "AVAILABLE") return;

    setSelectedSeatIds((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId],
    );
  };

  const handleQueueEnd = useCallback((message: string) => {
    if (hasHandledQueueEndRef.current) return;
    hasHandledQueueEndRef.current = true;

    setIsFindingSeat(false);
    clearQueuePolling();
    toast.error(message);

    if (matchId) {
      router.push(`/matches/${matchId}`);
    }
  }, [clearQueuePolling, matchId, router]);

  const handleAssignRecommendedSeats = async () => {
    if (!matchId || !selectedRecommendId || assigning) return;

    try {
      setAssigning(true);
      const response = await executeProtectedRequest(
        `POST /seat/matches/${matchId}/recommendations/blocks/${selectedRecommendId}/assign`,
        () => assignRecommendedSeats(matchId, selectedRecommendId),
      );
      console.log("SeatAssignmentResponse:", response);

      const params = new URLSearchParams({
        matchId: String(response.matchId),
        seatIds: response.assignedSeats.map((seat) => seat.matchSeatId).join(","),
      });

      router.push(`/pay/${matchId}?${params.toString()}`);
    } catch (e) {
      if (e instanceof VqaChallengeCancelledError) {
        return;
      }

      const status = getErrorStatus(e);

      if (status === 401) {
        toast.error("유효하지 않은 입장 토큰입니다.");
        router.push(`/matches/${matchId}`);
        return;
      }
      if (status === 403) {
        toast.error("보안 정책에 의해 요청이 차단되었습니다.");
        return;
      }
      if (status === 404) {
        toast.error("연석 가능한 좌석을 찾을 수 없습니다.");
        return;
      }
      if (status === 409) {
        toast.error("다른 사용자가 좌석을 선택 중입니다.");
        return;
      }
      if (status === 410) {
        toast.error("입장 가능 시간이 만료되었습니다.");
        router.push(`/matches/${matchId}`);
        return;
      }

      if (status === 428) {
        toast.error("보안 인증이 다시 필요합니다. 예매를 다시 시도해 주세요.");
        return;
      }

      console.error("[Recommend] assignRecommendedSeats failed", e);
      toast.error("좌석 배정 중 오류가 발생했습니다.");
    } finally {
      setAssigning(false);
    }
  };

  const handleProceed = async () => {
    if (isPreferredRecommendOn) {
      await handleAssignRecommendedSeats();
      return;
    }

    await handleCreateSeatHold();
  };

  const handleCreateSeatHold = async () => {
    if (!matchId || assigning) return;

    try {
      setAssigning(true);

      console.log("createSeatHoldREQ: ", selectedSeatIds);
      const response = await executeProtectedRequest(
        `POST /seat/matches/${matchId}/seat-holds`,
        () =>
          createSeatHold(matchId, {
            seatIds: selectedSeatIds,
          }),
      );

      console.log("createSeatHold:", response);

      const params = new URLSearchParams({
        matchId: String(response.matchId),
        seatIds: response.matchSeatIds.join(","),
      });

      router.push(`/pay/${matchId}?${params.toString()}`);
    } catch (e) {
      if (e instanceof VqaChallengeCancelledError) {
        return;
      }

      const status = getErrorStatus(e);

      if (status === 400) {
        toast.error("좌석 요청 값이 유효하지 않습니다.");
        return;
      }

      if (status === 401) {
        toast.error("유효하지 않은 입장 토큰입니다.");
        router.push(`/matches/${matchId}`);
        return;
      }

      if (status === 403) {
        toast.error("보안 정책에 의해 요청이 차단되었습니다.");
        return;
      }

      if (status === 404) {
        toast.error("좌석 또는 좌석 세션을 찾을 수 없습니다.");
        return;
      }

      if (status === 409) {
        toast.error("다른 사용자가 이미 좌석을 선점 중입니다.");
        return;
      }

      if (status === 410) {
        toast.error("입장 가능 시간이 만료되었습니다.");
        router.push(`/matches/${matchId}`);
        return;
      }

      if (status === 428) {
        toast.error("보안 인증이 다시 필요합니다. 예매를 다시 시도해 주세요.");
        return;
      }

      console.error("[Recommend] createSeatHold failed", e);
      toast.error("좌석 Hold 생성 중 오류가 발생했습니다.");
      setIsSeatUnavailableModalOpen(true);
    } finally {
      setAssigning(false);
    }
  };

  useEffect(() => {
    if (!matchId) return;

    hasHandledQueueEndRef.current = false;
    clearQueuePolling();

    let cancelled = false;

    const poll = async () => {
      try {
        const response = await getQueueStatus(matchId);
        if (cancelled) return;

        const status = response.status ?? null;
        const rank = response.rank ?? null;
        const total = response.totalWaitingCount ?? null;
        const nextPollingMs = response.pollingMs ?? 3000;

        setQueueStatus(status);
        setQueueRank(rank);
        setTotalWaitingCount(total);

        if (status === "WAITING") {
          setIsFindingSeat(true);
          scheduleNextPoll(nextPollingMs, poll);
          return;
        }

        if (status === "READY") {
          console.log("[Recommend][Queue] READY reached; proactive VQA gate will open.");
          setIsFindingSeat(false);
          clearQueuePolling();
          return;
        }

        if (status === "EXPIRED" || status === "ENTERED") {
          if (hasHandledQueueEndRef.current) return;
          hasHandledQueueEndRef.current = true;

          setIsFindingSeat(false);
          clearQueuePolling();

          if (status === "EXPIRED") {
            toast.error("좌석 진입 가능 시간이 만료되었습니다. 다시 대기열에 진입해 주세요.");
            router.push(`/matches/${matchId}`);
          }
        }
      } catch (e) {
        if (cancelled || hasHandledQueueEndRef.current) return;

        if (e instanceof ApiError) {
          if (e.status === 410) {
            handleQueueEnd("좌석 진입 가능 시간이 만료되었습니다.");
            router.push(`/matches/${matchId}`);
            return;
          }
          if (e.status === 404) {
            handleQueueEnd("대기열 정보를 찾을 수 없습니다.");
            return;
          }
        }

        setIsFindingSeat(true);
        scheduleNextPoll(3000, poll);
      }
    };

    void poll();

    return () => {
      cancelled = true;
      clearQueuePolling();
    };
  }, [clearQueuePolling, handleQueueEnd, matchId, router, scheduleNextPoll]);

  useEffect(() => {
    if (!matchId || queueStatus !== "READY") return;

    let cancelled = false;

    const getActiveRequest = <T,>(requestFactory: () => Promise<T>) => {
      return async (): Promise<T> => {
        if (cancelled) {
          throw new ProtectedRequestCancelledError();
        }

        return requestFactory();
      };
    };

    const loadSeatAccess = async () => {
      setLoading(true);

      if (isPreferredRecommendOn) {
        setSeatEntry(null);
        setRecommendItems([]);
        setPreferredRecommendBlocks([]);
      } else {
        setSeatGroupsEntry(null);
        setSeatSections([]);
      }

      try {
        if (isPreferredRecommendOn) {
          const seatEntryResponse = await executeProtectedRequest(
            `GET /seat/matches/${matchId}/recommendations/seat-entry`,
            getActiveRequest(() => getRecommendationSeatEntry(matchId)),
          );
          if (cancelled) return;

          console.log("[Recommend][Entry] recommendation seat entry loaded after VQA");
          setSeatEntry(seatEntryResponse);

          const preferredBlockIds = seatEntryResponse.seatSession.preferredBlockIds ?? [];
          setSelectedSeatBlocks(preferredBlockIds);
          setPreferredRecommendBlocks(preferredBlockIds);

          const blockRecommendationResponse = await executeProtectedRequest(
            `GET /seat/matches/${matchId}/recommendations/blocks`,
            getActiveRequest(() => getRecommendationBlocks(matchId)),
          );
          if (cancelled) return;

          console.log("[Recommend][Entry] recommendation blocks loaded after VQA");
          setRecommendItems(toRecommendItems(blockRecommendationResponse));
        } else {
          const seatGroupsResponse = await executeProtectedRequest(
            `GET /seat/matches/${matchId}/seat-groups`,
            getActiveRequest(() => getSeatGroupsEntry(matchId)),
          );
          if (cancelled) return;

          console.log("[Recommend][Entry] seat groups loaded after VQA");
          setSeatGroupsEntry(seatGroupsResponse);
          setSeatSections(toSeatSections(seatGroupsResponse));
        }
      } catch (e) {
        if (
          cancelled ||
          e instanceof VqaChallengeCancelledError ||
          e instanceof ProtectedRequestCancelledError
        ) {
          return;
        }

        const status = getErrorStatus(e);

        if (status === 401) {
          toast.error("유효하지 않은 입장 토큰입니다.");
          router.push(`/matches/${matchId}`);
          return;
        }
        if (status === 404) {
          setIsSoldOutModalOpen(true);
          return;
        }
        if (status === 410) {
          toast.error("입장 가능 시간이 만료되었습니다.");
          router.push(`/matches/${matchId}`);
          return;
        }

        if (status === 428) {
          toast.error("보안 인증이 필요합니다. 다시 시도해 주세요.");
          return;
        }

        console.error("[Recommend] loadSeatAccess failed", e);
        toast.error("좌석 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadSeatAccess();

    return () => {
      cancelled = true;
    };
  }, [executeProtectedRequest, isPreferredRecommendOn, matchId, queueStatus, router]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-white">
      <div className="w-full border-b border-[var(--foundation-neutral-880)] bg-white">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-4 sm:px-6 md:px-8 xl:px-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex items-start gap-3 sm:items-center sm:gap-4">
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md"
              aria-label="뒤로가기"
              onClick={handleBack}
            >
              <ChevronLeft
                className="h-6 w-6 text-[var(--foundation-neutral-160)]"
                strokeWidth={1.5}
              />
            </button>

            <div className="min-w-0 flex flex-wrap items-center gap-x-2 gap-y-1 sm:gap-x-3">
              <div className="text-sm font-semibold leading-5 text-[var(--foundation-neutral-240)] sm:text-base sm:leading-6 lg:text-lg">
                {formattedMatchAt || "-"}
              </div>
              <div className="text-sm font-semibold leading-5 text-[var(--foundation-neutral-240)] sm:text-base sm:leading-6 lg:text-lg">
                {homeClub && awayClub ? `${homeClub.koName} vs ${awayClub.koName}` : "-"}
              </div>
              <div className="hidden text-sm leading-5 text-[var(--foundation-neutral-600)] sm:block sm:text-base">
                |
              </div>
              <div className="min-w-0 flex items-center gap-2">
                <div className="h-7 w-7 overflow-hidden rounded-full bg-white sm:h-8 sm:w-8">
                  {homeLogoImg ? (
                    <img
                      className="h-full w-full object-cover"
                      src={resolveLogoSrc("lg-twins.png")}
                      alt={"홈 구단 로고"}
                    />
                  ) : null}
                </div>
                <div className="min-w-0 truncate text-sm font-medium leading-5 text-[var(--foundation-neutral-400)] sm:text-base sm:leading-6">
                  {stadiumName || "-"}
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
              {isSeatDetailOpen && selectedSeatListItem && activeBlockId ? (
                sectionBlocksLoading ? (
                  <div className="flex min-h-[600px] items-center justify-center rounded-2xl bg-[var(--foundation-neutral-960)] text-sm text-[var(--foundation-neutral-400)]">
                    블럭 좌석 정보를 불러오는 중입니다.
                  </div>
                ) : (
                  <BlockSeatDetailView
                    blocks={sectionBlocks}
                    activeBlockId={activeBlockId}
                    selectedSeatIds={selectedSeatIds}
                    onSelectBlock={setActiveBlockId}
                    onToggleSeat={handleToggleDetailSeat}
                    selectedIndices={stadiumSelectedIndices}
                  />
                )
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
                <div className="text-base font-semibold leading-6 text-black">
                  사용자 선호 구역 추천
                </div>
                <Toggle
                  checked={isPreferredRecommendOn}
                  onCheckedChange={(next) => {
                    setIsPreferredRecommendOn(next);
                    setHoveredRecommendBlock(null);
                    setHoveredSeatBlocks([]);
                    resetManualSeatSelection();
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
                    추천 구역을 선택하면 해당 블럭을 경기장 지도에서 바로 확인할 수 있습니다.
                  </div>
                </div>

                <div className="w-full overflow-hidden">
                  {loading ? (
                    <div className="w-full rounded-lg bg-[var(--background-white)] p-6 text-sm text-[var(--foundation-neutral-500)]">
                      <RecommendSeatSkeleton />
                    </div>
                  ) : isRecommendEmpty ? (
                    <div className="flex min-h-[160px] w-full items-center justify-center rounded-lg bg-[var(--background-white)] p-6 text-center text-sm text-[var(--foundation-neutral-500)]">
                      현재 추천 가능한 좌석이 없습니다.
                    </div>
                  ) : (
                    <SeatRecommendSummaryCard
                      items={recommendItems}
                      selectedId={selectedRecommendId}
                      onItemClick={(item) => setSelectedRecommendId(item.id)}
                      onItemHover={(item) => setHoveredRecommendBlock(item.blockNumber)}
                      onItemLeave={() => setHoveredRecommendBlock(null)}
                    />
                  )}
                </div>
              </div>
            ) : selectedSeatRows.length > 0 ? (
              <div className="flex w-full flex-col items-end gap-6 self-stretch">
                <div className="self-stretch rounded-2xl px-4 py-3">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    <div className="inline-flex items-center gap-2.5">
                      <div
                        data-seat-status="available"
                        data-status="default"
                        className="h-4 w-4 rounded-[4px] border border-[var(--foundation-orange-500)] bg-[var(--foundation-orange-300)] shadow-sm"
                      />
                      <span className="text-sm font-medium leading-5 text-[var(--text-normal-n240)]">
                        예매 가능한 좌석
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-2.5">
                      <div
                        data-seat-status="available"
                        data-status="focused"
                        className="flex h-4 w-4 items-center justify-center rounded-[4px] bg-[var(--foundation-orange-600)] text-white outline outline-1 outline-[var(--foundation-orange-800)]"
                      >
                        ✓
                      </div>
                      <span className="text-sm font-medium leading-5 text-[var(--text-normal-n240)]">
                        선택된 좌석
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-2.5">
                      <div
                        data-seat-status="sold"
                        data-status="default"
                        className="h-4 w-4 rounded-[4px] border border-[var(--foundation-neutral-500)] bg-[var(--background-interactive-neutral-default)]"
                      />
                      <span className="text-sm font-medium leading-5 text-[var(--text-normal-n240)]">
                        예매 불가
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex w-full flex-col items-start gap-4 rounded-2xl bg-[var(--foundation-neutral-white)] px-6 py-4 outline outline-1 outline-offset-[-1px] outline-[var(--stroke-interactive-neutral-default)]">
                  <div className="flex w-full items-center justify-between gap-3">
                    <div className="text-base font-semibold leading-6 text-black">
                      선택한 좌석
                    </div>
                    <div className="text-right text-sm font-normal leading-5 text-[var(--foundation-secondary-600)]">
                      총 {selectedSeatRows.length}석 선택되었습니다
                    </div>
                  </div>

                  <div className="flex w-full flex-col overflow-hidden outline outline-1 outline-offset-[-1px] outline-[var(--stroke-interactive-neutral-default)]">
                    <div className="inline-flex w-full items-start gap-2">
                      <div className="flex flex-1 items-center gap-3 bg-[var(--foundation-neutral-940)] p-2">
                        <div className="text-sm font-semibold leading-5 text-[var(--foundation-neutral-240)]">
                          좌석 등급
                        </div>
                      </div>
                      <div className="flex flex-1 items-center gap-3 bg-[var(--foundation-neutral-980)] p-2">
                        <div className="text-sm font-semibold leading-5 text-[var(--foundation-neutral-240)]">
                          좌석 번호
                        </div>
                      </div>
                    </div>

                    <div className="flex h-125 w-full flex-col items-start overflow-y-auto bg-[var(--foundation-neutral-white)]">
                      {selectedSeatRows.map((seat) => (
                        <div
                          key={seat.key}
                          className="inline-flex h-10 min-h-10 w-full items-center gap-2 px-4"
                        >
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
                <div className="w-full text-lg font-semibold leading-6 text-[var(--foundation-neutral-240)]">
                  좌석 리스트
                </div>

                <div className="flex w-full flex-col items-start gap-3 overflow-hidden rounded-2xl px-2 outline outline-1 outline-offset-[-1px] outline-[var(--stroke-interactive-neutral-default)]">
                  <div className="flex w-full flex-col items-start bg-[var(--foundation-neutral-white)]">
                    {seatSections.map((section) => (
                      <div key={section.title} className="flex w-full flex-col items-start">
                        <div className="inline-flex w-full items-center justify-start gap-3 bg-[var(--foundation-neutral-980)] p-2">
                          <div className="text-sm font-semibold leading-5 text-[var(--foundation-neutral-480)]">
                            {section.title}
                          </div>
                        </div>

                        <div className="flex w-full flex-col items-start">
                          {section.items.map((item) => (
                            <button
                              key={`${section.title}-${item.sectionId}`}
                              type="button"
                              onMouseEnter={() => setHoveredSeatBlocks(item.blockNumbers)}
                              onMouseLeave={() => setHoveredSeatBlocks([])}
                              onClick={() => void handleSelectSeatListItem(item)}
                              className={[
                                "inline-flex w-full items-center justify-start gap-3 px-4 py-2 text-left transition-all",
                                selectedSeatListItem?.sectionId === item.sectionId
                                  ? "bg-[var(--foundation-primary-10)] shadow-[0px_0px_15px_0px_rgba(11,234,178,0.25)] outline outline-1 outline-offset-[-1px] outline-[var(--foundation-primary-500)]"
                                  : "cursor-pointer hover:bg-[var(--background-grey)]",
                              ].join(" ")}
                            >
                              <div className="text-base font-medium leading-6 text-[var(--foundation-secondary-800)]">
                                {item.name}
                              </div>
                              <div className="text-sm font-normal leading-5 text-[var(--foundation-neutral-720)]">
                                |
                              </div>
                              <div className="text-base font-semibold leading-6 text-[var(--foundation-primary-600)]">
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
                  onClick={handleProceed}
                  disabled={!canGoNext || assigning}
                >
                  예매하기
                </PrimaryButton>
              </div>
              <div className="text-center text-sm font-medium leading-5 text-[var(--text-info-n600)]">
                예매 진행 중에도 좌석 상황은 변경될 수 있습니다.
              </div>
            </div>
          </div>
        </div>
      </div>

      {isSoldOutModalOpen && (
        <RecommendSoldOutModal
          open={isSoldOutModalOpen}
          onMoveToSeatMap={() => {
            setIsSoldOutModalOpen(false);
            setIsPreferredRecommendOn(false);
          }}
        />
      )}

      {isExitModalOpen && (
        <RecommendExitModal
          open={isExitModalOpen}
          onExit={handleExit}
          onClose={() => setIsExitModalOpen(false)}
        />
      )}

      {isSeatUnavailableModalOpen && (
        <RecommendSeatUnavailableModal
          open={isSeatUnavailableModalOpen}
          onClose={() => setIsSeatUnavailableModalOpen(false)}
        />
      )}

      {isFindingSeat && (
        <SeatFindingModal
          open={isFindingSeat && queueStatus === "WAITING"}
          rank={queueRank}
          totalWaitingCount={totalWaitingCount}
        />
      )}

      {vqaPrompt && (
        <VQAChallenge
          onSuccess={() => {
            console.log(
              `[Recommend][VQA] success (${vqaPrompt.reason}) for ${vqaPrompt.requestName}`,
            );
            settleVqaPrompt(true);
          }}
          onCancel={() => {
            console.log(
              `[Recommend][VQA] cancelled (${vqaPrompt.reason}) for ${vqaPrompt.requestName}`,
            );
            settleVqaPrompt(false);
          }}
        />
      )}
    </div>
  );
}

function RecommendSeatSkeleton() {
  return (
    <div className="w-full self-stretch inline-flex flex-col justify-start items-start gap-3 overflow-hidden animate-pulse">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          data-status="Loading"
          className="w-full p-4 bg-[var(--background-white)] rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-[var(--stroke-interactive-neutral-default)] flex flex-col justify-start items-start gap-3 overflow-hidden"
        >
          <div className="self-stretch flex flex-col justify-start items-start gap-1">
            <div className="w-24 h-6 rounded-[50px] bg-gradient-to-r from-[var(--foundation-neutral-920)] to-[var(--foundation-neutral-880)]" />
            <div className="self-stretch flex flex-col justify-start items-end gap-1">
              <div className="self-stretch h-7 rounded-[50px] bg-gradient-to-r from-[var(--foundation-neutral-940)] to-[var(--foundation-neutral-900)]" />
              <div className="w-40 h-5 rounded-[50px] bg-gradient-to-r from-[var(--foundation-neutral-960)] to-[var(--foundation-neutral-940)]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatMatchAt(matchAt?: string) {
  if (!matchAt) return "";

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(matchAt));
}

function resolveLogoSrc(input: string) {
  if (/^https?:\/\//i.test(input)) return input;
  if (!CDN_CLUBS_BASE_URL) return input;
  return new URL(input.replace(/^\//, ""), CDN_CLUBS_BASE_URL).toString();
}

function findSeatDetail(
  blocks: SectionBlock[],
  seatId: number,
  sectionName: string,
): SelectedSeatDetail | null {
  for (const block of blocks) {
    for (const row of block.rows) {
      const seat = row.seats.find((item) => item.seatId === seatId);
      if (seat) {
        return {
          seatId: seat.seatId,
          seatNo: seat.seatNo,
          rowNo: row.rowNo,
          blockId: block.blockId,
          blockCode: block.blockCode,
          blockDisplayName: block.displayName,
          sectionName,
        };
      }
    }
  }

  return null;
}
