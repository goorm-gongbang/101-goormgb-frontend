'use client';

import Image from 'next/image';
import * as React from 'react';
import { ChevronLeft, ChevronRight, MousePointer2 } from 'lucide-react';

type TutorialPageId = 'ready' | 'drag' | 'drop';

type TutorialPage = {
  id: TutorialPageId;
  title: string;
  lines: string[];
};

const TUTORIAL_PAGES: TutorialPage[] = [
  {
    id: 'ready',
    title: 'READY',
    lines: ['공이 날아오면 바로 준비하세요'],
  },
  {
    id: 'drag',
    title: 'HOLD & DRAG',
    lines: ['글러브를 드래그해서', '공이 떨어질 위치로', '옮겨주세요'],
  },
  {
    id: 'drop',
    title: 'DROP !',
    lines: ['게이지를 확인하여', '공이 도착하는 타이밍에 맞춰', '마우스를 놓아주세요'],
  },
];

const LAST_PAGE_INDEX = TUTORIAL_PAGES.length - 1;

function BaseballIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <div
      className={`relative rounded-full border-[2px] border-[#d7dee9] bg-[radial-gradient(circle_at_32%_28%,#ffffff_0%,#f8fafc_65%,#dbe3ef_100%)] ${className ?? ''}`}
    >
      <div className="absolute inset-[18%] rounded-full border-l-[2px] border-r-[2px] border-l-[#ef4444] border-r-[#ef4444]" />
    </div>
  );
}

function GloveIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <div className={`relative ${className ?? ''}`}>
      <Image
        src="/baseballglove.svg"
        alt=""
        fill
        sizes="64px"
        draggable={false}
        aria-hidden="true"
        className="object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.25)]"
      />
    </div>
  );
}

function TutorialContent({ page }: { page: TutorialPage }): React.ReactElement {
  if (page.id === 'ready') {
    return (
      <>
        <div className="absolute left-[217px] top-[130px] flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 shadow-[0_6px_20px_rgba(0,0,0,0.18)] backdrop-blur-[6px]">
          <BaseballIcon className="h-5 w-5" />
        </div>
        <div className="absolute left-[257px] top-[129px]">
          <p className="text-base font-semibold leading-6 text-white font-['Pretendard']">{page.title}</p>
          <p className="text-xs font-medium leading-[1.4] text-[var(--foundation-primary-100)] font-['Pretendard']">
            {page.lines[0]}
          </p>
        </div>
        <div className="absolute left-[212px] top-[246px] flex h-10 w-10 items-center justify-center">
          <MousePointer2 className="h-7 w-7 rotate-[18deg] fill-[var(--foundation-primary-500)] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.28)]" />
        </div>
      </>
    );
  }

  if (page.id === 'drag') {
    return (
      <>
        <BaseballIcon className="absolute left-[270px] top-[122px] h-8 w-8 shadow-[0_3px_8px_rgba(0,0,0,0.18)]" />
        <GloveIcon className="absolute left-[352px] top-[115px] h-[54px] w-[54px]" />
        <div className="absolute left-[285px] top-[188px] h-[2px] w-[76px] rotate-[-25deg] border-t-2 border-dashed border-[var(--foundation-primary-100)] opacity-90" />
        <div className="absolute left-[289px] top-[203px] h-7 w-7 rounded-full border-[4px] border-[#ff5c5f] bg-[var(--foundation-primary-500)] shadow-[0_0_0_2px_rgba(255,255,255,0.45)]" />
        <div className="absolute left-[326px] top-[148px] flex h-10 w-10 items-center justify-center">
          <MousePointer2 className="h-7 w-7 rotate-[20deg] fill-[var(--foundation-primary-500)] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.28)]" />
        </div>
        <div className="absolute left-[390px] top-[170px] max-w-[150px] text-left">
          <p className="text-base font-semibold leading-6 text-white font-['Pretendard']">{page.title}</p>
          <p className="text-xs font-medium leading-[1.4] text-[var(--foundation-primary-100)] font-['Pretendard']">
            {page.lines[0]}
          </p>
          <p className="text-xs font-medium leading-[1.4] text-white font-['Pretendard']">{page.lines[1]}</p>
          <p className="text-xs font-medium leading-[1.4] text-white font-['Pretendard']">{page.lines[2]}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <BaseballIcon className="absolute left-[286px] top-[216px] h-8 w-8 shadow-[0_3px_8px_rgba(0,0,0,0.18)]" />
      <GloveIcon className="absolute left-[309px] top-[210px] h-[44px] w-[44px]" />
      <div className="absolute left-[320px] top-[238px] flex h-10 w-10 items-center justify-center">
        <MousePointer2 className="h-7 w-7 rotate-[20deg] fill-[var(--foundation-primary-500)] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.28)]" />
      </div>
      <div className="absolute left-[388px] top-[218px] max-w-[164px] text-left">
        <p className="text-base font-semibold leading-6 text-white font-['Pretendard']">{page.title}</p>
        <p className="text-xs font-medium leading-[1.4] text-white font-['Pretendard']">{page.lines[0]}</p>
        <p className="text-xs font-medium leading-[1.4] text-white font-['Pretendard']">{page.lines[1]}</p>
        <p className="text-xs font-medium leading-[1.4] text-[var(--foundation-primary-100)] font-['Pretendard']">
          {page.lines[2]}
        </p>
      </div>
    </>
  );
}

export function VqaInstructionPanel(): React.ReactElement {
  const [pageIndex, setPageIndex] = React.useState(0);
  const page = TUTORIAL_PAGES[pageIndex];

  return (
    <div className="relative h-full w-full">
      <button
        type="button"
        onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
        disabled={pageIndex === 0}
        className="absolute left-5 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-white transition disabled:cursor-not-allowed disabled:text-white/35"
        aria-label="이전 튜토리얼"
      >
        <ChevronLeft className="h-10 w-[15px]" />
      </button>

      <button
        type="button"
        onClick={() => setPageIndex((prev) => Math.min(LAST_PAGE_INDEX, prev + 1))}
        disabled={pageIndex === LAST_PAGE_INDEX}
        className="absolute right-5 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-white transition disabled:cursor-not-allowed disabled:text-white/35"
        aria-label="다음 튜토리얼"
      >
        <ChevronRight className="h-10 w-[15px]" />
      </button>

      <TutorialContent page={page} />

      <div className="absolute bottom-9 left-1/2 flex -translate-x-1/2 items-center gap-[10px]">
        {TUTORIAL_PAGES.map((tutorialPage, index) => (
          <button
            key={tutorialPage.id}
            type="button"
            onClick={() => setPageIndex(index)}
            className={`h-[10px] w-[10px] rounded-full transition ${
              index === pageIndex
                ? 'bg-[var(--foundation-primary-500)]'
                : 'bg-[rgba(255,255,255,0.55)]'
            }`}
            aria-label={`${index + 1}번 튜토리얼로 이동`}
          />
        ))}
      </div>
    </div>
  );
}
