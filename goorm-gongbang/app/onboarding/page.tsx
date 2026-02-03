"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { ChipButton } from "@/components/common/ChipButton";
import { UiCheckbox } from "@/components/common/UiCheckbox";
import { cn } from "@/lib/utils";
import type { Viewpoint, SeatHeight, Section, PreferenceBase } from "@/stores/onboardingPrefStore";
import { useOnboardingPrefStore } from "@/stores/onboardingPrefStore";

type ViewPreference = "중앙" | "1루 내야" | "3루 내야" | "외야(좌)" | "외야(중)" | "외야(우)";
type HeightPreference = "하단" | "중단" | "상단" | "무관";
type ZonePreference = "중앙쪽" | "중간" | "코너(파울라인)" | "무관";

const viewOptions: ViewPreference[] = ["중앙", "1루 내야", "3루 내야", "외야(좌)", "외야(중)", "외야(우)"];
const heightOptions: HeightPreference[] = ["하단", "중단", "상단", "무관"];
const zoneOptions: ZonePreference[] = ["중앙쪽", "중간", "코너(파울라인)", "무관"];

/* Rank Badge */
function RankBadge({ n }: { n: number }) {
  return (
    <div className="px-1.5 bg-[var(--foundation-primary-700)] rounded-[100px] inline-flex flex-col justify-center items-center overflow-hidden">
      <div className="text-[var(--foundation-primary-10)] text-xs font-normal font-['Pretendard'] leading-4">
        {n}
      </div>
    </div>
  );
}

/* Chip  */
function Chip({ label, rank, onClick }: {
  label: string; // 글자 데이터
  rank: number | null;
  onClick: () => void;
}) {
  return (
    <ChipButton
      uiSize="lg"
      tone={rank ? "strong" : "soft"}
      onClick={onClick}
      aria-pressed={Boolean(rank)}
      leftIcon={rank ? <RankBadge n={rank} /> : undefined}
      className={rank ? "gap-2" : ""}
    >
      {label}
    </ChipButton>
  );
}

/* CheckBox */
function ConsentRow({ id, label, requiredBadge, checked, onChange, disabled }: {
  id: string;
  label: string; // 글자 데이터
  requiredBadge?: boolean; // 폰트 굵기
  checked: boolean; // 체크 여부
  onChange: (v: boolean) => void;
  disabled?: boolean; // 활성화 여부
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
          disabled && "cursor-not-allowed"
        )}
      >
        {label}
      </label>
    </div>
  );
}

/* 최대 3개, 클릭 순서 유지, 재클릭 시 해제 */
function toggleUpToThree<T>(prev: T[], value: T) {
  const idx = prev.indexOf(value);

  /* 이미 선택된 경우 -> 제거 (순서 재 정렬) */
  if (idx !== -1) {
    return prev.filter((v) => v !== value);
  }

  /* 새로 선택 시 3개면 -> 무시 */
  if (prev.length >= 3) return prev;

  /* 3개 미만이면 -> 끝에 추가 (클릭 순서) */
  return [...prev, value];
}

function getRank<T>(arr: T[], value: T) {
  const idx = arr.indexOf(value);
  return idx === -1 ? null : idx + 1; // 1, 2, 3
}

export default function SeatStyleOnboardingPage() {
  /* 서버 enum 매핑 */
  const VIEWPOINT_MAP: Record<ViewPreference, Viewpoint> = {
    "중앙": "CENTER",
    "1루 내야": "INFIELD_1B",
    "3루 내야": "INFIELD_3B",
    "외야(좌)": "OUTFIELD_L",
    "외야(중)": "OUTFIELD_C",
    "외야(우)": "OUTFIELD_R",
  };

  const SEAT_HEIGHT_MAP: Record<HeightPreference, SeatHeight> = {
    "하단": "LOW",
    "중단": "MID",
    "상단": "HIGH",
    "무관": "ANY",
  };

  const SECTION_MAP: Record<ZonePreference, Section> = {
    "중앙쪽": "MIDDLE",
    "중간": "CENTER_SIDE",
    "코너(파울라인)": "CORNER",
    "무관": "ANY",
  };


  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const checkedRef = useRef(false); // 온보딩 status 조회 중복 방지

  const [view, setView] = useState<ViewPreference[]>([]); // 어디서 보고 싶으신가요?
  const [height, setHeight] = useState<HeightPreference[]>([]); // 좌석 높이는 어느 쪽이 좋으신가요?
  const [zone, setZone] = useState<ZonePreference[]>([]); // 구역 위치는 어느 쪽을 선호하시나요?
  const [consentRequired, setConsentRequired] = useState(false); // 선호 데이터 체크
  const [consentMarketing, setConsentMarketing] = useState(false); // 마케팅 수신 동의 체크

  const setBasePreferences = useOnboardingPrefStore((s) => s.setBasePreferences); // 온보딩 zustand 저장 (정보)
  const setMarketingAgreed = useOnboardingPrefStore((s) => s.setMarketingAgreed); // 온보딩 zustand 저장 (마케팅)

  useEffect(() => {
    if (!bootstrapped) return;

    /* 로그인 체크 */
    const isAuthed = Boolean(accessToken) && Boolean(user); // accesstoken과 user 조회
    if (!isAuthed) {
      const next = pathname + (sp.toString() ? `?${sp.toString()}` : "");
      router.replace(`/auth/login?next=${encodeURIComponent(next)}`); // 로그인 후 다시 돌아오도록 처리
      return;
    }

    /* 온보딩 상태 체크 (이미 완료면 다른 페이지로) */
    if (checkedRef.current) return;
    checkedRef.current = true;

    const controller = new AbortController();
    (async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

        const res = await fetch(`${API_BASE_URL}/api/users/onboarding/status`, {  // ★ 추후 실제 api 문서에 맞게 변경해야함.
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
          signal: controller.signal,
        });

        /* 백엔드 예외처리 */
        if (res.status === 401) { // 토큰 만료/인증 실패
          const next = pathname + (sp.toString() ? `?${sp.toString()}` : "");
          router.replace(`/auth/login?next=${encodeURIComponent(next)}`);
          return;
        }

        if (res.status === 403) { // 계정 상태 DEACTIVE
          router.replace("/auth/login");
          return;
        }

        if (!res.ok) { // 이후 오류 코드
          console.error("❌ onboarding status failed:", res.status);
          return;
        }

        const json = await res.json().catch(() => null);
        console.log("[onboarding/status] json", json);

        const onboardingStatus = Boolean(json?.data?.onboardingStatus);

        /* 이미 온보딩 완료면 이 페이지 들어오면 안됨 -> 홈 이동 */
        if (onboardingStatus) {
          const next = new URLSearchParams(sp.toString()).get("next");
          router.replace(next ? decodeURIComponent(next) : "/");
          return;
        }

      } catch (e) {
        if ((e as any)?.name === "AbortError") return;
        console.error("⚠️ onboarding status error:", e);
      }
    })();
  }, [bootstrapped, accessToken, user, router, pathname, sp])

  if (!bootstrapped) return null;
  if (!accessToken || !user) return null;


  /* 다음 단계 버튼 제한 */
  const canGoNext = useMemo(() => {
    return view.length === 3 && height.length === 3 && zone.length === 3 && consentRequired;
  }, [view, height, zone, consentRequired]);


  /* 다음 버튼 클릭 */
  const handleNext = () => {
    if (!canGoNext) return;

    const basePrefs: PreferenceBase[] = [0, 1, 2].map((i) => ({
      rank: (i + 1) as 1 | 2 | 3,
      viewpoint: VIEWPOINT_MAP[view[i]],
      seatHeight: SEAT_HEIGHT_MAP[height[i]],
      section: SECTION_MAP[zone[i]],
    }));

    /* 1단계 필수 값 저장 */
    setBasePreferences(basePrefs);
    setMarketingAgreed(consentMarketing);

    /* 옵션 페이지로 이동 */
    router.push("/onboarding/option");
  };

  return (
    <div
      className="w-full min-h-screen overflow-hidden"
      style={{ background: "var(--background-grey, #FAFAFA)" }}
    >
      <div className="w-full min-h-screen flex flex-col lg:flex-row">
        {/* Left Copy 영역 */}
        <div className="w-full lg:w-1/2 flex items-center">
          <div className="w-full px-6 sm:px-10 lg:px-20 py-12 lg:py-0">
            <div className="inline-flex flex-col items-start gap-8 max-w-[524px]">
              <div data-progress="1/2" className="inline-flex items-center gap-2">
                <div
                  className="w-24 h-2.5 rounded-full"
                  style={{ background: "var(--foundation-primary-500, #00C292)" }}
                />
                <div
                  className="w-24 h-2.5 rounded-full"
                  style={{ background: "var(--foundation-neutral-900, #E6E6E6)" }}
                />
              </div>

              <div className="self-stretch flex flex-col items-start gap-[5px]">
                <div
                  className="self-stretch text-2xl sm:text-3xl font-semibold leading-9 sm:leading-10"
                  style={{ color: "var(--text-normal-n240, #3D3D3D)" }}
                >
                  원하시는 좌석 스타일을 선택해주세요
                </div>
                <div
                  className="self-stretch text-base sm:text-lg font-normal leading-6 sm:leading-7"
                  style={{ color: "var(--text-normal-n240, #3D3D3D)" }}
                >
                  1순위부터 우선 반영되며, 상황에 따라 다음 순위가 활용돼요.
                  <br />
                  모든 순위를 입력해야 추천 정확도가 높아져요.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-1/2 bg-white overflow-hidden">
          <div className="min-h-screen px-6 sm:px-10 lg:px-20 py-10 sm:py-16 lg:py-28 inline-flex flex-col justify-between w-full">
            <div className="self-stretch flex flex-col items-start gap-12 lg:gap-16">
              {/* Sections */}
              <div className="self-stretch flex flex-col items-start gap-8">
                {/* Section 1 */}
                <section className="self-stretch flex flex-col items-start gap-4">
                  <div className="self-stretch flex flex-col items-start gap-1.5">
                    <div className="self-stretch inline-flex items-start gap-2">
                      <div className="text-base sm:text-lg font-semibold leading-6 text-black">
                        어디에서 보고 싶으신가요? 선호하는 순으로 선택해주세요.
                      </div>
                      <div
                        className="flex-none whitespace-nowrap text-base sm:text-lg font-semibold leading-6"
                        style={{ color: "var(--foundation-primary-500, #00C292)" }}
                      >
                        *필수
                      </div>
                    </div>
                    <div className="self-stretch inline-flex items-center gap-2">
                      <div className="flex-1 text-sm font-medium leading-5 text-black">
                        경기 시야와 관람 경험에 가장 큰 영향을 줘요.
                      </div>
                    </div>
                  </div>

                  <div className="self-stretch inline-flex items-center gap-1.5 flex-wrap">
                    {viewOptions.map((opt) => (
                      <Chip key={opt} label={opt} rank={getRank(view, opt)} onClick={() => setView((prev) => toggleUpToThree(prev, opt))} />
                    ))}
                  </div>
                </section>

                {/* Section 2 */}
                <section className="self-stretch flex flex-col items-start gap-4">
                  <div className="self-stretch flex flex-col items-start gap-1.5">
                    <div className="self-stretch inline-flex items-start gap-2">
                      <div className="text-base sm:text-lg font-semibold leading-6 text-black">
                        좌석 높이는 어느 쪽이 좋으신가요?
                      </div>
                      <div
                        className="flex-none whitespace-nowrap text-base sm:text-lg font-semibold leading-6"
                        style={{ color: "var(--foundation-primary-500, #00C292)" }}
                      >
                        *필수
                      </div>
                    </div>
                    <div className="self-stretch inline-flex items-center gap-2">
                      <div className="flex-1 text-sm font-medium leading-5 text-black">
                        앞뒤 거리와 시야 각도에 영향을 줘요.
                      </div>
                    </div>
                  </div>

                  <div className="self-stretch inline-flex items-center gap-1.5 flex-wrap">
                    {heightOptions.map((opt) => (
                      <Chip key={opt} label={opt} rank={getRank(height, opt)} onClick={() => setHeight((prev) => toggleUpToThree(prev, opt))} />
                    ))}
                  </div>
                </section>

                {/* Section 3 */}
                <section className="self-stretch flex flex-col items-start gap-4">
                  <div className="self-stretch flex flex-col items-start gap-1.5">
                    <div className="self-stretch inline-flex items-start gap-2">
                      <div className="text-base sm:text-lg font-semibold leading-6 text-black">
                        구역 위치는 어느 쪽을 선호하시나요?
                      </div>
                      <div
                        className="flex-none whitespace-nowrap text-base sm:text-lg font-semibold leading-6"
                        style={{ color: "var(--foundation-primary-500, #00C292)" }}
                      >
                        *필수
                      </div>
                    </div>
                    <div className="self-stretch inline-flex items-center gap-2">
                      <div className="flex-1 text-sm font-medium leading-5 text-black">
                        중앙에 가까울수록 시야가 안정적이에요.
                      </div>
                    </div>
                  </div>

                  <div className="self-stretch inline-flex items-center gap-1.5 flex-wrap">
                    {zoneOptions.map((opt) => (
                      <Chip key={opt} label={opt} rank={getRank(zone, opt)} onClick={() => setZone((prev) => toggleUpToThree(prev, opt))} />
                    ))}
                  </div>
                </section>
              </div>

              {/* Consents */}
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
            </div>

            {/* Bottom CTA */}
            <div className="self-stretch flex flex-col items-end gap-2 pt-6">
              <button
                type="button"
                onClick={handleNext}
                disabled={!canGoNext}
                className={cn(
                  "w-20 h-10 min-w-20 px-4 py-2 rounded-md inline-flex items-center justify-center",
                  "transition-colors duration-150",
                  canGoNext
                    ? "bg-[var(--foundation-primary-600)] hover:bg-[var(--foundation-primary-700)] active:bg-[var(--foundation-primary-800)] cursor-pointer"
                    : "bg-[var(--background-interactive-neutral-disabled,#E5E5E5)] cursor-not-allowed",
                )}
              >
                <span
                  className={[
                    "flex-1 text-center text-sm font-medium leading-5",
                    canGoNext ? "text-white" : "text-[var(--text-interactive-neutral-disabled,#999999)]",
                  ].join(" ")}
                >
                  다음
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
