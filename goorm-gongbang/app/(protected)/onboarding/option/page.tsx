"use client";

import { useMemo, useState } from "react";
import { ChipButton, PrimaryButton, TertiaryButton } from "@/components/common/Button";
import { useRouter } from "next/navigation";
import { InfoTooltip } from "@/components/common/InfoTooltip";
import { UiCheckbox } from "@/components/common/UiCheckbox";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import {
  useOnboardingPrefStore,
  type SeatPositionPref,
  type EnvironmentPref,
  type MoodPref,
  type ObstructionSensitivity,
  type PriceMode,
} from "@/stores/onboardingPrefStore";
import { saveOnboardingPreferences } from "@/lib/services";
import { ApiError } from "@/lib/api";

type ViewTypePreference = "통로 선호" | "중앙 선호" | "무관";
type EnvPreference = "그늘 선호" | "햇빛 무관" | "무관";
type MoodPreference = "열정적인 응원" | "조용한 관람" | "무관";
type DistPreference = "안전망 민감" | "난간·기둥 민감" | "보통" | "무관";
type PricePreference = "~ 13,000원" | "14,000원~ 17,000원" | "18,000원~ 29,000원" | "30,000원~ " | "무관";

const viewTypeOptions: ViewTypePreference[] = ["통로 선호", "중앙 선호", "무관"];
const envOptions: EnvPreference[] = ["그늘 선호", "햇빛 무관", "무관"];
const moodOptions: MoodPreference[] = ["열정적인 응원", "조용한 관람", "무관"];
const distOptions: DistPreference[] = ["안전망 민감", "난간·기둥 민감", "보통", "무관"];
const priceOptions: PricePreference[] = ["~ 13,000원", "14,000원~ 17,000원", "18,000원~ 29,000원", "30,000원~ ", "무관"];

function Chip({ label, click, onClick }: {
  click: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <ChipButton uiSize="lg" tone={click ? "strong" : "soft"} onClick={onClick} aria-pressed={click}>
      {label}
    </ChipButton>
  );
}

function ConsentRow({ id, label, requiredBadge, checked, onChange, disabled }: {
  id: string;
  label: string;
  requiredBadge?: boolean;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <UiCheckbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(v) => onChange(v === true)}
      />
      <label
        htmlFor={id}
        className={cn(
          "text-sm leading-5 cursor-pointer",
          requiredBadge ? "font-semibold" : "font-normal",
          "text-[var(--light-foreground)]",
          disabled && "cursor-not-allowed",
        )}
      >
        {label}
      </label>
    </div>
  );
}

function toggleSingle<T>(prev: T | null, next: T): T | null {
  return prev === next ? null : next;
}

const SEAT_POSITION_MAP: Record<ViewTypePreference, SeatPositionPref> = {
  "통로 선호": "AISLE",
  "중앙 선호": "MIDDLE",
  무관: "ANY",
};

const ENV_MAP: Record<EnvPreference, EnvironmentPref> = {
  "그늘 선호": "SHADE",
  "햇빛 무관": "SUN_OK",
  무관: "ANY",
};

const MOOD_MAP: Record<MoodPreference, MoodPref> = {
  "열정적인 응원": "CHEERFUL",
  "조용한 관람": "QUIET",
  무관: "ANY",
};

const OBSTRUCTION_MAP: Record<DistPreference, ObstructionSensitivity> = {
  "안전망 민감": "NET_SENSITIVE",
  "난간·기둥 민감": "RAIL_PILLAR_SENSITIVE",
  보통: "NORMAL",
  무관: "ANY",
};

function priceToPayload(p: PricePreference | null): {
  priceMode: PriceMode;
  priceMin: number | null;
  priceMax: number | null;
} {
  if (!p || p === "무관") return { priceMode: "ANY", priceMin: null, priceMax: null };

  switch (p) {
    case "~ 13,000원":
      return { priceMode: "RANGE", priceMin: 0, priceMax: 13000 };
    case "14,000원~ 17,000원":
      return { priceMode: "RANGE", priceMin: 14000, priceMax: 17000 };
    case "18,000원~ 29,000원":
      return { priceMode: "RANGE", priceMin: 18000, priceMax: 29000 };
    case "30,000원~ ":
      return { priceMode: "RANGE", priceMin: 30000, priceMax: null };
    default:
      return { priceMode: "ANY", priceMin: null, priceMax: null };
  }
}

export default function SeatStyleOnboardingOptionPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  const marketingAgreed = useOnboardingPrefStore((s) => s.marketingAgreed);
  const favoriteClubId = useOnboardingPrefStore((s) => s.favoriteClubId);
  const cheerProximityPref = useOnboardingPrefStore((s) => s.cheerProximityPref);
  const preferredBlockIds = useOnboardingPrefStore((s) => s.preferredBlockIds);
  const viewpoints = useOnboardingPrefStore((s) => s.viewpoints);
  const optionDraft = useOnboardingPrefStore((s) => s.optionDraft);
  const setMarketingAgreed = useOnboardingPrefStore((s) => s.setMarketingAgreed);
  const reset = useOnboardingPrefStore((s) => s.reset);

  const [viewType, setViewType] = useState<ViewTypePreference | null>(null);
  const [env, setEnv] = useState<EnvPreference | null>(null);
  const [mood, setMood] = useState<MoodPreference | null>(null);
  const [dist, setDist] = useState<DistPreference | null>(null);
  const [price, setPrice] = useState<PricePreference | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  const [consentRequired, setConsentRequired] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(marketingAgreed);

  const canSubmit = useMemo(() => {
    return (
      Boolean(accessToken) &&
      favoriteClubId !== null &&
      cheerProximityPref !== null &&
      preferredBlockIds.length >= 1 &&
      preferredBlockIds.length <= 10 &&
      viewpoints.length >= 1 &&
      viewpoints.length <= 3 &&
      consentRequired
    );
  }, [
    accessToken,
    favoriteClubId,
    cheerProximityPref,
    preferredBlockIds,
    viewpoints,
    consentRequired,
  ]);

  const handlePrev = () => router.back();

  const handleNext = async () => {
    if (
      !canSubmit ||
      !accessToken ||
      favoriteClubId === null ||
      cheerProximityPref === null
    ) {
      return;
    }

    const seatPositionPref: SeatPositionPref = viewType ? SEAT_POSITION_MAP[viewType] : "ANY";
    const environmentPref: EnvironmentPref = env ? ENV_MAP[env] : "ANY";
    const moodPref: MoodPref = mood ? MOOD_MAP[mood] : "ANY";
    const obstructionSensitivity: ObstructionSensitivity = dist ? OBSTRUCTION_MAP[dist] : "ANY";
    const pricePatch = priceToPayload(price);

    const preferences = viewpoints.map((viewpoint, index) =>
      index === 0
        ? {
          priority: 1 as const,
          viewpoint,
          seatHeight: optionDraft.seatHeight,
          section: optionDraft.section,
          seatPositionPref,
          environmentPref,
          moodPref,
          obstructionSensitivity,
          priceMode: pricePatch.priceMode,
          priceMin: pricePatch.priceMode === "RANGE" ? pricePatch.priceMin : undefined,
          priceMax: pricePatch.priceMode === "RANGE" ? pricePatch.priceMax : undefined,
        }
        : {
          priority: (index + 1) as 2 | 3,
          viewpoint,
        },
    );

    const body = {
      marketingConsent: { marketingAgreed: Boolean(consentMarketing) },
      favoriteClubId,
      cheerProximityPref,
      preferredBlockIds,
      preferences,
    };

    try {
      setIsFinishing(true);
      setMarketingAgreed(Boolean(consentMarketing));

      await saveOnboardingPreferences(body);
      console.log("[onboarding/preferences] data", body);

      router.replace("/");
      setTimeout(() => reset(), 0);
    } catch (e) {
      setIsFinishing(false);
      if (e instanceof ApiError) {
        if (e.status === 401 || e.status === 403) {
          router.replace("/login");
          return;
        }
        if (e.status === 409) {
          router.replace("/");
          return;
        }
        console.error("onboarding/preferences failed:", e.message);
      } else {
        console.error("onboarding/preferences error:", e);
      }
    }
  };

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
                <div className="w-24 h-2.5 rounded-full" style={{ background: "var(--foundation-neutral-900, #E6E6E6)" }} />
                <div className="w-24 h-2.5 rounded-full" style={{ background: "var(--foundation-primary-500, #00C292)" }} />
              </div>

              <div className="self-stretch flex flex-col items-start gap-[5px]">
                <div className="self-stretch text-2xl sm:text-3xl font-semibold leading-9 sm:leading-10" style={{ color: "var(--text-normal-n240, #3D3D3D)" }}>
                  선호하시는 관람 유형을 선택해주세요
                </div>
                <div className="self-stretch text-base sm:text-lg font-normal leading-6 sm:leading-7" style={{ color: "var(--text-normal-n240, #3D3D3D)" }}>
                  필수 질문은 추천 분류에
                  <br />
                  선택 질문은 개인화된 추천 정확도 개선에 사용됩니다.
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
                      <div className="text-base sm:text-lg font-semibold leading-6 text-black">좌석 위치 선호가 있나요?</div>
                    </div>
                    <div className="self-stretch inline-flex items-center gap-2">
                      <div className="flex-1 text-sm font-medium leading-5 text-black">이동 편의성과 시야 차이를 고려할 수 있어요.</div>
                    </div>
                  </div>
                  <div className="self-stretch inline-flex items-center gap-1.5 flex-wrap">
                    {viewTypeOptions.map((opt) => (
                      <Chip key={opt} label={opt} click={viewType === opt} onClick={() => setViewType((prev) => toggleSingle(prev, opt))} />
                    ))}
                  </div>
                </section>

                <section className="self-stretch flex flex-col items-start gap-4">
                  <div className="self-stretch flex flex-col items-start gap-1.5">
                    <div className="self-stretch inline-flex items-start gap-2">
                      <div className="text-base sm:text-lg font-semibold leading-6 text-black">관람 환경 선호가 있나요?</div>
                    </div>
                    <div className="self-stretch inline-flex items-center gap-2">
                      <div className="flex-1 text-sm font-medium leading-5 text-black">햇빛 여부에 따라 체감이 달라질 수 있어요.</div>
                    </div>
                  </div>
                  <div className="self-stretch inline-flex items-center gap-1.5 flex-wrap">
                    {envOptions.map((opt) => (
                      <Chip key={opt} label={opt} click={env === opt} onClick={() => setEnv((prev) => toggleSingle(prev, opt))} />
                    ))}
                  </div>
                </section>

                <section className="self-stretch flex flex-col items-start gap-4">
                  <div className="self-stretch flex flex-col items-start gap-1.5">
                    <div className="self-stretch inline-flex items-start gap-2">
                      <div className="text-base sm:text-lg font-semibold leading-6 text-black">관람 분위기는 어떤 쪽이 좋으신가요?</div>
                    </div>
                    <div className="self-stretch inline-flex items-center gap-2">
                      <div className="flex-1 text-sm font-medium leading-5 text-black">응원 강도와 주변 소음 선호에 영향을 줘요.</div>
                    </div>
                  </div>
                  <div className="self-stretch inline-flex items-center gap-1.5 flex-wrap">
                    {moodOptions.map((opt) => (
                      <Chip key={opt} label={opt} click={mood === opt} onClick={() => setMood((prev) => toggleSingle(prev, opt))} />
                    ))}
                  </div>
                </section>

                <section className="self-stretch flex flex-col items-start gap-4">
                  <div className="self-stretch flex flex-col items-start gap-1.5">
                    <div className="self-stretch inline-flex items-start gap-2">
                      <div className="text-base sm:text-lg font-semibold leading-6 text-black">시야 방해 요소에 얼마나 민감하신가요?</div>
                    </div>
                    <div className="self-stretch inline-flex items-center gap-2">
                      <div className="flex-1 text-sm font-medium leading-5 text-black">안전망이나 기둥 같은 시야 요소를 고려해 추천해드려요.</div>
                    </div>
                  </div>
                  <div className="self-stretch inline-flex items-center gap-1.5 flex-wrap">
                    {distOptions.map((opt) => (
                      <Chip key={opt} label={opt} click={dist === opt} onClick={() => setDist((prev) => toggleSingle(prev, opt))} />
                    ))}
                  </div>
                </section>

                <section className="self-stretch flex flex-col items-start gap-4">
                  <div className="self-stretch flex flex-col items-start gap-1.5">
                    <div className="self-stretch inline-flex items-center gap-1">
                      <div className="text-base sm:text-lg font-semibold leading-6 text-black">좌석 가격은 어느 가격대를 원하시나요?</div>
                      <InfoTooltip
                        ariaLabel="가격 안내"
                        content={
                          <ul className="list-disc pl-4 text-sm leading-5 text-[var(--light-foreground,#111)] space-y-1">
                            <li>~ 13,000원 : 외야석 중심</li>
                            <li>14,000원~ 17,000원 : 내야 상단</li>
                            <li>18,000원~ 29,000원 : 내야 일반석</li>
                            <li>30,000원~ : 테이블석 / 프리미엄</li>
                          </ul>
                        }
                      />
                    </div>
                    <div className="self-stretch inline-flex items-center gap-2">
                      <div className="flex-1 text-sm font-medium leading-5 text-black">동일한 좌석 조건인 경우에만 가격을 반영해요.</div>
                    </div>
                  </div>
                  <div className="self-stretch inline-flex items-center gap-1.5 flex-wrap">
                    {priceOptions.map((opt) => (
                      <Chip key={opt} label={opt} click={price === opt} onClick={() => setPrice((prev) => toggleSingle(prev, opt))} />
                    ))}
                  </div>
                </section>
              </div>

              <div className="self-stretch flex flex-col items-start gap-2">
                <ConsentRow
                  id="consent-required"
                  label="[필수] 선호 데이터 활용 동의"
                  requiredBadge
                  checked={consentRequired}
                  onChange={setConsentRequired}
                />
                <ConsentRow
                  id="consent-marketing"
                  label="[선택] 마케팅 수신 동의"
                  checked={consentMarketing}
                  onChange={setConsentMarketing}
                />
              </div>

              <div className="w-full inline-flex justify-between items-center">
                <div>
                  <TertiaryButton size="md" tone="base" onClick={handlePrev}>
                    이전
                  </TertiaryButton>
                </div>
                <div className="self-stretch flex justify-center items-center gap-4">
                  <div>
                    <PrimaryButton
                      size="lg"
                      tone="base"
                      onClick={handleNext}
                      disabled={!canSubmit}
                      loading={isFinishing}
                    >
                      시작하기
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
