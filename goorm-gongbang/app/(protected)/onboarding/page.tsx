"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import {
  useOnboardingPrefStore,
  type Viewpoint,
  type SeatHeight,
  type Section,
  type CheerProximityPref,
} from "@/stores/onboardingPrefStore";
import { ChipButton, PrimaryButton, TertiaryButton } from "@/components/common/Button";
import { getOnboardingStatus } from "@/lib/services";
import { ApiError } from "@/lib/api";
import { ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type ViewPreference = "중앙" | "1루 내야" | "3루 내야" | "외야(좌)" | "외야(중)" | "외야(우)";
type CheerPreference = "응원석 인접" | "응원석 비인접" | "무관";
type HeightPreference = "하단" | "중단" | "상단" | "무관";
type ZonePreference = "중앙 쪽" | "중간" | "코너(파울라인)" | "무관";

const viewOptions: ViewPreference[] = ["중앙", "1루 내야", "3루 내야", "외야(좌)", "외야(중)", "외야(우)"];
const cheerOption: CheerPreference[] = ["응원석 인접", "응원석 비인접", "무관"];
const heightOptions: HeightPreference[] = ["하단", "중단", "상단", "무관"];
const zoneOptions: ZonePreference[] = ["중앙 쪽", "중간", "코너(파울라인)", "무관"];

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

function PriorityBadge({ n }: { n: number }) {
  return (
    <div className="px-1.5 bg-[var(--foundation-primary-700)] rounded-[100px] inline-flex flex-col justify-center items-center overflow-hidden">
      <div className="text-[var(--foundation-primary-10)] text-xs font-normal font-['Pretendard'] leading-4">
        {n}
      </div>
    </div>
  );
}

function Chip({
  label,
  priority,
  showPriority = true,
  onClick,
}: {
  label: string;
  priority: number | null;
  showPriority?: boolean;
  onClick: () => void;
}) {
  return (
    <ChipButton
      uiSize="lg"
      tone={priority ? "strong" : "soft"}
      onClick={onClick}
      aria-pressed={Boolean(priority)}
      leftIcon={priority && showPriority ? <PriorityBadge n={priority} /> : undefined}
      className={priority && showPriority ? "gap-2" : ""}
    >
      {label}
    </ChipButton>
  );
}

function toggleUpToThree<T>(prev: T[], value: T) {
  const idx = prev.indexOf(value);
  if (idx !== -1) return prev.filter((v) => v !== value);
  if (prev.length >= 3) return prev;
  return [...prev, value];
}

function toggleUpToOne<T>(prev: T[], value: T) {
  const idx = prev.indexOf(value);
  if (idx !== -1) return [];
  return [value];
}

function getPriority<T>(arr: T[], value: T) {
  const idx = arr.indexOf(value);
  return idx === -1 ? null : idx + 1;
}

const VIEWPOINT_MAP: Record<ViewPreference, Viewpoint> = {
  중앙: "CENTER",
  "1루 내야": "INFIELD_1B",
  "3루 내야": "INFIELD_3B",
  "외야(좌)": "OUTFIELD_L",
  "외야(중)": "OUTFIELD_C",
  "외야(우)": "OUTFIELD_R",
};

const SEAT_HEIGHT_MAP: Record<HeightPreference, SeatHeight> = {
  하단: "LOW",
  중단: "MID",
  상단: "HIGH",
  무관: "ANY",
};

const SECTION_MAP: Record<ZonePreference, Section> = {
  "중앙 쪽": "MIDDLE",
  중간: "CENTER_SIDE",
  "코너(파울라인)": "CORNER",
  무관: "ANY",
};

const CHEER_MAP: Record<CheerPreference, CheerProximityPref> = {
  "응원석 인접": "NEAR",
  "응원석 비인접": "FAR",
  "무관": "ANY",
};

export default function SeatStyleOnboardingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const checkedRef = useRef(false);

  const [view, setView] = useState<ViewPreference[]>([]);
  const [cheer, setCheer] = useState<CheerPreference[]>([]);
  const [height, setHeight] = useState<HeightPreference[]>([]);
  const [zone, setZone] = useState<ZonePreference[]>([]);
  const [isClubOpen, setIsClubOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<(typeof clubOptions)[number] | null>(null);

  const preferredBlockIds = useOnboardingPrefStore((s) => s.preferredBlockIds);
  const setFavoriteClubId = useOnboardingPrefStore((s) => s.setFavoriteClubId);
  const setCheerProximityPref = useOnboardingPrefStore((s) => s.setCheerProximityPref);
  const setViewpoints = useOnboardingPrefStore((s) => s.setViewpoints);
  const setOptionDraft = useOnboardingPrefStore((s) => s.setOptionDraft);

  const canGoNext = useMemo(() => {
    return preferredBlockIds.length >= 1 && view.length >= 1 && Boolean(selectedClub) && cheer.length === 1;
  }, [preferredBlockIds, view, selectedClub, cheer]);

  if (!bootstrapped) return null;
  if (!accessToken || !user) return null;

  const handlePrev = () => router.back();

  const handleNext = () => {
    if (!canGoNext || !selectedClub || cheer.length !== 1) return;

    setFavoriteClubId(selectedClub.id);
    setCheerProximityPref(CHEER_MAP[cheer[0]]);
    setViewpoints(view.map((selectedView) => VIEWPOINT_MAP[selectedView]));
    setOptionDraft({
      seatHeight: SEAT_HEIGHT_MAP[height[0] ?? "무관"],
      section: SECTION_MAP[zone[0] ?? "무관"],
    });

    router.push("/onboarding/option");
  };

  useEffect(() => {
    if (!bootstrapped) return;

    const isAuthed = Boolean(accessToken) && Boolean(user);
    if (!isAuthed) {
      const next = pathname + (sp.toString() ? `?${sp.toString()}` : "");
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    if (checkedRef.current) return;
    checkedRef.current = true;

    (async () => {
      try {
        const data = await getOnboardingStatus();

        if (Boolean(data?.onboardingStatus)) {
          const next = new URLSearchParams(sp.toString()).get("next");
          router.replace(next ? decodeURIComponent(next) : "/");
        }
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.status === 401 || e.status === 403) {
            const next = pathname + (sp.toString() ? `?${sp.toString()}` : "");
            router.replace(`/login?next=${encodeURIComponent(next)}`);
            return;
          }
          if (e.status === 404) return;
          console.error("onboarding status failed:", e.message);
        } else {
          console.error("onboarding status error:", e);
        }
      }
    })();
  }, [bootstrapped, accessToken, user, router, pathname, sp]);

  return (
    <div
      className="w-full min-h-screen overflow-hidden"
      style={{ background: "var(--background-grey, #FAFAFA)" }}
    >
      <div className="w-full min-h-screen flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 flex items-center">
          <div className="w-full px-6 sm:px-10 lg:px-20 py-12 lg:py-0">
            <div className="inline-flex flex-col items-start gap-8 max-w-[524px]">
              <div data-progress="1/2" className="inline-flex items-center gap-2">
                <div className="w-24 h-2.5 rounded-full" style={{ background: "var(--foundation-neutral-900, #E6E6E6)" }} />
                <div className="w-24 h-2.5 rounded-full" style={{ background: "var(--foundation-primary-500, #00C292)" }} />
                <div className="w-24 h-2.5 rounded-full" style={{ background: "var(--foundation-neutral-900, #E6E6E6)" }} />
              </div>

              <div className="self-stretch flex flex-col items-start gap-[5px]">
                <div className="self-stretch text-2xl sm:text-3xl font-semibold leading-9 sm:leading-10" style={{ color: "var(--text-normal-n240, #3D3D3D)" }}>
                  선호하시는 관람 유형을 선택해주세요
                </div>
                <div className="self-stretch text-base sm:text-lg font-normal leading-6 sm:leading-7" style={{ color: "var(--text-normal-n240, #3D3D3D)" }}>
                  필수 질문은 추천 블럭을,<br /> 선택 질문은 개인화된 추천 품질 개선을 위해 수집됩니다.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 bg-white overflow-hidden">
          <div className="min-h-screen px-6 sm:px-10 lg:px-20 py-10 sm:py-16 lg:py-28 inline-flex flex-col justify-between w-full">
            <div className="self-stretch flex flex-col items-start gap-12 lg:gap-16">
              <div className="self-stretch flex flex-col items-start gap-8 pb-10">
                <section className="self-stretch flex flex-col items-start gap-4">
                  <div className="self-stretch flex flex-col items-start gap-1.5">
                    <div className="self-stretch inline-flex items-start gap-2">
                      <div className="text-base sm:text-lg font-semibold leading-6 text-black">어디에서 보고 싶으신가요?</div>
                      <div className="flex-none whitespace-nowrap text-base sm:text-lg font-semibold leading-6" style={{ color: "var(--foundation-primary-500, #00C292)" }}>*필수</div>
                    </div>
                    <div className="self-stretch inline-flex items-center gap-2">
                      <div className="flex-1 text-sm font-medium leading-5 text-black">경기 시야는 관람 경험에 가장 큰 영향을 줍니다. 최대 3개까지 입력해주세요.</div>
                    </div>
                  </div>
                  <div className="self-stretch inline-flex items-center gap-1.5 flex-wrap">
                    {viewOptions.map((opt) => (
                      <Chip key={opt} label={opt} priority={getPriority(view, opt)} onClick={() => setView((prev) => toggleUpToThree(prev, opt))} />
                    ))}
                  </div>
                </section>

                <section className="self-stretch flex flex-col items-start gap-4">
                  <div className="self-stretch flex flex-col items-start gap-1.5">
                    <div className="self-stretch inline-flex items-start gap-2">
                      <div className="text-base sm:text-lg font-semibold leading-6 text-black">응원하는 구단이 있으신가요?</div>
                      <div className="flex-none whitespace-nowrap text-base sm:text-lg font-semibold leading-6" style={{ color: "var(--foundation-primary-500, #00C292)" }}>*필수</div>
                    </div>
                    <div className="self-stretch inline-flex items-center gap-2">
                      <div className="flex-1 text-sm font-medium leading-5 text-black">응원하는 구단과 가까운 자리에서 더 생생하게 응원할 수 있어요.</div>
                    </div>
                  </div>
                  <div className="self-stretch inline-flex items-center gap-1.5 flex-wrap">
                    <DropdownMenu open={isClubOpen} onOpenChange={setIsClubOpen}>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="self-stretch min-h-8 w-full rounded-lg px-4 py-2 inline-flex justify-start items-center gap-1 overflow-hidden outline outline-[0.80px] outline-offset-[-0.80px]"
                          style={{
                            background: isClubOpen ? "var(--foundation-primary-10)" : "var(--background-white)",
                            outlineColor: isClubOpen ? "var(--foundation-primary-500)" : "var(--stroke-interactive-neutral-default)",
                          }}
                        >
                          <div className="flex-1 flex justify-between items-center">
                            <div
                              className="text-center justify-center text-sm font-medium font-['Pretendard'] leading-5"
                              style={{ color: isClubOpen ? "var(--foundation-primary-700)" : "var(--text-normal-n240)" }}
                            >
                              {selectedClub?.label ?? "선택하기"}
                            </div>
                            <div className="flex justify-center items-center">
                              <ChevronDown className="h-4 w-4" style={{ color: isClubOpen ? "var(--foundation-primary-500)" : "var(--text-normal-n240)" }} />
                            </div>
                          </div>
                        </button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="start" className="w-56">
                        {clubOptions.map((club) => (
                          <DropdownMenuItem key={club.id} onClick={() => setSelectedClub(club)}>
                            {club.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </section>

                <section className="self-stretch flex flex-col items-start gap-4">
                  <div className="self-stretch flex flex-col items-start gap-1.5">
                    <div className="self-stretch inline-flex items-start gap-2">
                      <div className="text-base sm:text-lg font-semibold leading-6 text-black">응원석 근처 자리를 선호하시나요?</div>
                      <div className="flex-none whitespace-nowrap text-base sm:text-lg font-semibold leading-6" style={{ color: "var(--foundation-primary-500, #00C292)" }}>*필수</div>
                    </div>
                    <div className="self-stretch inline-flex items-center gap-2">
                      <div className="flex-1 text-sm font-medium leading-5 text-black">응원석 근처에서 더 뜨거운 현장 분위기를 느껴보세요.</div>
                    </div>
                  </div>
                  <div className="self-stretch inline-flex items-center gap-1.5 flex-wrap">
                    {cheerOption.map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        priority={getPriority(cheer, opt)}
                        showPriority={false}
                        onClick={() => setCheer((prev) => toggleUpToOne(prev, opt))}
                      />
                    ))}
                  </div>
                </section>

                <section className="self-stretch flex flex-col items-start gap-4">
                  <div className="self-stretch flex flex-col items-start gap-1.5">
                    <div className="self-stretch inline-flex items-start gap-2">
                      <div className="text-base sm:text-lg font-semibold leading-6 text-black">구역 위치는 어느 쪽을 선호하시나요?</div>
                    </div>
                    <div className="self-stretch inline-flex items-center gap-2">
                      <div className="flex-1 text-sm font-medium leading-5 text-black">중앙에 가까울수록 시야가 안정적이에요.</div>
                    </div>
                  </div>
                  <div className="self-stretch inline-flex items-center gap-1.5 flex-wrap">
                    {zoneOptions.map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        priority={getPriority(zone, opt)}
                        showPriority={false}
                        onClick={() => setZone((prev) => toggleUpToOne(prev, opt))}
                      />
                    ))}
                  </div>
                </section>

                <section className="self-stretch flex flex-col items-start gap-4">
                  <div className="self-stretch flex flex-col items-start gap-1.5">
                    <div className="self-stretch inline-flex items-start gap-2">
                      <div className="text-base sm:text-lg font-semibold leading-6 text-black">좌석 높이는 어느 쪽이 좋으신가요?</div>
                    </div>
                    <div className="self-stretch inline-flex items-center gap-2">
                      <div className="flex-1 text-sm font-medium leading-5 text-black">앞뒤 거리와 시야 강도에 영향을 줍니다.</div>
                    </div>
                  </div>
                  <div className="self-stretch inline-flex items-center gap-1.5 flex-wrap">
                    {heightOptions.map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        priority={getPriority(height, opt)}
                        showPriority={false}
                        onClick={() => setHeight((prev) => toggleUpToOne(prev, opt))}
                      />
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <div className="w-full inline-flex justify-between items-center">
              <div>
                <TertiaryButton size="md" tone="base" onClick={handlePrev}>
                  이전
                </TertiaryButton>
              </div>
              <div className="self-stretch flex flex-col items-end gap-2 pt-6">
                <PrimaryButton size="lg" tone="base" onClick={handleNext} disabled={!canGoNext}>
                  다음
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
