"use client";

/* ===========================
   메인 페이지 (/)
=========================== */
import { TodayInitSelectableDateStrip } from "@/components/common/TodayInitSelectableDateStrip";
import { MatchCard } from "@/components/common/MatchCard";
import { IconPreview } from "@/components/common/IconPreview";
import { TeamInfoCard } from "@/components/common/TeamInfoCard";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="w-full">
      <main className="w-full">
        {/* Root container (1440) */}
        <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-12">
          <section className="w-full flex flex-col gap-1">
            {/* 섹션 타이틀 */}
            <div className="w-full flex justify-center">
              <div className="w-full max-w-[1088px] h-20 py-2.5 flex flex-col justify-center items-start">
                <div className="w-full text-left text-[var(--foundation-primary-500)] text-xs font-semibold font-['Pretendard'] leading-4">
                  Game Schedules
                </div>
                <div className="w-full text-left text-[var(--foundation-neutral-20)] text-xl font-medium font-['Pretendard'] leading-8">
                  일정별 경기
                </div>
              </div>
            </div>

            {/* 달력 + count + cards */}
            <div className="w-full flex flex-col items-center gap-4">
              {/* Date strip wrapper */}
              <div className="w-full flex flex-col items-center gap-3">
                <div className="w-full max-w-[1088px] flex flex-col items-center gap-3">
                  <TodayInitSelectableDateStrip
                    onChange={(date) => {
                      console.log("선택된 날짜:", date);
                    }}
                  />
                </div>
              </div>

              {/* count text */}
              <div className="w-full max-w-[1088px]">
                <div className="w-full text-left text-[var(--foundation-primary-500)] text-sm font-medium font-['Pretendard'] leading-5">
                  3월 28일은 총 5개의 경기가 있습니다.
                </div>
              </div>

              {/* MatchCard list */}
              <div className="w-full flex flex-col items-center gap-3">
                <div className="w-full max-w-[1074px]">
                  <MatchCard
                    elevated
                    withOutline
                    dateText="3월 28일"
                    timeText="토 · 14 : 00"
                    stadiumKo="대구 삼성 라이온즈 파크"
                    stadiumEn="Deagu Samsung Lions Park"
                    away={{
                      ko: "SSG 랜더스",
                      en: "SSG LANDERS",
                      dataLogo: "SSG",
                      logo: <IconPreview index={2} size="md" />,
                    }}
                    home={{
                      ko: "기아 타이거즈",
                      en: "KIA TIGERS",
                      dataLogo: "기아",
                      logo: <IconPreview index={3} size="md" />,
                    }}
                  />
                </div>

                <div className="w-full max-w-[1074px]">
                  <MatchCard
                    dateText="3월 28일"
                    timeText="토 · 14 : 00"
                    stadiumKo="대구 삼성 라이온즈 파크"
                    stadiumEn="Deagu Samsung Lions Park"
                    away={{
                      ko: "SSG 랜더스",
                      en: "SSG LANDERS",
                      dataLogo: "SSG",
                      logo: <IconPreview index={0} size="md" />,
                    }}
                    home={{
                      ko: "기아 타이거즈",
                      en: "KIA TIGERS",
                      dataLogo: "기아",
                      logo: <IconPreview index={1} size="md" />,
                    }}
                  />
                </div>

                <div className="w-full max-w-[1074px]">
                  <MatchCard
                    dateText="3월 28일"
                    timeText="토 · 14 : 00"
                    stadiumKo="대구 삼성 라이온즈 파크"
                    stadiumEn="Deagu Samsung Lions Park"
                    away={{
                      ko: "SSG 랜더스",
                      en: "SSG LANDERS",
                      dataLogo: "SSG",
                      logo: <IconPreview index={0} size="md" />,
                    }}
                    home={{
                      ko: "기아 타이거즈",
                      en: "KIA TIGERS",
                      dataLogo: "기아",
                      logo: <IconPreview index={1} size="md" />,
                    }}
                  />
                </div>

                <div className="w-full max-w-[1074px]">
                  <MatchCard
                    variant="comingSoon"
                    dateText="3월 28일"
                    timeText="토 · 14 : 00"
                    stadiumKo="대구 삼성 라이온즈 파크"
                    stadiumEn="Deagu Samsung Lions Park"
                    away={{
                      ko: "SSG 랜더스",
                      en: "SSG LANDERS",
                      dataLogo: "SSG",
                      logo: <IconPreview index={4} size="md" />,
                    }}
                    home={{
                      ko: "기아 타이거즈",
                      en: "KIA TIGERS",
                      dataLogo: "기아",
                      logo: <IconPreview index={5} size="md" />,
                    }}
                    overlayTopText="Coming Soon"
                    overlayMainText="3월 21일 16:00 오픈"
                  />
                </div>

                <div className="w-full max-w-[1074px]">
                  <MatchCard
                    variant="soldOut"
                    dateText="3월 28일"
                    timeText="토 · 14 : 00"
                    stadiumKo="대구 삼성 라이온즈 파크"
                    stadiumEn="Deagu Samsung Lions Park"
                    away={{
                      ko: "SSG 랜더스",
                      en: "SSG LANDERS",
                      dataLogo: "SSG",
                      logo: <IconPreview index={8} size="md" />,
                    }}
                    home={{
                      ko: "기아 타이거즈",
                      en: "KIA TIGERS",
                      dataLogo: "기아",
                      logo: <IconPreview index={9} size="md" />,
                    }}
                    overlayTopText="Sold Out"
                    overlayMainText="예매 마감"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ===========================
              Team Info Section (full-bleed bg + inner padding)
          =========================== */}
          <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-[var(--background-grey)] pb-48">
            <div className="px-4 sm:px-8 md:px-12 lg:px-18 xl:px-26 2xl:px-[180px]">
              <div className="w-full max-w-[1440px] mx-auto">
                {/* 섹션 타이틀 */}
                <div className="w-full flex justify-center">
                  <div className="w-full max-w-[1088px] h-20 py-2.5 flex flex-col justify-center items-start">
                    <div className="w-full text-left text-[var(--foundation-primary-500)] text-xs font-semibold font-['Pretendard'] leading-4">
                      Team Info
                    </div>
                    <div className="w-full text-left text-[var(--foundation-neutral-20)] text-xl font-medium font-['Pretendard'] leading-8">
                      구단 상세
                    </div>
                  </div>
                </div>

                {/* grid */}
                <div className="w-full flex justify-center mt-6">
                  <div
                    className={cn(
                      "w-full max-w-[1088px]",
                      "grid gap-3.5",
                      "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5"
                    )}
                  >
                    <TeamInfoCard dataLogo="두산" teamName="두산 베어스" logo={<IconPreview index={7} size="md" />} />
                    <TeamInfoCard dataLogo="삼성" teamName="삼성 라이온즈" logo={<IconPreview index={0} size="md" />} />
                    <TeamInfoCard dataLogo="키움" teamName="키움 히어로즈" logo={<IconPreview index={1} size="md" />} />
                    <TeamInfoCard dataLogo="한화" teamName="한화 이글스" logo={<IconPreview index={2} size="md" />} />
                    <TeamInfoCard dataLogo="롯데" teamName="롯데 자이언츠" logo={<IconPreview index={3} size="md" />} />

                    <TeamInfoCard dataLogo="LG" teamName="LG 트윈스" logo={<IconPreview index={4} size="md" />} />
                    <TeamInfoCard dataLogo="NC" teamName="NC 다이노즈" logo={<IconPreview index={5} size="md" />} />
                    <TeamInfoCard dataLogo="SSG" teamName="SSG 랜더스" logo={<IconPreview index={6} size="md" />} />
                    <TeamInfoCard dataLogo="KT" teamName="KT 위즈" logo={<IconPreview index={8} size="md" />} />
                    <TeamInfoCard dataLogo="KIA" teamName="KIA 타이거즈" logo={<IconPreview index={9} size="md" />} />
                  </div>
                </div>
              </div>
            </div>
          </section>
          
        </div>
      </main>
    </div>
  );
}
