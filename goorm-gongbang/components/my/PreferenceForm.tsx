"use client";

/* ===========================
   선호 데이터 수정 폼
   - 온보딩 질문과 동일한 UI/동일한 옵션
   - Step1: 시야/좌석높이/구역 (최대 3개 순위 선택)
   - Step2: 좌석타입/환경/분위기/시야방해/가격 (단일 선택)
   - 저장 시 toast
   - API 연동 없음 (mock 초기값)

   [TODO: 온보딩과 통합 시 작업 목록]
   1. 타입/옵션/enum 매핑을 공통 파일로 추출
      → 생성 위치: lib/constants/preference-options.ts
      → 추출 대상: 아래 '타입 정의' + '옵션 목록' + 'enum 매핑' 블록
      → 참고: onboarding/page.tsx, onboarding/option/page.tsx 동일 내용 존재

   2. UI 컴포넌트 공통화
      → PriorityBadge, PriorityChip, SingleChip, QuestionSection을
        components/common/ 또는 components/preference/ 로 이동
      → 온보딩 페이지의 인라인 Chip/ConsentRow 와 통합 가능

   3. 상태 관리 통합
      → 현재: 로컬 useState 사용 (API 미연동)
      → 통합 후: useOnboardingPrefStore 또는 별도 usePreferenceStore로 교체
      → 저장 함수 handleSave → API 호출로 교체 (saveOnboardingPreferences 참고)
=========================== */

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { ChevronUp, ChevronDown } from "lucide-react";
import { ChipButton } from "@/components/common/Button";
import { InfoTooltip } from "@/components/common/InfoTooltip";
import { PreferredZoneSection } from "./PreferredZoneSection";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getOnboardingPreferences, updateOnboardingPreferences } from "@/lib/services";
import type { Viewpoint, SeatHeight, Section, SeatPositionPref, EnvironmentPref, MoodPref, ObstructionSensitivity, PriceMode } from "@/lib/types";

/* ===========================
   타입 정의 (온보딩과 동일)
   [TODO] 아래 타입들을 lib/constants/preference-options.ts 로 이동 후
          onboarding/page.tsx 와 이 파일 양쪽에서 import해서 사용
=========================== */
type ViewPreference = "중앙" | "1루 내야" | "3루 내야" | "외야(좌)" | "외야(중)" | "외야(우)";
type CheerPreference = "응원석 인접" | "응원석 비인접" | "무관";
type HeightPreference = "하단" | "중단" | "상단" | "무관";
type ZonePreference = "중앙 쪽" | "중간" | "코너(파울라인)" | "무관";
type ViewTypePreference = "통로 선호" | "중앙 선호" | "무관";
type EnvPreference = "그늘 선호" | "햇빛 무관" | "무관";
type MoodPreference = "열정적인 응원" | "조용한 관람" | "무관";
type DistPreference = "안전망 민감" | "난간·기둥 민감" | "보통" | "무관";
type PricePreference = "~ 13,000원" | "14,000원~ 17,000원" | "18,000원~ 29,000원" | "30,000원~ " | "무관";

/* ===========================
   옵션 목록 (온보딩과 동일)
   [TODO] 타입과 함께 lib/constants/preference-options.ts 로 이동
          + VIEWPOINT_MAP 등 서버 enum 매핑도 함께 이동 (현재 onboarding/page.tsx에만 존재)
=========================== */
const viewOptions: ViewPreference[] = ["중앙", "1루 내야", "3루 내야", "외야(좌)", "외야(중)", "외야(우)"];
const cheerOption: CheerPreference[] = ["응원석 인접", "응원석 비인접", "무관"];
const heightOptions: HeightPreference[] = ["하단", "중단", "상단", "무관"];
const zoneOptions: ZonePreference[] = ["중앙 쪽", "중간", "코너(파울라인)", "무관"];
const viewTypeOptions: ViewTypePreference[] = ["통로 선호", "중앙 선호", "무관"];
const envOptions: EnvPreference[] = ["그늘 선호", "햇빛 무관", "무관"];
const moodOptions: MoodPreference[] = ["열정적인 응원", "조용한 관람", "무관"];
const distOptions: DistPreference[] = ["안전망 민감", "난간·기둥 민감", "보통", "무관"];
const priceOptions: PricePreference[] = ["~ 13,000원", "14,000원~ 17,000원", "18,000원~ 29,000원", "30,000원~ ", "무관"];
const clubOptions = [
    { id: 1, label: "두산 베어스" },
    { id: 2, label: "삼성 라이온즈" },
    { id: 3, label: "키움 히어로즈" },
    { id: 4, label: "한화 이글스" },
    { id: 5, label: "롯데 자이언츠" },
    { id: 6, label: "LG 트윈스" },
    { id: 7, label: "NC 다이노스" },
    { id: 8, label: "SSG 랜더스" },
    { id: 9, label: "kt 위즈" },
    { id: 10, label: "KIA 타이거즈" },
] as const;

/* ===========================
   Forward 매핑 (UI → API enum)
=========================== */
const VIEWPOINT_MAP: Record<ViewPreference, Viewpoint> = {
    "중앙": "CENTER", "1루 내야": "INFIELD_1B", "3루 내야": "INFIELD_3B",
    "외야(좌)": "OUTFIELD_L", "외야(중)": "OUTFIELD_C", "외야(우)": "OUTFIELD_R",
};
const SEAT_HEIGHT_MAP: Record<HeightPreference, SeatHeight> = {
    하단: "LOW", 중단: "MID", 상단: "HIGH", 무관: "ANY",
};
const SECTION_MAP: Record<ZonePreference, Section> = {
    "중앙 쪽": "MIDDLE", 중간: "CENTER_SIDE", "코너(파울라인)": "CORNER", 무관: "ANY",
};
const CHEER_MAP: Record<CheerPreference, "NEAR" | "FAR" | "ANY"> = {
    "응원석 인접": "NEAR", "응원석 비인접": "FAR", 무관: "ANY",
};
const SEAT_POSITION_MAP: Record<ViewTypePreference, SeatPositionPref> = {
    "통로 선호": "AISLE", "중앙 선호": "MIDDLE", 무관: "ANY",
};
const ENV_MAP: Record<EnvPreference, EnvironmentPref> = {
    "그늘 선호": "SHADE", "햇빛 무관": "SUN_OK", 무관: "ANY",
};
const MOOD_MAP: Record<MoodPreference, MoodPref> = {
    "열정적인 응원": "CHEERFUL", "조용한 관람": "QUIET", 무관: "ANY",
};
const OBSTRUCTION_MAP: Record<DistPreference, ObstructionSensitivity> = {
    "안전망 민감": "NET_SENSITIVE", "난간·기둥 민감": "RAIL_PILLAR_SENSITIVE", 보통: "NORMAL", 무관: "ANY",
};

/* ===========================
   Reverse 매핑 (API enum → UI)
=========================== */
const R_VIEWPOINT: Record<string, ViewPreference> = {
    CENTER: "중앙", INFIELD_1B: "1루 내야", INFIELD_3B: "3루 내야",
    OUTFIELD_L: "외야(좌)", OUTFIELD_C: "외야(중)", OUTFIELD_R: "외야(우)",
};
const R_HEIGHT: Record<string, HeightPreference> = {
    LOW: "하단", MID: "중단", HIGH: "상단", ANY: "무관",
};
const R_SECTION: Record<string, ZonePreference> = {
    MIDDLE: "중앙 쪽", CENTER_SIDE: "중간", CORNER: "코너(파울라인)", ANY: "무관",
};
const R_CHEER: Record<string, CheerPreference> = {
    NEAR: "응원석 인접", FAR: "응원석 비인접", ANY: "무관",
};
const R_SEAT_POSITION: Record<string, ViewTypePreference> = {
    AISLE: "통로 선호", MIDDLE: "중앙 선호", ANY: "무관",
};
const R_ENV: Record<string, EnvPreference> = {
    SHADE: "그늘 선호", SUN_OK: "햇빛 무관", ANY: "무관",
};
const R_MOOD: Record<string, MoodPreference> = {
    CHEERFUL: "열정적인 응원", QUIET: "조용한 관람", ANY: "무관",
};
const R_OBSTRUCTION: Record<string, DistPreference> = {
    NET_SENSITIVE: "안전망 민감", RAIL_PILLAR_SENSITIVE: "난간·기둥 민감", NORMAL: "보통", ANY: "무관",
};

function priceFromApi(priceMode: PriceMode, priceMin: number, priceMax: number): PricePreference | null {
    if (priceMode === "ANY") return "무관";
    if (priceMin === 0 && priceMax === 13000) return "~ 13,000원";
    if (priceMin === 14000 && priceMax === 17000) return "14,000원~ 17,000원";
    if (priceMin === 18000 && priceMax === 29000) return "18,000원~ 29,000원";
    if (priceMin === 30000) return "30,000원~ ";
    return null;
}

function priceToPayload(p: PricePreference | null): { priceMode: PriceMode; priceMin: number | null; priceMax: number | null } {
    if (!p || p === "무관") return { priceMode: "ANY", priceMin: null, priceMax: null };
    switch (p) {
        case "~ 13,000원": return { priceMode: "RANGE", priceMin: 0, priceMax: 13000 };
        case "14,000원~ 17,000원": return { priceMode: "RANGE", priceMin: 14000, priceMax: 17000 };
        case "18,000원~ 29,000원": return { priceMode: "RANGE", priceMin: 18000, priceMax: 29000 };
        case "30,000원~ ": return { priceMode: "RANGE", priceMin: 30000, priceMax: null };
        default: return { priceMode: "ANY", priceMin: null, priceMax: null };
    }
}

/* ===========================
   유틸 함수
=========================== */
function toggleUpToThree<T>(prev: T[], value: T): T[] {
    const idx = prev.indexOf(value);
    if (idx !== -1) return prev.filter((v) => v !== value);
    if (prev.length >= 3) return prev;
    return [...prev, value];
}

function getPriority<T>(arr: T[], value: T): number | null {
    const idx = arr.indexOf(value);
    return idx === -1 ? null : idx + 1;
}

function toggleSingle<T>(prev: T | null, next: T): T | null {
    return prev === next ? null : next;
}

/* ===========================
   Priority 뱃지 (온보딩과 동일)
   [TODO] onboarding/page.tsx의 PriorityBadge와 동일
          → components/common/ 또는 components/preference/PriorityBadge.tsx 로 추출
=========================== */
function PriorityBadge({ n }: { n: number }) {
    return (
        <div className="px-1.5 bg-[var(--foundation-primary-700)] rounded-[100px] inline-flex flex-col justify-center items-center overflow-hidden">
            <div className="text-[var(--foundation-primary-10)] text-xs font-normal leading-4">
                {n}
            </div>
        </div>
    );
}

/* ===========================
   Priority Chip (최대 3개 순위)
=========================== */
function PriorityChip({
    label, priority, onClick,
}: {
    label: string;
    priority: number | null;
    onClick: () => void;
}) {
    return (
        <ChipButton
            uiSize="lg"
            tone={priority ? "strong" : "soft"}
            onClick={onClick}
            aria-pressed={Boolean(priority)}
            leftIcon={priority ? <PriorityBadge n={priority} /> : undefined}
            className={priority ? "gap-2" : ""}
        >
            {label}
        </ChipButton>
    );
}

/* ===========================
   단일 선택 Chip
=========================== */
function SingleChip({
    label, selected, onClick,
}: {
    label: string;
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <ChipButton
            uiSize="lg"
            tone={selected ? "strong" : "soft"}
            onClick={onClick}
            aria-pressed={selected}
        >
            {label}
        </ChipButton>
    );
}

/* ===========================
   질문 섹션 래퍼
=========================== */
function QuestionSection({
    title, required, description, children,
}: {
    title: string;
    required?: boolean;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="self-stretch flex flex-col items-start gap-4">
            <div className="self-stretch flex flex-col items-start gap-1.5">
                <div className="self-stretch inline-flex items-start gap-2">
                    <div className="text-base font-semibold leading-6 text-black">
                        {title}
                    </div>
                    {required && (
                        <div
                            className="flex-none whitespace-nowrap text-base font-semibold leading-6"
                            style={{ color: "var(--foundation-primary-500, #00C292)" }}
                        >
                            *필수
                        </div>
                    )}
                </div>
                {description && (
                    <div className="self-stretch inline-flex items-center gap-2">
                        <div className="flex-1 text-sm font-medium leading-5 text-[#9E9E9E]">
                            {description}
                        </div>
                    </div>
                )}
            </div>
            <div className="self-stretch inline-flex items-center gap-1.5 flex-wrap">
                {children}
            </div>
        </section>
    );
}

/* ===========================
   구분선 + 섹션 타이틀
=========================== */

/* ===========================
   메인 컴포넌트
=========================== */
export function PreferenceForm() {
    const router = useRouter();

    /* Step 0: 블록 선택 */
    const [selectedBlocks, setSelectedBlocks] = useState<number[]>([]);

    /* Step 1: 필수성 질문들 */
    const [view, setView] = useState<ViewPreference[]>([]);
    const [selectedClub, setSelectedClub] = useState<(typeof clubOptions)[number] | null>(null);
    const [cheer, setCheer] = useState<CheerPreference | null>(null);
    const [zone, setZone] = useState<ZonePreference | null>(null);
    const [height, setHeight] = useState<HeightPreference | null>(null);

    /* Step 2: 단일 선택 */
    const [viewType, setViewType] = useState<ViewTypePreference | null>(null);
    const [env, setEnv] = useState<EnvPreference | null>(null);
    const [mood, setMood] = useState<MoodPreference | null>(null);
    const [dist, setDist] = useState<DistPreference | null>(null);
    const [price, setPrice] = useState<PricePreference | null>(null);

    /* UI 관련 상태 */
    const [optionalOpen, setOptionalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isClubOpen, setIsClubOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    /* dirty 체크용 초기값 스냅샷 */
    const initialRef = useRef({
        blocks: [] as number[], view: [] as ViewPreference[],
        clubId: null as number | null, cheer: null as CheerPreference | null,
        zone: null as ZonePreference | null, height: null as HeightPreference | null,
        viewType: null as ViewTypePreference | null, env: null as EnvPreference | null,
        mood: null as MoodPreference | null, dist: null as DistPreference | null,
        price: null as PricePreference | null,
    });

    /* API에서 기존 선호 데이터 로드 */
    useEffect(() => {
        getOnboardingPreferences().then((data) => {
            const sorted = [...data.preferences].sort((a, b) => a.priority - b.priority);
            const pref1 = sorted[0];

            const loadedBlocks = data.preferredBlockIds;
            const loadedView = sorted.map((p) => R_VIEWPOINT[p.viewpoint]).filter(Boolean) as ViewPreference[];
            const loadedClub = clubOptions.find((c) => c.id === data.favoriteClubId) ?? null;
            const loadedCheer = R_CHEER[data.cheerProximityPref] ?? null;
            const loadedZone = pref1 ? (R_SECTION[pref1.section ?? "ANY"] ?? null) : null;
            const loadedHeight = pref1 ? (R_HEIGHT[pref1.seatHeight ?? "ANY"] ?? null) : null;
            const loadedViewType = pref1 ? (R_SEAT_POSITION[pref1.seatPositionPref ?? "ANY"] ?? null) : null;
            const loadedEnv = pref1 ? (R_ENV[pref1.environmentPref ?? "ANY"] ?? null) : null;
            const loadedMood = pref1 ? (R_MOOD[pref1.moodPref ?? "ANY"] ?? null) : null;
            const loadedDist = pref1 ? (R_OBSTRUCTION[pref1.obstructionSensitivity ?? "ANY"] ?? null) : null;
            const loadedPrice = pref1 ? priceFromApi(pref1.priceMode ?? "ANY", pref1.priceMin ?? 0, pref1.priceMax ?? 0) : null;

            setSelectedBlocks(loadedBlocks);
            setView(loadedView);
            setSelectedClub(loadedClub);
            setCheer(loadedCheer);
            setZone(loadedZone);
            setHeight(loadedHeight);
            setViewType(loadedViewType);
            setEnv(loadedEnv);
            setMood(loadedMood);
            setDist(loadedDist);
            setPrice(loadedPrice);

            initialRef.current = {
                blocks: loadedBlocks, view: loadedView,
                clubId: loadedClub?.id ?? null, cheer: loadedCheer,
                zone: loadedZone, height: loadedHeight,
                viewType: loadedViewType, env: loadedEnv,
                mood: loadedMood, dist: loadedDist, price: loadedPrice,
            };
        }).catch(() => {});
    }, []);

    const checkIsDirty = () => {
        const s = initialRef.current;
        return (
            JSON.stringify([...selectedBlocks].sort()) !== JSON.stringify([...s.blocks].sort()) ||
            JSON.stringify(view) !== JSON.stringify(s.view) ||
            (selectedClub?.id ?? null) !== s.clubId ||
            cheer !== s.cheer || zone !== s.zone || height !== s.height ||
            viewType !== s.viewType || env !== s.env ||
            mood !== s.mood || dist !== s.dist || price !== s.price
        );
    };

    const handleBackClick = () => {
        if (checkIsDirty()) {
            setIsModalOpen(true);
        } else {
            router.back();
        }
    };

    const handleBlockToggle = (idx: number) => {
        setSelectedBlocks((prev) =>
            prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
        );
    };

    const handleSave = async () => {
        if (!selectedClub || !cheer || view.length === 0) {
            toast.error("필수 항목을 모두 입력해주세요.");
            return;
        }

        const preferences = view.map((v, i) =>
            i === 0
                ? {
                    priority: 1 as const,
                    viewpoint: VIEWPOINT_MAP[v],
                    seatHeight: height ? SEAT_HEIGHT_MAP[height] : "ANY" as const,
                    section: zone ? SECTION_MAP[zone] : "ANY" as const,
                    seatPositionPref: viewType ? SEAT_POSITION_MAP[viewType] : "ANY" as const,
                    environmentPref: env ? ENV_MAP[env] : "ANY" as const,
                    moodPref: mood ? MOOD_MAP[mood] : "ANY" as const,
                    obstructionSensitivity: dist ? OBSTRUCTION_MAP[dist] : "ANY" as const,
                    ...priceToPayload(price),
                }
                : {
                    priority: (i + 1) as 2 | 3,
                    viewpoint: VIEWPOINT_MAP[v],
                }
        );

        try {
            setIsSaving(true);
            await updateOnboardingPreferences({
                favoriteClubId: selectedClub.id,
                cheerProximityPref: CHEER_MAP[cheer],
                preferredBlockIds: selectedBlocks,
                preferences,
            });
            initialRef.current = {
                blocks: selectedBlocks, view,
                clubId: selectedClub.id, cheer,
                zone, height, viewType, env, mood, dist, price,
            };
            toast.success("선호 데이터가 업데이트되었습니다.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            {/* 뒤로가기 버튼 (상단 배치) */}
            <button
                type="button"
                onClick={handleBackClick}
                className="flex items-center gap-1 text-[13px] text-[#999] hover:text-[#666] transition-colors mb-3 self-start"
            >
                ← 이전으로 돌아가기
            </button>

            {/* ══════════════════════════════
                선호 구역 선택 섹션 (경기장 맵)
            ══════════════════════════════ */}
            <PreferredZoneSection
                selectedBlocks={selectedBlocks}
                onToggle={handleBlockToggle}
                onReset={() => setSelectedBlocks([])}
            />

            {/* ══════════════════════════════
                필수 질문 카드
            ══════════════════════════════ */}
            <div className="bg-white rounded-xl border border-[#E8E8E8] px-5 py-5">
                {/* 카드 헤더 */}
                <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-base font-bold text-[#1A1A1A]">필수 질문</h2>
                    <span className="text-sm font-bold" style={{ color: "var(--foundation-primary-500)" }}>*</span>
                </div>
                <div className="h-px bg-[#F0F0F0] mb-5" />

                <div className="flex flex-col gap-7">
                    <QuestionSection
                        title="어디에서 보고 싶으신가요? 선호하는 순으로 선택해주세요."
                        description="경기 시야는 관람 경험에 가장 큰 영향을 줍니다. 최대 3개까지 입력해주세요."
                    >
                        {viewOptions.map((opt) => (
                            <PriorityChip
                                key={opt}
                                label={opt}
                                priority={getPriority(view, opt)}
                                onClick={() => setView((prev) => toggleUpToThree(prev, opt))}
                            />
                        ))}
                    </QuestionSection>

                    <QuestionSection
                        title="응원하는 구단이 있으신가요?"
                        description="응원하는 구단과 가까운 자리에서 더 생생하게 응원할 수 있어요."
                    >
                        <DropdownMenu open={isClubOpen} onOpenChange={setIsClubOpen}>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="w-full sm:w-[320px] min-h-12 rounded-[12px] px-4 py-2 inline-flex justify-start items-center gap-1 overflow-hidden outline outline-[1px] outline-offset-[-1px]"
                                    style={{
                                        background: isClubOpen ? "var(--foundation-primary-10)" : "var(--background-white)",
                                        outlineColor: isClubOpen ? "var(--foundation-primary-500)" : "var(--stroke-interactive-neutral-default)",
                                    }}
                                >
                                    <div className="flex-1 flex justify-between items-center">
                                        <div
                                            className="text-center justify-center text-[15px] font-medium font-['Pretendard'] leading-5"
                                            style={{ color: isClubOpen ? "var(--foundation-primary-700)" : "#1A1A1A" }}
                                        >
                                            {selectedClub?.label ?? "선택하기"}
                                        </div>
                                        <div className="flex justify-center items-center">
                                            <ChevronDown className="h-4 w-4" style={{ color: isClubOpen ? "var(--foundation-primary-500)" : "var(--text-normal-n240)" }} />
                                        </div>
                                    </div>
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="start" className="w-full sm:w-[320px]">
                                {clubOptions.map((club) => (
                                    <DropdownMenuItem key={club.id} onClick={() => setSelectedClub(club)}>
                                        {club.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </QuestionSection>

                    <QuestionSection
                        title="응원석 근처 자리를 선호하시나요?"
                        description="응원석 근처에서 더 뜨거운 현장 분위기를 느껴보세요."
                    >
                        {cheerOption.map((opt) => (
                            <SingleChip
                                key={opt}
                                label={opt}
                                selected={cheer === opt}
                                onClick={() => setCheer((prev) => toggleSingle(prev, opt))}
                            />
                        ))}
                    </QuestionSection>

                    <QuestionSection
                        title="구역 위치는 어느 쪽을 선호하시나요?"
                        description="중앙에 가까울수록 시야가 안정적이에요."
                    >
                        {zoneOptions.map((opt) => (
                            <SingleChip
                                key={opt}
                                label={opt}
                                selected={zone === opt}
                                onClick={() => setZone((prev) => toggleSingle(prev, opt))}
                            />
                        ))}
                    </QuestionSection>

                    <QuestionSection
                        title="좌석 높이는 어느 쪽이 좋으신가요?"
                        description="앞뒤 거리와 시야 각도에 영향을 줍니다."
                    >
                        {heightOptions.map((opt) => (
                            <SingleChip
                                key={opt}
                                label={opt}
                                selected={height === opt}
                                onClick={() => setHeight((prev) => toggleSingle(prev, opt))}
                            />
                        ))}
                    </QuestionSection>
                </div>
            </div>

            {/* ══════════════════════════════
                선택 질문 카드 (접기/펼치기)
            ══════════════════════════════ */}
            <div className="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden">
                {/* 카드 헤더 (클릭하면 토글) */}
                <button
                    type="button"
                    onClick={() => setOptionalOpen((prev) => !prev)}
                    className="w-full px-5 py-5 flex items-center justify-between gap-2 text-left"
                    aria-expanded={optionalOpen}
                >
                    <h2 className="text-base font-bold text-[#1A1A1A]">선택 질문</h2>
                    {optionalOpen
                        ? <ChevronUp className="w-4 h-4 text-[#ADADAD] flex-shrink-0" />
                        : <ChevronDown className="w-4 h-4 text-[#ADADAD] flex-shrink-0" />}
                </button>

                {/* 접히는 본문 */}
                {optionalOpen && (
                    <div className="px-5 pb-5 flex flex-col gap-7">
                        <div className="h-px bg-[#F0F0F0] -mt-2" />

                        <QuestionSection
                            title="좌석 타입 선호가 있나요?"
                            description="이동 편의나 시야 차이를 고려할 수 있어요."
                        >
                            {viewTypeOptions.map((opt) => (
                                <SingleChip
                                    key={opt}
                                    label={opt}
                                    selected={viewType === opt}
                                    onClick={() => setViewType((prev) => toggleSingle(prev, opt))}
                                />
                            ))}
                        </QuestionSection>

                        <QuestionSection
                            title="관람 환경에 대한 선호가 있나요?"
                            description="햇빛 여부에 따라 체감이 달라질 수 있어요."
                        >
                            {envOptions.map((opt) => (
                                <SingleChip
                                    key={opt}
                                    label={opt}
                                    selected={env === opt}
                                    onClick={() => setEnv((prev) => toggleSingle(prev, opt))}
                                />
                            ))}
                        </QuestionSection>

                        <QuestionSection
                            title="관람 분위기는 어떤 쪽이 좋으신가요?"
                            description="응원 강도와 주변 소음 수준에 영향을 줘요."
                        >
                            {moodOptions.map((opt) => (
                                <SingleChip
                                    key={opt}
                                    label={opt}
                                    selected={mood === opt}
                                    onClick={() => setMood((prev) => toggleSingle(prev, opt))}
                                />
                            ))}
                        </QuestionSection>

                        <QuestionSection
                            title="시야 방해 요소에 얼마나 민감하신가요?"
                            description="안전망·난간 등 시야 요소를 고려해 추천해요."
                        >
                            {distOptions.map((opt) => (
                                <SingleChip
                                    key={opt}
                                    label={opt}
                                    selected={dist === opt}
                                    onClick={() => setDist((prev) => toggleSingle(prev, opt))}
                                />
                            ))}
                        </QuestionSection>

                        {/* 가격 (InfoTooltip 포함) */}
                        <section className="self-stretch flex flex-col items-start gap-4">
                            <div className="self-stretch flex flex-col items-start gap-1.5">
                                <div className="inline-flex items-center gap-1">
                                    <span className="text-base font-semibold leading-6 text-black">
                                        좌석 가격은 어떤 가격대를 원하시나요?
                                    </span>
                                    <InfoTooltip
                                        ariaLabel="가격 안내"
                                        content={
                                            <ul className="list-disc pl-4 text-sm leading-5 text-[var(--light-foreground,#111)] space-y-1">
                                                <li>~ 13,000원: 외야석 중심</li>
                                                <li>14,000원 ~ 17,000원: 내야 저가 / 외야 상단</li>
                                                <li>18,000원 ~ 29,000원: 내야 일반석</li>
                                                <li>30,000원 ~ : 테이블석 / 프리미엄</li>
                                            </ul>
                                        }
                                    />
                                </div>
                                <div className="text-sm font-medium leading-5 text-[#9E9E9E]">
                                    동일한 좌석 조건일 경우에만 가격을 반영해요.
                                </div>
                            </div>
                            <div className="self-stretch inline-flex items-center gap-1.5 flex-wrap">
                                {priceOptions.map((opt) => (
                                    <SingleChip
                                        key={opt}
                                        label={opt}
                                        selected={price === opt}
                                        onClick={() => setPrice((prev) => toggleSingle(prev, opt))}
                                    />
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </div>

            {/* ─── 저장 버튼 ─── */}
            <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-3.5 bg-[var(--foundation-primary-500)] hover:bg-[var(--foundation-primary-600)] active:scale-[0.99] text-white text-sm font-semibold rounded-[12px] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {isSaving ? "저장 중..." : "저장하기"}
            </button>

            {/* ─── 확인 모달 ─── */}
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={() => {
                    setIsModalOpen(false);
                    router.back();
                }}
                title="수정을 취소하시겠어요?"
                description="수정 완료를 누르지 않으면 변경 사항이 저장되지 않습니다."
            />
        </div>
    );
}
