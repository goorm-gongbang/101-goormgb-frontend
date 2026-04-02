"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PrimaryButton } from "@/components/common/Button";
import { useAuthStore } from "@/stores/authStore";
import { useOnboardingPrefStore } from "@/stores/onboardingPrefStore";
import { getOnboardingStatus } from "@/lib/services";
import { ApiError } from "@/lib/api";
import { PreferredZoneSection } from "@/components/my/PreferredZoneSection";

export default function OnboardingIntroPage() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const checkedRef = useRef(false);

  const [selectedBlocks, setSelectedBlocks] = useState<number[]>([]);
  const setPreferredBlockIds = useOnboardingPrefStore((s) => s.setPreferredBlockIds);

  const canGoNext = selectedBlocks.length >= 1 && selectedBlocks.length <= 10;

  const handleBlockToggle = (blockNum: number) => {
    setSelectedBlocks((prev) =>
      prev.includes(blockNum)
        ? prev.filter((v) => v !== blockNum)
        : prev.length >= 10
          ? prev
          : [...prev, blockNum]
    );
  };

  const handleNext = () => {
    if (!canGoNext) return;
    setPreferredBlockIds(selectedBlocks);
    router.push("/onboarding");
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

        const onboardingStatus = Boolean(data?.onboardingStatus);
        if (onboardingStatus) {
          const next = new URLSearchParams(sp.toString()).get("next");
          router.replace(next ? decodeURIComponent(next) : "/");
          return;
        }
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.status === 401 || e.status === 403) {
            const next = pathname + (sp.toString() ? `?${sp.toString()}` : "");
            router.replace(`/login?next=${encodeURIComponent(next)}`);
            return;
          }
          console.error("❌ onboarding status failed:", e.message);
        } else {
          console.error("⚠️ onboarding status error:", e);
        }
      }
    })();
  }, [bootstrapped, accessToken, user, router, pathname, sp]);

  if (!bootstrapped) return null;
  if (!accessToken || !user) return null;

  return (
    <div
      className="w-full min-h-screen overflow-hidden"
      style={{ background: "var(--background-grey, #FAFAFA)" }}
    >
      <div className="w-full min-h-screen flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 flex items-center">
          <div className="w-full px-6 sm:px-10 lg:px-20 py-12 lg:py-0">
            <div className="inline-flex flex-col items-start gap-8 max-w-[524px]">
              <div
                data-progress="0/2"
                className="inline-flex items-center gap-2"
              >
                <div
                  className="w-24 h-2.5 rounded-full"
                  style={{
                    background: "var(--foundation-primary-500, #00C292)",
                  }}
                />
                <div
                  className="w-24 h-2.5 rounded-full"
                  style={{
                    background: "var(--foundation-neutral-900, #E6E6E6)",
                  }}
                />
                <div
                  className="w-24 h-2.5 rounded-full"
                  style={{
                    background: "var(--foundation-neutral-900, #E6E6E6)",
                  }}
                />
              </div>

              <div className="self-stretch flex flex-col items-start gap-[5px]">
                <div
                  className="self-stretch text-2xl sm:text-3xl font-semibold leading-9 sm:leading-10"
                  style={{ color: "var(--text-normal-n240, #3D3D3D)" }}
                >
                  선호 구역을 선택해주세요
                </div>
                <div
                  className="self-stretch text-base sm:text-lg font-normal leading-6 sm:leading-7"
                  style={{ color: "var(--text-normal-n240, #3D3D3D)" }}
                >
                  원하시는 구역을 선택하면 빠르게 좌석을 배정해 드려요.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 bg-white overflow-hidden">
          <div className="min-h-screen px-6 sm:px-10 lg:px-20 py-10 sm:py-16 lg:py-28 inline-flex flex-col justify-between w-full">
            <div className="self-stretch flex flex-col items-start gap-12 lg:gap-16">
              <section className="self-stretch flex flex-col items-center gap-6">
                <div className="w-full max-w-[720px]">
                  <PreferredZoneSection
                    selectedBlocks={selectedBlocks}
                    onToggle={handleBlockToggle}
                    onReset={() => setSelectedBlocks([])}
                  />
                </div>
              </section>

            </div>

            <div className="self-stretch flex flex-col items-end gap-2 pt-6">
              <PrimaryButton
                size="lg"
                tone="base"
                onClick={handleNext}
                disabled={!canGoNext}
              >
                다음
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
