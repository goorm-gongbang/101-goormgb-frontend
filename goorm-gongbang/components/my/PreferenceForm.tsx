"use client";

/* ===========================
   선호 데이터 수정 폼
   - 온보딩 질문과 동일한 UI/동일한 옵션
   - Step1: 시야/좌석높이/구역 (최대 3개 순위 선택)
   - Step2: 좌석타입/환경/분위기/시야방해/가격 (단일 선택)
   - 저장 시 console.log + toast
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

import { useState } from "react";
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
   Mock 초기값
=========================== */
const MOCK_VIEW: ViewPreference[] = ["중앙", "1루 내야", "3루 내야"];
const MOCK_CHEER: CheerPreference = "응원석 인접";
const MOCK_CLUB = clubOptions[0]; // 두산 베어스
const MOCK_HEIGHT: HeightPreference = "중단";
const MOCK_ZONE: ZonePreference = "중앙 쪽";
const MOCK_VIEWTYPE: ViewTypePreference = "통로 선호";
const MOCK_ENV: EnvPreference = "그늘 선호";
const MOCK_MOOD: MoodPreference = "열정적인 응원";
const MOCK_DIST: DistPreference = "보통";
const MOCK_PRICE: PricePreference = "14,000원~ 17,000원";
const MOCK_BLOCKS: number[] = [70, 71, 72, 80, 81, 82]; // 예시 선택 블록

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
function SectionDivider({ title }: { title: string }) {
    return (
        <div className="self-stretch flex items-center gap-3 pt-2">
            <div className="text-xs font-bold text-[#999999] whitespace-nowrap">
                {title}
            </div>
            <div className="flex-1 h-px bg-[#F0F0F0]" />
        </div>
    );
}

/* ===========================
   메인 컴포넌트
=========================== */
export function PreferenceForm() {
    const router = useRouter();

    /* Step 0: 블록 선택 */
    const [selectedBlocks, setSelectedBlocks] = useState<number[]>(MOCK_BLOCKS);

    /* Step 1: 필수성 질문들 */
    const [view, setView] = useState<ViewPreference[]>(MOCK_VIEW);
    const [selectedClub, setSelectedClub] = useState<(typeof clubOptions)[number] | null>(MOCK_CLUB);
    const [cheer, setCheer] = useState<CheerPreference | null>(MOCK_CHEER);
    const [zone, setZone] = useState<ZonePreference | null>(MOCK_ZONE);
    const [height, setHeight] = useState<HeightPreference | null>(MOCK_HEIGHT);

    /* Step 2: 단일 선택 */
    const [viewType, setViewType] = useState<ViewTypePreference | null>(MOCK_VIEWTYPE);
    const [env, setEnv] = useState<EnvPreference | null>(MOCK_ENV);
    const [mood, setMood] = useState<MoodPreference | null>(MOCK_MOOD);
    const [dist, setDist] = useState<DistPreference | null>(MOCK_DIST);
    const [price, setPrice] = useState<PricePreference | null>(MOCK_PRICE);

    /* UI 관련 상태 */
    const [optionalOpen, setOptionalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isClubOpen, setIsClubOpen] = useState(false);

    /**
     * 변경 사항이 있는지 확인하는 함수
     */
    const checkIsDirty = () => {
        const isBlocksDirty = JSON.stringify([...selectedBlocks].sort()) !== JSON.stringify([...MOCK_BLOCKS].sort());
        const isViewDirty = JSON.stringify(view) !== JSON.stringify(MOCK_VIEW);
        const isClubDirty = selectedClub?.id !== MOCK_CLUB.id;
        const isCheerDirty = cheer !== MOCK_CHEER;
        const isZoneDirty = zone !== MOCK_ZONE;
        const isHeightDirty = height !== MOCK_HEIGHT;
        const isOtherDirty =
            viewType !== MOCK_VIEWTYPE ||
            env !== MOCK_ENV ||
            mood !== MOCK_MOOD ||
            dist !== MOCK_DIST ||
            price !== MOCK_PRICE;

        return isBlocksDirty || isViewDirty || isClubDirty || isCheerDirty || isZoneDirty || isHeightDirty || isOtherDirty;
    };

    /**
     * 뒤로가기 클릭 핸들러
     */
    const handleBackClick = () => {
        if (checkIsDirty()) {
            setIsModalOpen(true);
        } else {
            router.back();
        }
    };

    /**
     * 블록 토글 핸들러
     */
    const handleBlockToggle = (idx: number) => {
        setSelectedBlocks((prev) =>
            prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
        );
    };

    /* 저장
     * [TODO] 실제 API 연동 시 가이드 (onboarding 통합 시 필수 작업)
     * 1. lib/services의 saveOnboardingPreferences API 사용
     * 2. 서버 Enum으로 변환하기 위해 아래 매핑 상수와 통합 필요:
     *    - VIEWPOINT_MAP, SEAT_HEIGHT_MAP, SECTION_MAP (onboarding/page.tsx)
     *    - SEAT_POSITION_MAP, ENV_MAP, MOOD_MAP, OBSTRUCTION_MAP (onboarding/option/page.tsx)
     */
    const handleSave = () => {
        const payload = {
            step1: {
                view: view.map((v, i) => ({ priority: i + 1, value: v })),
                clubId: selectedClub?.id,
                cheer,
                zone,
                height,
            },
            step2: { viewType, env, mood, dist, price },
        };
        console.log("[PreferenceForm] save:", payload);
        toast.success("내블럭 및 선호 데이터가 업데이트되었습니다.");
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
            <div className="bg-white rounded-2xl border border-[#E8E8E8] px-5 py-5">
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
                                    className="w-full sm:w-[320px] min-h-12 rounded-lg px-4 py-2 inline-flex justify-start items-center gap-1 overflow-hidden outline outline-[1px] outline-offset-[-1px]"
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
            <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
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
                className="w-full py-3.5 bg-[var(--foundation-primary-500)] hover:bg-[var(--foundation-primary-600)] active:scale-[0.99] text-white text-sm font-semibold rounded-2xl transition-all"
            >
                저장하기
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
