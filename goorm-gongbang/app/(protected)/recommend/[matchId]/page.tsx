"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, RotateCw } from "lucide-react";
import { TicketingNavigator } from "@/components/common/TicketingNavigator";
import { SeatPreferenceRecommendCard } from "@/components/common/SeatPreferenceRecommendCard";
import { SeatRecommendSummaryCard } from "@/components/common/SeatRecommendSummaryCard";
import SelectableSeatMapSvg from "@/components/common/SelectableSeatMapSvg";
import { useRouter, useParams } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const searchParams = useParams();
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isSummaryCardHovered, setIsSummaryCardHovered] = useState(false);
  const [isSummaryCardFocused, setIsSummaryCardFocused] = useState(false);
  const summaryCardVariant = isSummaryCardFocused ? "focused" : isSummaryCardHovered ? "hover" : "default";
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const handleToggleSeat = (id: string) => {
    setSelectedSeatIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const params = useParams();
  const matchId = useMemo(() => {
    const raw = (params as Record<string, string | string[] | undefined>)?.matchId;
    const str = Array.isArray(raw) ? raw[0] : raw;
    const n = str ? Number(str) : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [params]);

  const handleRev = () => {
    if(!matchId) return;
    router.push(`/pay/${matchId}`);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-white">
      {/* Header */}
      <div className="w-full border-b border-[var(--foundation-neutral-880)] bg-white">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 py-4 flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
          <div className="min-w-0 flex items-start sm:items-center gap-3 sm:gap-4">
            <button
              type="button"
              data-rounded="Medium"
              data-size="Large"
              data-status="Default"
              data-stroke="False"
              className="w-10 h-10 rounded-md flex shrink-0 justify-center items-center"
              aria-label="뒤로가기"
            >
              <ChevronLeft
                className="w-6 h-6 text-[var(--foundation-neutral-160)]"
                strokeWidth={1.5}
              />
            </button>

            <div className="min-w-0 flex flex-wrap items-center gap-x-2 gap-y-1 sm:gap-x-3">
              <div className="text-[var(--foundation-neutral-240)] text-sm sm:text-base lg:text-lg font-semibold leading-5 sm:leading-6">
                2026년 3월 29일 (일) 14:00
              </div>

              <div className="text-[var(--foundation-neutral-240)] text-sm sm:text-base lg:text-lg font-semibold leading-5 sm:leading-6">
                LG vs KT
              </div>

              <div className="hidden sm:block text-[var(--foundation-neutral-600)] text-sm sm:text-base leading-5">
                |
              </div>

              <div className="min-w-0 flex items-center gap-2">
                <div
                  data-logo="LG"
                  data-mode="Color"
                  data-size="xsmall"
                  className="w-7 h-7 sm:w-8 sm:h-8 bg-white inline-flex flex-col justify-center items-center overflow-hidden shrink-0"
                >
                  <img
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white object-cover"
                    src="https://goormgb-assets.s3.ap-northeast-2.amazonaws.com/static/clubs/hanwha-eagles.png"
                    alt="logo"
                  />
                </div>

                <div className="min-w-0 text-[var(--foundation-neutral-400)] text-sm sm:text-base font-medium leading-5 sm:leading-6 truncate">
                  잠실종합운동장 잠실야구장
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-auto overflow-x-auto">
            <TicketingNavigator active="seat" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full flex-1">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 pt-4 pb-8 flex flex-col lg:flex-row items-start gap-6 xl:gap-10">
          {/* Seat Map */}
          <div className="w-full flex-1 flex justify-center items-center px-0 sm:px-4 lg:px-6 xl:px-10">
            <div className="w-full max-w-[760px] flex justify-center items-center">
              <SelectableSeatMapSvg/>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-full lg:w-[380px] xl:w-[384px] flex flex-col justify-start items-end gap-6">
            <div className="w-full">
              <SeatPreferenceRecommendCard enabled={enabled} onChange={setEnabled} />
            </div>

            <div className="w-full flex-1 flex flex-col justify-start items-start gap-4">
              <div className="w-full flex flex-col justify-start items-start gap-3">
                <div className="w-full flex flex-col justify-center items-start">
                  <div className="w-full text-[var(--foundation-neutral-240)] text-base sm:text-lg font-semibold leading-6">
                    좌석 추천 리스트
                  </div>
                  <div className="w-full text-[var(--foundation-neutral-600)] text-xs sm:text-sm font-medium leading-5">
                    ※ 일반 회원 · 주중 기준 가격으로 추천된 좌석입니다.
                  </div>
                </div>

                <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      data-status="Selected"
                      className="h-9 px-3 py-1.5 bg-neutral-800 rounded-[100px] outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-center items-center"
                    >
                      <div className="text-white text-xs font-medium leading-4">1순위</div>
                    </button>

                    <button
                      type="button"
                      data-status="Default"
                      className="h-9 px-3 py-1.5 bg-white rounded-[100px] outline outline-1 outline-offset-[-1px] outline-gray-300 flex justify-center items-center"
                    >
                      <div className="text-neutral-800 text-xs font-normal leading-5">2순위</div>
                    </button>

                    <button
                      type="button"
                      data-status="Default"
                      className="h-9 px-3 py-1.5 bg-white rounded-[100px] outline outline-1 outline-offset-[-1px] outline-gray-300 flex justify-center items-center"
                    >
                      <div className="text-neutral-800 text-xs font-normal leading-5">3순위</div>
                    </button>

                    <button
                      type="button"
                      data-status="Default"
                      className="h-9 px-3 py-1.5 bg-white rounded-[100px] outline outline-1 outline-offset-[-1px] outline-gray-300 flex justify-center items-center"
                    >
                      <div className="text-neutral-800 text-xs font-normal leading-5">전체</div>
                    </button>
                  </div>

                  <button
                    type="button"
                    data-status="Default"
                    className="w-9 h-9 bg-[var(--foundation-neutral-white)] rounded-[100px] outline outline-1 outline-offset-[-1px] outline-gray-300 flex justify-center items-center shrink-0"
                    aria-label="새로고침"
                  >
                    <RotateCw
                      className="w-4 h-4 text-[var(--foundation-neutral-240)]"
                      strokeWidth={1.5}
                    />
                  </button>
                </div>
              </div>

              <div className="w-full flex flex-col justify-start items-start gap-3 overflow-hidden">
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      data-2열-이상="True"
                      data-status="loading"
                      className="w-full p-4 sm:p-6 bg-white rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-3 overflow-hidden"
                    >
                      <div className="w-full flex flex-col justify-start items-start gap-1">
                        <div className="w-full h-7 bg-[var(--foundation-neutral-940)] rounded-[50px] animate-pulse" />
                        <div className="w-32 sm:w-40 h-5 bg-[var(--foundation-neutral-940)] rounded-[50px] animate-pulse" />
                      </div>

                      <div className="w-full flex justify-end items-start gap-2 flex-wrap content-start">
                        {Array.from({ length: 4 }).map((_, tagIndex) => (
                          <div
                            key={tagIndex}
                            data-drag="Default"
                            data-icon="off"
                            data-size="Small"
                            data-state="Selected"
                            className="h-6 min-w-14 px-2 bg-gray-100 rounded-[100px] outline outline-1 outline-offset-[-1px] outline-[var(--foundation-neutral-840)] flex justify-center items-center animate-pulse"
                          >
                            <div className="flex-1 text-center text-[var(--foundation-neutral-840)] text-xs font-normal leading-5">
                              # 태그
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <SeatRecommendSummaryCard
                    variant={summaryCardVariant}
                    onMouseEnter={() => setIsSummaryCardHovered(true)}
                    onMouseLeave={() => setIsSummaryCardHovered(false)}
                    onClick={()=> setIsSummaryCardFocused((prev) => !prev)}
                    className="cursor-pointer"
                    totalPriceText="총 0원"
                    seats={[
                      { left: "000석 000블럭 00열 00번, 00번", right: "0원/매" },
                      { left: "000석 000블럭 00열 00번", right: "0원/매" },
                    ]}
                    tags={["# 1루 내야", "# 하단", "# 통로", "# 응원단 바로 앞"]}
                  />
                )}
              </div>
            </div>

            <div className="w-full flex justify-start items-start gap-2">
              <button
                type="button"
                data-size="Large"
                data-state="Default"
                className="flex-1 h-10 min-w-20 px-4 py-2 rounded-md outline outline-1 outline-offset-[-1px] outline-[var(--foundation-primary-500)] flex justify-center items-center"
              >
                <div className="text-[var(--foundation-primary-500)] text-sm sm:text-base font-semibold leading-6">
                  자동선택
                </div>
              </button>

              <button
                type="button"
                onClick={handleRev}
                data-size="Large"
                data-state="Default"
                className="cursor-pointer flex-1 h-10 min-w-20 px-4 py-2 bg-[var(--foundation-primary-500)] rounded-md flex justify-center items-center"
              >
                <div className="text-white text-sm sm:text-base font-semibold leading-6">
                  예매하기
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}