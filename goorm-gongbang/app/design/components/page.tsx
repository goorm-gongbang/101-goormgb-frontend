"use client";
import * as React from "react";
import { useState } from "react";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { SecondaryButton } from "@/components/common/SecondaryButton";
import { TertiaryButton } from "@/components/common/TertiaryButton";
import { PrimaryButtonWithIcon, SecondaryButtonWithIcon, TertiaryButtonWithIcon } from "@/components/common/ButtonWithIcon";
import { Plus, MapPin } from "lucide-react";
import { DestructiveButton } from "@/components/common/ButtonDestructive";
import { KakaoButton } from "@/components/login/KakaoButton";
import { GoogleButton } from "@/components/login/GoogleButton";
import { ButtonSpinner } from "@/components/common/ButtonLoading";
import { Toggle } from "@/components/common/Toggle";
import { ChipButton } from "@/components/common/ChipButton";
import { UiCheckbox } from "@/components/common/UiCheckbox";
import { RankChipButton } from "@/components/common/RankChipButton";
import { TicketingNavigator } from "@/components/common/TicketingNavigator";
import { ChipBlackButton } from "@/components/common/ChipBlackButton";
import { ButtonReload } from "@/components/common/ButtonReload";
import { SeatPreferenceRecommendCard } from "@/components/common/SeatPreferenceRecommendCard"
import { ChipDropButton } from "@/components/common/ChipDropButton"
import { DropDown } from "@/components/common/DropDown"
import { Header } from "@/components/layout/Header"
import { SeatRecommendSummaryCard } from "@/components/common/SeatRecommendSummaryCard"
import { IconPreview } from "@/components/common/IconPreview"
import { MatchCard } from "@/components/common/MatchCard";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarDays, ChevronDown } from "lucide-react";
import { TodayInitSelectableDateStrip } from "@/components/common/TodayInitSelectableDateStrip";
import { TeamInfoCard } from "@/components/common/TeamInfoCard";

function ToneRow({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">{title}</span>
        <div className="h-px flex-1 bg-[var(--foundation-neutral-200, #e5e7eb)]" />
      </div>
      <div className="flex flex-wrap items-center gap-3 rounded-lg border p-4">
        {children}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold">{title}</h2>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export default function Components() {
  const [enabled, setEnabled] = useState(true);
  const [people, setPeople] = useState(2);
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [open, setOpen] = React.useState(false);

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold">Buttons Preview</h1>
        <p className="text-sm text-muted-foreground">
          버튼의 tone & size 상태를 한 화면에서 확인합니다.
        </p>
      </div>

      {/* Primary */}
      <Section title="Primary Button">
        <ToneRow title="Strong">
          <PrimaryButton uiSize="lg" tone="strong">LG</PrimaryButton>
          <PrimaryButton uiSize="md" tone="strong">MD</PrimaryButton>
          <PrimaryButton uiSize="sm" tone="strong">SM</PrimaryButton>

          <div className="mx-2 h-8 w-px bg-border" />

          <PrimaryButton uiSize="lg" tone="strong" disabled>LG Disabled</PrimaryButton>
          <PrimaryButton uiSize="md" tone="strong" disabled>MD Disabled</PrimaryButton>
          <PrimaryButton uiSize="sm" tone="strong" disabled>SM Disabled</PrimaryButton>
        </ToneRow>

        <ToneRow title="Base">
          <PrimaryButton uiSize="lg" tone="base">LG</PrimaryButton>
          <PrimaryButton uiSize="md" tone="base">MD</PrimaryButton>
          <PrimaryButton uiSize="sm" tone="base">SM</PrimaryButton>

          <div className="mx-2 h-8 w-px bg-border" />

          <PrimaryButton uiSize="lg" tone="base" disabled>LG Disabled</PrimaryButton>
          <PrimaryButton uiSize="md" tone="base" disabled>MD Disabled</PrimaryButton>
          <PrimaryButton uiSize="sm" tone="base" disabled>SM Disabled</PrimaryButton>
        </ToneRow>

        <ToneRow title="Soft">
          <PrimaryButton uiSize="lg" tone="soft">LG</PrimaryButton>
          <PrimaryButton uiSize="md" tone="soft">MD</PrimaryButton>
          <PrimaryButton uiSize="sm" tone="soft">SM</PrimaryButton>

          <div className="mx-2 h-8 w-px bg-border" />

          <PrimaryButton uiSize="lg" tone="soft" disabled>LG Disabled</PrimaryButton>
          <PrimaryButton uiSize="md" tone="soft" disabled>MD Disabled</PrimaryButton>
          <PrimaryButton uiSize="sm" tone="soft" disabled>SM Disabled</PrimaryButton>
        </ToneRow>
      </Section>

      {/* Secondary */}
      <Section title="Secondary Button">
        <ToneRow title="Strong">
          <SecondaryButton uiSize="lg" tone="strong">LG</SecondaryButton>
          <SecondaryButton uiSize="md" tone="strong">MD</SecondaryButton>
          <SecondaryButton uiSize="sm" tone="strong">SM</SecondaryButton>

          <div className="mx-2 h-8 w-px bg-border" />

          <SecondaryButton uiSize="lg" tone="strong" disabled>LG Disabled</SecondaryButton>
          <SecondaryButton uiSize="md" tone="strong" disabled>MD Disabled</SecondaryButton>
          <SecondaryButton uiSize="sm" tone="strong" disabled>SM Disabled</SecondaryButton>
        </ToneRow>

        <ToneRow title="Base">
          <SecondaryButton uiSize="lg" tone="base">LG</SecondaryButton>
          <SecondaryButton uiSize="md" tone="base">MD</SecondaryButton>
          <SecondaryButton uiSize="sm" tone="base">SM</SecondaryButton>

          <div className="mx-2 h-8 w-px bg-border" />

          <SecondaryButton uiSize="lg" tone="base" disabled>LG Disabled</SecondaryButton>
          <SecondaryButton uiSize="md" tone="base" disabled>MD Disabled</SecondaryButton>
          <SecondaryButton uiSize="sm" tone="base" disabled>SM Disabled</SecondaryButton>
        </ToneRow>

        <ToneRow title="Soft">
          <SecondaryButton uiSize="lg" tone="soft">LG</SecondaryButton>
          <SecondaryButton uiSize="md" tone="soft">MD</SecondaryButton>
          <SecondaryButton uiSize="sm" tone="soft">SM</SecondaryButton>

          <div className="mx-2 h-8 w-px bg-border" />

          <SecondaryButton uiSize="lg" tone="soft" disabled>LG Disabled</SecondaryButton>
          <SecondaryButton uiSize="md" tone="soft" disabled>MD Disabled</SecondaryButton>
          <SecondaryButton uiSize="sm" tone="soft" disabled>SM Disabled</SecondaryButton>
        </ToneRow>
      </Section>

      {/* Tertiary */}
      <Section title="Tertiary Button">
        <ToneRow title="Strong">
          <TertiaryButton uiSize="lg" tone="strong">LG</TertiaryButton>
          <TertiaryButton uiSize="md" tone="strong">MD</TertiaryButton>
          <TertiaryButton uiSize="sm" tone="strong">SM</TertiaryButton>

          <div className="mx-2 h-8 w-px bg-border" />

          <TertiaryButton uiSize="lg" tone="strong" disabled>LG Disabled</TertiaryButton>
          <TertiaryButton uiSize="md" tone="strong" disabled>MD Disabled</TertiaryButton>
          <TertiaryButton uiSize="sm" tone="strong" disabled>SM Disabled</TertiaryButton>
        </ToneRow>

        <ToneRow title="Base">
          <TertiaryButton uiSize="lg" tone="base">LG</TertiaryButton>
          <TertiaryButton uiSize="md" tone="base">MD</TertiaryButton>
          <TertiaryButton uiSize="sm" tone="base">SM</TertiaryButton>

          <div className="mx-2 h-8 w-px bg-border" />

          <TertiaryButton uiSize="lg" tone="base" disabled>LG Disabled</TertiaryButton>
          <TertiaryButton uiSize="md" tone="base" disabled>MD Disabled</TertiaryButton>
          <TertiaryButton uiSize="sm" tone="base" disabled>SM Disabled</TertiaryButton>
        </ToneRow>

        <ToneRow title="Soft">
          <TertiaryButton uiSize="lg" tone="soft">LG</TertiaryButton>
          <TertiaryButton uiSize="md" tone="soft">MD</TertiaryButton>
          <TertiaryButton uiSize="sm" tone="soft">SM</TertiaryButton>

          <div className="mx-2 h-8 w-px bg-border" />

          <TertiaryButton uiSize="lg" tone="soft" disabled>LG Disabled</TertiaryButton>
          <TertiaryButton uiSize="md" tone="soft" disabled>MD Disabled</TertiaryButton>
          <TertiaryButton uiSize="sm" tone="soft" disabled>SM Disabled</TertiaryButton>
        </ToneRow>
      </Section>

      {/* Button with icon */}
      <Section title="Button with icon">
        {/* Primary */}
        <ToneRow title="Primary / Strong">
          <PrimaryButtonWithIcon
            tone="strong"
            leftIcon={<Plus className="h-full w-full" />}
          >
            Strong
          </PrimaryButtonWithIcon>

          <div className="mx-2 h-8 w-px bg-border" />

          <PrimaryButtonWithIcon
            tone="strong"
            disabled
            leftIcon={<Plus className="h-full w-full" />}
          >
            Strong Disabled
          </PrimaryButtonWithIcon>
        </ToneRow>

        <ToneRow title="Primary / Base">
          <PrimaryButtonWithIcon
            tone="base"
            leftIcon={<Plus className="h-full w-full" />}
          >
            Base
          </PrimaryButtonWithIcon>

          <div className="mx-2 h-8 w-px bg-border" />

          <PrimaryButtonWithIcon
            tone="base"
            disabled
            leftIcon={<Plus className="h-full w-full" />}
          >
            Base Disabled
          </PrimaryButtonWithIcon>
        </ToneRow>

        <ToneRow title="Primary / Soft">
          <PrimaryButtonWithIcon
            tone="soft"
            leftIcon={<Plus className="h-full w-full" />}
          >
            Soft
          </PrimaryButtonWithIcon>

          <div className="mx-2 h-8 w-px bg-border" />

          <PrimaryButtonWithIcon
            tone="soft"
            disabled
            leftIcon={<Plus className="h-full w-full" />}
          >
            Soft Disabled
          </PrimaryButtonWithIcon>
        </ToneRow>

        {/* Secondary */}
        <ToneRow title="Secondary / Strong">
          <SecondaryButtonWithIcon
            tone="strong"
            leftIcon={<Plus className="h-full w-full" />}
          >
            Strong
          </SecondaryButtonWithIcon>

          <div className="mx-2 h-8 w-px bg-border" />

          <SecondaryButtonWithIcon
            tone="strong"
            disabled
            leftIcon={<Plus className="h-full w-full" />}
          >
            Strong Disabled
          </SecondaryButtonWithIcon>
        </ToneRow>

        <ToneRow title="Secondary / Base">
          <SecondaryButtonWithIcon
            tone="base"
            leftIcon={<Plus className="h-full w-full" />}
          >
            Base
          </SecondaryButtonWithIcon>

          <div className="mx-2 h-8 w-px bg-border" />

          <SecondaryButtonWithIcon
            tone="base"
            disabled
            leftIcon={<Plus className="h-full w-full" />}
          >
            Base Disabled
          </SecondaryButtonWithIcon>
        </ToneRow>

        <ToneRow title="Secondary / Soft">
          <SecondaryButtonWithIcon
            tone="soft"
            leftIcon={<Plus className="h-full w-full" />}
          >
            Soft
          </SecondaryButtonWithIcon>

          <div className="mx-2 h-8 w-px bg-border" />

          <SecondaryButtonWithIcon
            tone="soft"
            disabled
            leftIcon={<Plus className="h-full w-full" />}
          >
            Soft Disabled
          </SecondaryButtonWithIcon>
        </ToneRow>

        {/* Tertiary */}
        <ToneRow title="Tertiary / Strong">
          <TertiaryButtonWithIcon
            tone="strong"
            leftIcon={<Plus className="h-full w-full" />}
          >
            Strong
          </TertiaryButtonWithIcon>

          <div className="mx-2 h-8 w-px bg-border" />

          <TertiaryButtonWithIcon
            tone="strong"
            disabled
            leftIcon={<Plus className="h-full w-full" />}
          >
            Strong Disabled
          </TertiaryButtonWithIcon>
        </ToneRow>

        <ToneRow title="Tertiary / Base">
          <TertiaryButtonWithIcon
            tone="base"
            leftIcon={<Plus className="h-full w-full" />}
          >
            Base
          </TertiaryButtonWithIcon>

          <div className="mx-2 h-8 w-px bg-border" />

          <TertiaryButtonWithIcon
            tone="base"
            disabled
            leftIcon={<Plus className="h-full w-full" />}
          >
            Base Disabled
          </TertiaryButtonWithIcon>
        </ToneRow>

        <ToneRow title="Tertiary / Soft">
          <TertiaryButtonWithIcon
            tone="soft"
            leftIcon={<Plus className="h-full w-full" />}
          >
            Soft
          </TertiaryButtonWithIcon>

          <div className="mx-2 h-8 w-px bg-border" />

          <TertiaryButtonWithIcon
            tone="soft"
            disabled
            leftIcon={<Plus className="h-full w-full" />}
          >
            Soft Disabled
          </TertiaryButtonWithIcon>
        </ToneRow>
      </Section>

      {/* Button Destructive */}
      <Section title="Button Destructive">
        <ToneRow title="Base">
          <DestructiveButton tone="base">취소하기</DestructiveButton>
        </ToneRow>

        <ToneRow title="Strong">
          <DestructiveButton tone="strong">취소하기</DestructiveButton>
        </ToneRow>

        <ToneRow title="Soft">
          <DestructiveButton tone="soft">취소하기</DestructiveButton>
        </ToneRow>

        <ToneRow title="Lighter">
          <DestructiveButton tone="lighter">취소하기</DestructiveButton>
        </ToneRow>
      </Section>

      {/* Login Button */}
      <Section title="Login Button">
        <ToneRow title="kakao">
          <KakaoButton bgVariant="kakao" contentPadding="20" />
          <KakaoButton bgVariant="kakao" contentPadding="6" />
          <KakaoButton bgVariant="yellow" contentPadding="20" />
          <KakaoButton bgVariant="yellow" contentPadding="6" />
        </ToneRow>
        <ToneRow title="google">
          <GoogleButton fixedWidth="w-80" theme="light" />
          <GoogleButton fixedWidth="w-52" theme="light" />
          <GoogleButton fixedWidth="w-80" theme="dark" />
          <GoogleButton fixedWidth="w-52" theme="dark" />
        </ToneRow>
      </Section>

      {/* Button Loading */}
      <Section title="Button Loading">
        <ToneRow title="Button Loading">
          <ButtonSpinner />
        </ToneRow>
      </Section>

      {/* Toggle */}
      <Section title="Toggle">
        <ToneRow title="Toggle">
          <Toggle />
        </ToneRow>
      </Section>

      {/* Chip Button */}
      <Section title="Chip Button">
        <ToneRow title="Strong">
          <ChipButton uiSize="lg" tone="strong">LG</ChipButton>
          <ChipButton uiSize="md" tone="strong">MD</ChipButton>
          <ChipButton uiSize="sm" tone="strong">SM</ChipButton>

          <div className="mx-2 h-8 w-px bg-border" />

          <ChipButton uiSize="lg" tone="strong" disabled>LG Disabled</ChipButton>
          <ChipButton uiSize="md" tone="strong" disabled>MD Disabled</ChipButton>
          <ChipButton uiSize="sm" tone="strong" disabled>SM Disabled</ChipButton>
        </ToneRow>

        <ToneRow title="Base">
          <ChipButton uiSize="lg" tone="base">LG</ChipButton>
          <ChipButton uiSize="md" tone="base">MD</ChipButton>
          <ChipButton uiSize="sm" tone="base">SM</ChipButton>

          <div className="mx-2 h-8 w-px bg-border" />

          <ChipButton uiSize="lg" tone="base" disabled>LG Disabled</ChipButton>
          <ChipButton uiSize="md" tone="base" disabled>MD Disabled</ChipButton>
          <ChipButton uiSize="sm" tone="base" disabled>SM Disabled</ChipButton>
        </ToneRow>

        <ToneRow title="Soft">
          <ChipButton uiSize="lg" tone="soft">LG</ChipButton>
          <ChipButton uiSize="md" tone="soft">MD</ChipButton>
          <ChipButton uiSize="sm" tone="soft">SM</ChipButton>

          <div className="mx-2 h-8 w-px bg-border" />

          <ChipButton uiSize="lg" tone="soft" disabled>LG Disabled</ChipButton>
          <ChipButton uiSize="md" tone="soft" disabled>MD Disabled</ChipButton>
          <ChipButton uiSize="sm" tone="soft" disabled>SM Disabled</ChipButton>
        </ToneRow>
        <ToneRow title="chipButton">
          <ChipButton tone="strong" uiSize="lg" leftIcon={<Plus size={16} />}>추가</ChipButton>
          <ChipButton tone="strong" uiSize="md" leftIcon={<Plus size={16} />}>추가</ChipButton>
          <ChipButton tone="strong" uiSize="sm" leftIcon={<Plus size={16} />}>추가</ChipButton>
          <ChipButton tone="strong" uiSize="lg" disabled leftIcon={<Plus size={16} />}>추가</ChipButton>

          <ChipButton tone="base" uiSize="lg" leftIcon={<Plus size={16} />}>추가</ChipButton>
          <ChipButton tone="base" uiSize="md" leftIcon={<Plus size={16} />}>추가</ChipButton>
          <ChipButton tone="base" uiSize="sm" leftIcon={<Plus size={16} />}>추가</ChipButton>
          <ChipButton tone="base" uiSize="lg" disabled leftIcon={<Plus size={16} />}>추가</ChipButton>

          <ChipButton tone="soft" uiSize="lg" leftIcon={<Plus size={16} />}>추가</ChipButton>
          <ChipButton tone="soft" uiSize="md" leftIcon={<Plus size={16} />}>추가</ChipButton>
          <ChipButton tone="soft" uiSize="sm" leftIcon={<Plus size={16} />}>추가</ChipButton>
          <ChipButton tone="soft" uiSize="lg" disabled leftIcon={<Plus size={16} />}>추가</ChipButton>
        </ToneRow>
      </Section>

      {/* Checkbox */}
      <Section title="Checkbox">
        <ToneRow title="Checkbox">
          <UiCheckbox />
        </ToneRow>
      </Section>

      {/* Rank Chip Button */}
      <Section title="Rank Chip Button">
        <ToneRow title="Rank Chip Button">
          <RankChipButton rank={1} />
          <RankChipButton rank={2} />
          <RankChipButton rank={3} />
          <RankChipButton rank={4} />
          <RankChipButton rank={5} />
        </ToneRow>
      </Section>

      {/* Ticket Navigator */}
      <Section title="Ticket Navigator">
        <ToneRow title="Ticket Navigator">
          <TicketingNavigator active="seat" /> <br />
          <TicketingNavigator active="order" /> <br />
          <TicketingNavigator active="pay" />
        </ToneRow>
      </Section>

      {/* Chip Black Button */}
      <Section title="Chip Black Button">
        <ToneRow title="Chip Black Button">
          <ChipBlackButton variant="outlineStrong">Button</ChipBlackButton>
          <ChipBlackButton variant="outline">Button</ChipBlackButton>
          <ChipBlackButton variant="filled">Button</ChipBlackButton>
          <ChipBlackButton variant="dark">Button</ChipBlackButton>
        </ToneRow>
      </Section>

      {/* Reload Button */}
      <Section title="Reload Button">
        <ToneRow title="Reload Button">
          <ButtonReload state="default" />
          <ButtonReload state="hover" />
          <ButtonReload state="pressed" />
        </ToneRow>
      </Section>

      {/* DropButton */}
      <Section title="DropButton">
        <ToneRow title="DropButton">
          <DropDown value={people} onChange={setPeople} max={5} />
        </ToneRow>
      </Section>

      {/* SeatPreferenceRecommendCard */}
      <Section title="SeatPreferenceRecommendCard">
        <ToneRow title="SeatPreferenceRecommendCard">
          <SeatPreferenceRecommendCard
            enabled={enabled}
            onChange={setEnabled}
          />
        </ToneRow>
      </Section>

      {/* ChipDropButton */}
      <Section title="ChipDropButton">
        <ToneRow title="ChipDropButton">

          <ChipDropButton label="버튼" variant="neutral" uiState="default" />
          <ChipDropButton label="버튼" variant="neutral" uiState="default" leftIcon={<MapPin />} />

          <ChipDropButton label="버튼" variant="primary" uiState="default" />
          <ChipDropButton label="버튼" variant="primary" uiState="default" leftIcon={<MapPin />} />

          <ChipDropButton label="버튼" variant="neutral" uiState="hover" />
          <ChipDropButton label="버튼" variant="neutral" uiState="hover" leftIcon={<MapPin />} />

          <ChipDropButton label="버튼" uiState="disabled" />
          <ChipDropButton label="버튼" uiState="disabled" leftIcon={<MapPin />} />

        </ToneRow>
      </Section>

      <Section title="Header">
        <ToneRow title="Header">
          <Header />
          <Header
            loggedIn={loggedIn}
            onLoginClick={() => setLoggedIn(true)}
            onMyInfoClick={() => console.log("내 정보")}
            onMyTicketClick={() => console.log("내 티켓")}
          />
        </ToneRow>
      </Section>

      <Section title="SeatRecommendSummaryCard">
        <ToneRow title="SeatRecommendSummaryCard">
          <SeatRecommendSummaryCard
            variant="default"
            totalPriceText="총 0원"
            seats={[
              { left: "000석 000블럭 00열 00번, 00번", right: "0원/매" },
              { left: "000석 000블럭 00열 00번", right: "0원/매" },
            ]}
            tags={["# 1루 내야", "# 하단", "# 통로", "# 응원단 바로 앞"]}
          />

          <SeatRecommendSummaryCard
            variant="hover"
            totalPriceText="총 0원"
            seats={[{ left: "000석 000블럭 00열 00번", right: "0원/매" }]}
            tags={["# 1루 내야", "# 하단", "# 통로", "# 응원단 바로 앞"]}
          />

          <SeatRecommendSummaryCard
            variant="focused"
            totalPriceText="총 0원"
            seats={[
              { left: "000석 000블럭 00열 00번, 00번", right: "0원/매" },
              { left: "000석 000블럭 00열 00번", right: "0원/매" },
            ]}
            tags={["# 1루 내야", "# 하단", "# 통로", "# 응원단 바로 앞"]}
          />
        </ToneRow>
      </Section>

      <Section title="IconPreview">
        <ToneRow title="IconPreview">
          <IconPreview index={0} size="xl" />
          <IconPreview index={1} size="lg" />
          <IconPreview index={2} size="md" />
          <IconPreview index={3} size="sm" />
        </ToneRow>
      </Section>

      <Section title="MatchCard">
        <ToneRow title="MatchCard">
          {/* 기본 */}
          <MatchCard
            dateText="3월 28일"
            timeText="토 · 14 : 00"
            stadiumKo="대구 삼성 라이온즈 파크"
            stadiumEn="DaeguSamsung Lions Park"
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

          {/* 기본 + shadow + outline */}
          <MatchCard
            elevated
            withOutline
            dateText="3월 28일"
            timeText="토 · 14 : 00"
            stadiumKo="대구 삼성 라이온즈 파크"
            stadiumEn="DaeguSamsung Lions Park"
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

          {/* Coming Soon */}
          <MatchCard
            variant="comingSoon"
            dateText="3월 28일"
            timeText="토 · 14 : 00"
            stadiumKo="대구 삼성 라이온즈 파크"
            stadiumEn="DaeguSamsung Lions Park"
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

          {/* Coming Soon + shadow + outline */}
          <MatchCard
            variant="comingSoon"
            elevated
            withOutline
            dateText="3월 28일"
            timeText="토 · 14 : 00"
            stadiumKo="대구 삼성 라이온즈 파크"
            stadiumEn="DaeguSamsung Lions Park"
            away={{
              ko: "SSG 랜더스",
              en: "SSG LANDERS",
              dataLogo: "SSG",
              logo: <IconPreview index={6} size="md" />,
            }}
            home={{
              ko: "기아 타이거즈",
              en: "KIA TIGERS",
              dataLogo: "기아",
              logo: <IconPreview index={7} size="md" />,
            }}
            overlayTopText="Coming Soon"
            overlayMainText="3월 21일 16:00 오픈"
          />

          {/* Sold Out */}
          <MatchCard
            variant="soldOut"
            dateText="3월 28일"
            timeText="토 · 14 : 00"
            stadiumKo="대구 삼성 라이온즈 파크"
            stadiumEn="DaeguSamsung Lions Park"
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

          {/* Sold Out + shadow + outline */}
          <MatchCard
            variant="soldOut"
            elevated
            withOutline
            dateText="3월 28일"
            timeText="토 · 14 : 00"
            stadiumKo="대구 삼성 라이온즈 파크"
            stadiumEn="DaeguSamsung Lions Park"
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
        </ToneRow>
      </Section>

      <Section title="Calendar">
        <ToneRow title="Calendar">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                data-icon="on"
                data-state="Default"
                className={cn(
                  "w-20 h-9 min-w-20 px-4 py-2",
                  "bg-[var(--background-white)] rounded-md",
                  "outline outline-1 outline-offset-[-1px] outline-[var(--foundation-neutral-880)]",
                  "inline-flex justify-center items-center"
                )}
                aria-label="날짜 선택"
              >
                {/* 왼쪽: calendar-days */}
                <div className="w-6 h-6 pr-0.5 flex justify-start items-center">
                  <CalendarDays
                    className="h-5 w-5 text-[var(--foundation-primary-500)]"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </div>

                {/* 오른쪽: triangle-down (ChevronDown) */}
                <div className="pl-2 flex justify-start items-center">
                  <ChevronDown
                    className="h-4 w-4 text-[var(--foundation-primary-400)]"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </div>
              </button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  setDate(d);
                  setOpen(false); // 날짜 선택하면 닫기
                }}
                className="rounded-lg border"
                captionLayout="dropdown"
              />
            </PopoverContent>
          </Popover>
        </ToneRow>
      </Section>

      <Section title="DateStripHeader">
        <ToneRow title="DateStripHeader">
          <TodayInitSelectableDateStrip
            onChange={(date) => {
              console.log("선택된 날짜:", date);
            }}
          />

        </ToneRow>
      </Section>

      <Section title="TeamInfoCard">
        <ToneRow title="TeamInfoCard">
          <TeamInfoCard
            dataLogo="두산"
            teamName="두산 베어스"
            logo={<IconPreview index={7} size="md" />}
            onButtonClick={() => console.log("상세 보기")}
          />
        </ToneRow>
      </Section>
    </div>
  );
}
