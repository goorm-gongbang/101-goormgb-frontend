"use client";

import * as React from "react";
import { useState } from "react";
import { SeatPreferenceRecommendCard } from "@/components/common/SeatPreferenceRecommendCard"
import { DesiredPriceCard } from "@/components/common/DesiredPriceCard"
import { BookingButton } from "@/components/common/BookingButton";
import { TabButton } from "@/components/common/TabButton";
import { MatchInfoTab } from "@/components/common/match-detail/tabs/MatchInfoTab";
import { MatchRecommendTab } from "@/components/common/match-detail/tabs/MatchRecommendTab";
import { MatchRefundTab } from "@/components/common/match-detail/tabs/MatchRefundTab";

type SeatPriceRow = {
  seatType: string;
  weekday: string;
  weekend: string;
};

type OutfieldPriceRow = {
  groupLabel?: string;
  category: string;
  weekday: string;
  weekend: string;
};

type MatchDetailProps = {
  homeKo: string;
  homeEn: string;
  awayKo: string;
  awayEn: string;
  stadiumKo: string;
  stadiumAddress: string;
  matchAtText: string;
  ageLimitText: string;

  heroBgImageUrl?: string;
  homeLogoUrl?: string;
  awayLogoUrl?: string;

  saleBadgeText?: string;
  dDayText?: string;
};

type SaleBadgeText = "구매 가능" | "매진" | "경기 종료";

type TabKey = "INFO" | "RECOMMEND" | "REFUND";

const DEFAULT_SEAT_PRICES: SeatPriceRow[] = [
  { seatType: "중앙석", weekday: "80,000", weekend: "80,000" },
  { seatType: "테이블석", weekday: "52,000", weekend: "58,000" },
  { seatType: "익사이팅존", weekday: "28,000", weekend: "33,000" },
  { seatType: "블루석", weekday: "22,000", weekend: "24,000" },
  { seatType: "오렌지석(응원석)", weekday: "20,000", weekend: "22,000" },
  { seatType: "레드석", weekday: "17,000", weekend: "19,000" },
  { seatType: "네이비석", weekday: "14,000", weekend: "16,000" },
];

const DEFAULT_OUTFIELD_PRICES: OutfieldPriceRow[] = [
  { groupLabel: "", category: "일반", weekday: "9,000", weekend: "10,000" },
  { groupLabel: "외야 지정석", category: "청소년, 군경", weekday: "7,000", weekend: "8,000" },
  { groupLabel: "", category: "어린이, 유공자, 경로자", weekday: "4,500", weekend: "5,000" },
];

export default function MatchDetailSectionResponsive(props: MatchDetailProps) {
  const {
    homeKo = "LG 트윈스",
    homeEn = "LG TWINS",
    awayKo = "KT 위즈",
    awayEn = "KT WIZ",
    stadiumKo = "잠실종합운동장 잠실야구장",
    stadiumAddress = "서울 송파구 올림픽로 19-2 서울종합운동장",
    matchAtText = "2026년 2월 19일 (목) 23:00",
    ageLimitText = "전체관람가",
    heroBgImageUrl = "https://placehold.co/1440x997",
    homeLogoUrl = "https://placehold.co/190x163",
    awayLogoUrl = "https://placehold.co/190x163",
    saleBadgeText = "구매 가능",
    dDayText = "경기 D-1",
  } = props;

  const SALE_BADGE_STYLE: Record<SaleBadgeText, { wrapper: string; text: string }> = {
    "구매 가능": {
      wrapper:
        "bg-[var(--foundation-red-100)] outline-[var(--foundation-red-400)]",
      text: "text-[var(--foundation-red-500)]",
    },
    "매진": {
      wrapper:
        "bg-[var(--foundation-brown-50)] outline-[var(--foundation-neutral-720)]",
      text: "text-[var(--foundation-neutral-720)]",
    },
    "경기 종료": {
      wrapper:
        "bg-[var(--foundation-neutral-900)] outline-[var(--foundation-neutral-720)]",
      text: "text-[var(--foundation-neutral-720)]",
    },
  };

  const seatPrices = DEFAULT_SEAT_PRICES;
  const outfieldPrices = DEFAULT_OUTFIELD_PRICES;

  const [enabled, setEnabled] = useState(true);
  const [enabledPrice, setEnabledPrice] = useState(true);

  // "2026년 3월 29일 (일) 14:00" 형태 파싱
  function parseMatchAtTextToISO(text: string) {
    const m = text.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일.*?(\d{1,2}):(\d{2})/);
    if (!m) return null;

    const [, y, mo, d, hh, mm] = m;
    const yyyy = Number(y);
    const month = String(Number(mo)).padStart(2, "0");
    const day = String(Number(d)).padStart(2, "0");
    const hour = String(Number(hh)).padStart(2, "0");
    const min = String(Number(mm)).padStart(2, "0");

    // KST(+09:00) 명시 ISO 생성 (사용자 PC 타임존이 달라도 안전)
    return `${yyyy}-${month}-${day}T${hour}:${min}:00+09:00`;
  }

  const matchISO = React.useMemo(() => parseMatchAtTextToISO(matchAtText), [matchAtText]);

  // 경기 시작 시간 Date
  const matchAtDate = React.useMemo(() => (matchISO ? new Date(matchISO) : null), [matchISO]);

  // 99분이 넘어도 99:59로 고정
  const mmssTwoDigitsMinutes = (sec: number) => {
    const s = Math.max(0, sec);
    const mmRaw = Math.floor(s / 60);
    const ss = s % 60;

    const mm = Math.min(mmRaw, 99);

    const ssShown = mmRaw > 99 ? 59 : ss;

    return `${String(mm).padStart(2, "0")} : ${String(ssShown).padStart(2, "0")}`;
  };

  const [activeTab, setActiveTab] = React.useState<TabKey>("INFO");

  return (
    <div className="w-full">
      <section className="relative w-full bg-[var(--background-grey)] overflow-hidden">
        {/* background image */}
        <img
          className="absolute inset-x-0 -top-[300px] sm:-top-[380px] md:-top-[455px] w-full h-[900px] sm:h-[997px] object-cover blur-[2px]"
          src={heroBgImageUrl}
          alt="background"
        />
        <div className="absolute inset-0 opacity-30 bg-black blur-[2px]" />

        {/* content container */}
        <div className="relative w-full">
          <div className="h-[420px] sm:h-96" />

          {/* Home/Away cards */}
          <div className="absolute left-0 right-0 bottom-0 sm:bottom-0">
            <div className="w-full">
              <div className="relative">
                {/* VS  */}
                <div
                  className="
                  absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                  z-20
                  px-2 py-1 rounded-full
                  text-[var(--foundation-neutral-840)] font-normal font-['Pretendard']
                  text-xs sm:text-sm md:text-base
                  pointer-events-none
                "
                >
                  VS
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-0">
                  {/* Home */}
                  <div className="max-w-[1440px] relative bg-[var(--pink-800)]">
                    <div className="h-24 sm:h-28 px-4 sm:px-6 lg:px-10 py-4 bg-[var(--pink-800)] flex items-center">
                      <div className="w-full flex items-center justify-end">
                        <div className="flex items-center gap-3 sm:gap-10 md:gap-20 lg:gap-30 min-w-0">
                          {/* Logo */}
                          <div className="shrink-0 mr-1 sm:mr-2 -translate-y-1 sm:-translate-y-2 md:-translate-y-19">
                            <img
                              className="w-12 h-12 sm:w-20 sm:h-20 md:w-30 md:h-30 object-contain"
                              src={homeLogoUrl}
                              alt="home logo"
                            />
                          </div>

                          {/* Text */}
                          <div className="min-w-0 flex flex-col items-end">
                            <div className="text-right text-[var(--foundation-neutral-940)] text-base font-medium font-['Pretendard'] leading-6">
                              홈
                            </div>

                            <div className="min-w-0 truncate text-[var(--foundation-neutral-white)] text-2xl sm:text-3xl font-semibold font-['Pretendard'] leading-9 sm:leading-10">
                              {homeKo}
                            </div>

                            <div className="min-w-0 truncate text-right text-[var(--foundation-neutral-840)] text-xs font-normal font-['Pretendard'] leading-4">
                              {homeEn}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Away */}
                  <div className="relative bg-black">
                    <div className="h-24 sm:h-28 px-4 sm:px-6 lg:px-10 py-4 bg-black flex items-center">
                      <div className="w-full flex items-center justify-start">
                        <div className="flex items-center gap-3 sm:gap-10 md:gap-20 lg:gap-30 min-w-0">
                          {/* Text */}
                          <div className="min-w-0 flex flex-col items-start">
                            <div className="text-left text-[var(--foundation-neutral-940)] text-base font-medium font-['Pretendard'] leading-6">
                              어웨이
                            </div>

                            <div className="min-w-0 truncate text-[var(--foundation-neutral-white)] text-2xl sm:text-3xl font-semibold font-['Pretendard'] leading-9 sm:leading-10">
                              {awayKo}
                            </div>

                            <div className="min-w-0 truncate text-left text-[var(--foundation-neutral-840)] text-xs font-normal font-['Pretendard'] leading-4">
                              {awayEn}
                            </div>
                          </div>

                          {/* Logo */}
                          <div className="shrink-0 ml-1 sm:ml-2 -translate-y-1 sm:-translate-y-2 md:-translate-y-19">
                            <img
                              className="w-12 h-12 sm:w-20 sm:h-20 md:w-30 md:h-30 object-contain"
                              src={awayLogoUrl}
                              alt="away logo"
                            />
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>


                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Body ===== */}
      <section className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-28 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,720px)_minmax(0,360px)] gap-6 lg:gap-10 items-start">
          {/* Left */}
          <div className="min-w-0 flex flex-col gap-4">
            {/* Tabs */}
            <div className="border-b border-[var(--foundation-neutral-720)] flex items-center gap-2">
              <TabButton
                active={activeTab === "INFO"}
                onClick={() => setActiveTab("INFO")}
                label="경기 안내"
              />
              <TabButton
                active={activeTab === "RECOMMEND"}
                onClick={() => setActiveTab("RECOMMEND")}
                label="추천좌석 안내"
              />
              <TabButton
                active={activeTab === "REFUND"}
                onClick={() => setActiveTab("REFUND")}
                label="취소/환불"
              />
            </div>

            {/* Info */}
            {activeTab === "INFO" && (
              <MatchInfoTab
                homeKo={homeKo}
                awayKo={awayKo}
                ageLimitText={ageLimitText}
                stadiumKo={stadiumKo}
                stadiumAddress={stadiumAddress}
                matchAtText={matchAtText}
                seatPrices={seatPrices}
                outfieldPrices={outfieldPrices}
              />
            )}

            {/* 추천죄석 안내 */}
            {activeTab === "RECOMMEND" && (
              <MatchRecommendTab />
            )}

            {/* 취소/환불 */}
            {activeTab === "REFUND" && (
              <MatchRefundTab />
            )}

          </div>

          {/* Right (sticky on desktop) */}
          <aside className="lg:sticky lg:top-6">
            <div className="w-full bg-[var(--background-white)] rounded-2xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-[var(--stroke-interactive-neutral-default)]">
              <div className="p-4 sm:p-6 flex flex-col items-center gap-3.5">
                <div className="w-full flex flex-col gap-6">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-full flex items-center gap-3">
                        {saleBadgeText &&
                          (saleBadgeText === "구매 가능" ||
                            saleBadgeText === "매진" ||
                            saleBadgeText === "경기 종료") && (() => {
                              const s = SALE_BADGE_STYLE[saleBadgeText];
                              return (
                                <div
                                  className={[
                                    "h-6 px-2 rounded-[100px] outline outline-1 outline-offset-[-1px] flex items-center",
                                    s.wrapper,
                                  ].join(" ")}
                                >
                                  <div
                                    className={[
                                      "text-xs font-semibold font-['Pretendard'] leading-4",
                                      s.text,
                                    ].join(" ")}
                                  >
                                    {saleBadgeText}
                                  </div>
                                </div>
                              );
                            })()}
                        <div className="text-[var(--foundation-red-500)] text-sm font-semibold font-['Pretendard'] leading-5">
                          {dDayText}
                        </div>
                      </div>

                      <div className="w-full text-[var(--text-normal-n240)] text-lg sm:text-xl font-medium font-['Pretendard'] leading-7 sm:leading-8">
                        {homeKo} vs {awayKo}
                      </div>
                    </div>

                    <div className="text-[var(--text-info-n600)] text-sm font-normal font-['Pretendard'] leading-5">
                      일시 : {matchAtText} <br />
                      장소 : {stadiumAddress}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="h-0 outline outline-1 outline-offset-[-0.50px] outline-[var(--foundation-neutral-900)]" />

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-3.5">
                        <SeatPreferenceRecommendCard
                          enabled={enabled}
                          onChange={setEnabled}
                        />
                      </div>
                    </div>

                    {/* slider block */}
                    <DesiredPriceCard
                      enabled={enabledPrice}
                      onChange={setEnabledPrice}
                    />
                  </div>
                </div>

                <div className="w-full">
                  <BookingButton
                    saleAt={matchAtDate}
                    disabled={saleBadgeText === "매진" || saleBadgeText === "경기 종료"}
                    disabledReason={saleBadgeText === "매진" ? "SOLD_OUT" : saleBadgeText === "경기 종료" ? "ENDED" : "ETC"}
                    countdownFormatter={mmssTwoDigitsMinutes}
                    onClick={() => console.log("예매하기!")}
                  />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}