"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Toggle } from "@/components/common/Toggle";
import { DropDown } from "@/components/common/DropDown";
import { SecondaryButton } from "@/components/common/Button";
import { Info } from "lucide-react";

type Props = {
  enabled: boolean;
  onChange: (next: boolean) => void;
  nearbySeatEnabled: boolean;
  onNearbySeatChange: (next: boolean) => void;
  people: number;
  onPeopleChange: (next: number) => void;
  onPreferredZonesClick?: () => void;
  className?: string;
};

export function SeatPreferenceRecommendCard({
  enabled,
  onChange,
  nearbySeatEnabled,
  onNearbySeatChange,
  people,
  onPeopleChange,
  onPreferredZonesClick,
  className,
}: Props) {

  const [isNearbySeatInfoOpen, setIsNearbySeatInfoOpen] = useState(false);
  const nearbySeatInfoButtonRef = useRef<HTMLButtonElement | null>(null);
  const [nearbySeatInfoPosition, setNearbySeatInfoPosition] = useState({ left: 0, top: 0, width: 520 });

  const updateNearbySeatInfoPosition = useCallback(() => {
    const button = nearbySeatInfoButtonRef.current;
    if (!button) return;

    const viewportPadding = 16;
    const tooltipWidth = Math.min(
      520,
      Math.max(0, window.innerWidth - viewportPadding * 2),
    );
    const rect = button.getBoundingClientRect();
    const left = Math.min(
      Math.max(rect.left, viewportPadding),
      window.innerWidth - tooltipWidth - viewportPadding,
    );

    setNearbySeatInfoPosition({
      left,
      top: rect.bottom + 8,
      width: tooltipWidth,
    });
  }, []);

  useEffect(() => {
    if (!isNearbySeatInfoOpen) return;

    updateNearbySeatInfoPosition();
    window.addEventListener("resize", updateNearbySeatInfoPosition);
    window.addEventListener("scroll", updateNearbySeatInfoPosition, true);

    return () => {
      window.removeEventListener("resize", updateNearbySeatInfoPosition);
      window.removeEventListener("scroll", updateNearbySeatInfoPosition, true);
    };
  }, [isNearbySeatInfoOpen, updateNearbySeatInfoPosition]);

  return (
    <div
      className={cn(
        "inline-flex w-full flex-col items-start justify-start gap-4 rounded-2xl bg-[var(--foundation-neutral-white)] py-4",
        className,
      )}
    >
      <div className="inline-flex h-8 w-full items-center justify-between">
        <div className="flex items-center justify-center gap-2">
          <div className="text-base font-semibold leading-6 text-[var(--foundation-neutral-black)] font-['Pretendard']">
            사용자 선호 구역 추천
            <div className="text-xs font-normal leading-4 text-[var(--text-info-n600)] font-['Pretendard']">
              {enabled ? (
                "설정한 선호 조건에 맞는 구역을 먼저 보여드려요"
              ) : (
                <>
                  추천 기능이 비활성화 되었습니다.{" "}
                  <span className="font-semibold">직접 선택</span>
                  합니다.
                </>
              )}
            </div>
          </div>
        </div>

        <Toggle checked={enabled} onCheckedChange={onChange} />
      </div>

      {!enabled && (
        <div className="inline-flex h-8 w-full items-center justify-between">
          <div className="flex items-center justify-center gap-2">
            <div className="text-base font-semibold leading-6 text-[var(--foundation-neutral-black)] font-['Pretendard']">
              인원 수
              <div className="text-xs font-normal leading-4 text-[var(--text-info-n600)] font-['Pretendard']">
                좌석은 <span className="font-semibold">최대 8석</span>{" "}선택할 수 있습니다.
              </div>
            </div>
          </div>
        </div>
      )}


      {enabled && (
        <>
          <div className="inline-flex w-full items-center justify-between">
            <div className="flex items-center justify-center gap-2">
              <div className="text-base font-semibold leading-6 text-[var(--foundation-neutral-240)] font-['Pretendard']">
                인근 좌석 추천
              </div>

              <button
                ref={nearbySeatInfoButtonRef}
                type="button"
                onMouseEnter={() => {
                  updateNearbySeatInfoPosition();
                  setIsNearbySeatInfoOpen(true);
                }}
                onMouseLeave={() => setIsNearbySeatInfoOpen(false)}
                className="relative h-4 w-4 cursor-pointer overflow-visible"
                aria-expanded={isNearbySeatInfoOpen}
                aria-controls="nearby-seat-info"
              >
                <Info className="absolute left-[1.33px] top-[1.33px] h-3.5 w-3.5 text-[var(--text-info-n600)]" />

                {isNearbySeatInfoOpen && (
                  <div
                    id="nearby-seat-info"
                    style={nearbySeatInfoPosition}
                    className="fixed z-50 inline-flex flex-col items-start gap-2 rounded-lg bg-white p-3 text-left shadow-[2px_3px_10px_0px_rgba(0,0,0,0.10)] outline outline-1 outline-offset-[-1px] outline-[var(--stroke-interactive-neutral-default)]"
                  >
                    <div className="text-sm font-semibold leading-5 text-[var(--foundation-neutral-240)] font-['Pretendard']">
                      인근 좌석 추천이란?
                    </div>
                    <ul className="flex list-disc flex-col items-start gap-2 pl-5">
                      <li className="text-sm font-medium leading-5 text-[var(--foundation-neutral-240)] font-['Pretendard']">
                        선택한 인원 수만큼의 연속 좌석(연석)을 우선 배정합니다.
                      </li>
                      <li className="text-sm font-medium leading-5 text-[var(--foundation-neutral-240)] font-['Pretendard']">
                        연석이 없을 경우, 인근 좌석 추천을 켜면 가까운 좌석으로 나누어 배정될 수 있습니다.
                      </li>
                      <li className="inline-flex items-center justify-center gap-2 pl-2.5">
                        <div className="text-sm font-medium leading-5 text-[var(--foundation-indigo-600)] font-['Pretendard']">
                          Ex) 5매 예매 시 3연석 / 2연석
                        </div>
                      </li>
                      <li className="text-sm font-medium leading-5 text-[var(--foundation-neutral-240)] font-['Pretendard']">
                        인근 좌석 추천을 끄면, 연석이 없는 경우 해당 블럭은 추천되지 않습니다.
                      </li>
                      <li className="text-sm font-medium leading-5 text-[var(--foundation-neutral-240)] font-['Pretendard']">
                        허용 거리: 같은 열 1칸 이내, 블럭 내
                      </li>
                    </ul>
                  </div>
                )}
              </button>
            </div>

            <Toggle checked={nearbySeatEnabled} onCheckedChange={onNearbySeatChange} />
          </div>

          <div className="inline-flex w-full items-center justify-between">
            <div className="flex items-center justify-center gap-2">
              <div className="text-base font-semibold leading-6 text-[var(--foundation-neutral-240)] font-['Pretendard']">
                인원 수
              </div>
            </div>

            <DropDown value={people} onChange={onPeopleChange} max={8} />
          </div>

          <div className="inline-flex w-full items-center justify-between">
            <div className="flex items-center justify-center gap-2">
              <div className="text-base font-semibold leading-6 text-[var(--foundation-neutral-240)] font-['Pretendard']">
                선호 구역
              </div>
            </div>

            <SecondaryButton
              size="md"
              tone="base"
              onClick={onPreferredZonesClick}
            >
              설정하기
            </SecondaryButton>
          </div>
        </>
      )}
    </div>
  );
}
