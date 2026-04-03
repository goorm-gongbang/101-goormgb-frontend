'use client';

import Image from 'next/image';
import * as React from 'react';
import { ChevronLeft, ChevronRight, MousePointer2 } from 'lucide-react';
import { CATCH_BALL_CONFIG, STRIKE_ZONE, VERTICAL_INDICATOR_TRACK } from './catchBallConfig';

type TutorialPageId = 'ready' | 'drag' | 'drop';

type TutorialPage = {
  ballFocus: FocusRect;
  contentPositionClass: string;
  descriptionAccentIndices?: number[];
  focusPath?: FocusPath;
  focusRects: FocusRect[];
  indicatorThumbTop: number;
  id: TutorialPageId;
  title: string;
  lines: string[];
};

type FocusRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
};

type FocusPath = {
  d: string;
  strokeWidth: number;
};

const STRIKE_ZONE_FOCUS: FocusRect = {
  x: STRIKE_ZONE.x,
  y: STRIKE_ZONE.y,
  width: STRIKE_ZONE.width,
  height: STRIKE_ZONE.height,
  radius: 6,
};

const INDICATOR_READY_FOCUS: FocusRect = {
  x: 210,
  y: 260,
  width: 40,
  height: 66,
  radius: 8,
};

const INDICATOR_DRAG_FOCUS: FocusRect = {
  x: 210,
  y: 208,
  width: 40,
  height:66,
  radius: 8,
};

const INDICATOR_DROP_FOCUS: FocusRect = {
  x: 210,
  y: 148,
  width: 40,
  height: 66,
  radius: 8,
};

const READY_BALL_FOCUS: FocusRect = {
  x: 190,
  y: 44,
  width: 92,
  height: 92,
  radius: 24,
};

const DRAG_GLOVE_FOCUS: FocusRect = {
  x: 396,
  y: 75,
  width: 72,
  height: 135,
  radius: 24,
};

const DRAG_TARGET_FOCUS: FocusRect = {
  x: 290,
  y: 210,
  width: 77,
  height: 77,
  radius: 18,
};

const DROP_BALL_FOCUS: FocusRect = {
  x: 302,
  y: 202,
  width: 50,
  height: 50,
  radius: 16,
};

const TUTORIAL_PAGES: TutorialPage[] = [
  {
    ballFocus: READY_BALL_FOCUS,
    contentPositionClass: 'left-[190px] top-[44px]',
    descriptionAccentIndices: [],
    focusRects: [STRIKE_ZONE_FOCUS, INDICATOR_READY_FOCUS, READY_BALL_FOCUS],
    indicatorThumbTop: 128,
    id: 'ready',
    title: 'READY',
    lines: ['공이 날아오면 바로 준비하세요'],
  },
  {
    ballFocus: DRAG_TARGET_FOCUS,
    contentPositionClass: 'left-[468px] top-[188px]',
    descriptionAccentIndices: [0],
    focusPath: {
      d: 'M 420 118 C 468 190 360 174 330 248',
      strokeWidth: 16,
    },
    focusRects: [INDICATOR_DRAG_FOCUS, DRAG_GLOVE_FOCUS, DRAG_TARGET_FOCUS],
    indicatorThumbTop: 78,
    id: 'drag',
    title: 'HOLD & DRAG',
    lines: ['글러브를 드래그해서', '공이 떨어질 위치로', '옮겨주세요'],
  },
  {
    ballFocus: DROP_BALL_FOCUS,
    contentPositionClass: 'left-[302px] top-[202px]',
    descriptionAccentIndices: [2],
    focusRects: [STRIKE_ZONE_FOCUS, INDICATOR_DROP_FOCUS, DROP_BALL_FOCUS],
    indicatorThumbTop: 18,
    id: 'drop',
    title: 'DROP !',
    lines: ['게이지를 확인하여', '공이 도착하는 타이밍에 맞춰', '마우스를 놓아주세요'],
  },
];

const LAST_PAGE_INDEX = TUTORIAL_PAGES.length - 1;
const READY_GLOVE_CLASS = 'absolute left-[364px] top-[132px] h-[68px] w-[92px]';
const DRAG_GLOVE_CLASS = 'absolute left-[386px] top-[58px] h-[68px] w-[92px]';
const DROP_GLOVE_CLASS = 'absolute left-[334px] top-[200px] h-[58px] w-[58px]';
const TUTORIAL_CURSOR_WRAPPER_CLASS = 'flex h-[44px] w-[44px] items-center justify-center';
const TUTORIAL_CURSOR_ICON_CLASS =
  'h-[34px] w-[34px] rotate-[18deg] fill-[var(--foundation-primary-500)] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.28)]';

function BaseballIcon({ className, sizes = '32px' }: { className?: string; sizes?: string }): React.ReactElement {
  return (
    <div className={`relative ${className ?? ''}`}>
      <Image
        src="/baseball_ball_contour.png"
        alt=""
        fill
        sizes={sizes}
        draggable={false}
        aria-hidden="true"
        className="object-contain"
      />
    </div>
  );
}

function ReadyBaseballBadge(): React.ReactElement {
  return (
    <div className="flex h-[92px] w-[92px] items-center justify-center rounded-[22px] ">
      <BaseballIcon className="h-[54px] w-[54px] drop-shadow-[0_4px_6px_rgba(0,0,0,0.18)]" sizes="54px" />
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
        className="object-contain opacity-[0.68] drop-shadow-[0_6px_14px_rgba(0,0,0,0.25)]"
      />
    </div>
  );
}

function TutorialCopy({
  accentIndices = [],
  lines,
  title,
}: {
  accentIndices?: number[];
  lines: string[];
  title: string;
}): React.ReactElement {
  return (
    <div className="text-left">
      <div className="relative h-6 w-[168px]">
        <p
          aria-hidden="true"
          className="absolute inset-0 text-[24px] font-semibold leading-6 text-[var(--foundation-primary-500)] font-['Pretendard']"
          style={{
            textShadow: [
              '1px 0 0 var(--foundation-primary-500)',
              '-1px 0 0 var(--foundation-primary-500)',
              '0 1px 0 var(--foundation-primary-500)',
              '0 -1px 0 var(--foundation-primary-500)',
              '1px 1px 0 var(--foundation-primary-500)',
              '-1px 1px 0 var(--foundation-primary-500)',
              '1px -1px 0 var(--foundation-primary-500)',
              '-1px -1px 0 var(--foundation-primary-500)',
            ].join(', '),
          }}
        >
          {title}
        </p>
        <p className="relative text-[24px] font-semibold leading-6 text-[var(--foundation-neutral-white)] font-['Pretendard']">
          {title}
        </p>
      </div>
      <div className="mt-2 w-[156px]">
        {lines.map((line, index) => (
          <p key={line} className="text-[13px] font-medium leading-5 font-['Pretendard']">
            <span className={accentIndices.includes(index) ? 'text-[var(--foundation-primary-100)]' : 'text-white'}>
              {line}
            </span>
          </p>
        ))}
      </div>
    </div>
  );
}

function TutorialFocusMask({
  focusPath,
  focusRects,
}: {
  focusPath?: FocusPath;
  focusRects: FocusRect[];
}): React.ReactElement {
  const maskId = React.useId().replace(/:/g, '');

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox={`0 0 ${CATCH_BALL_CONFIG.playWidth} ${CATCH_BALL_CONFIG.playHeight}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse">
          <rect width={CATCH_BALL_CONFIG.playWidth} height={CATCH_BALL_CONFIG.playHeight} fill="white" />
          {focusRects.map((focusRect, index) => (
            <rect
              key={`${focusRect.x}-${focusRect.y}-${index}`}
              x={focusRect.x}
              y={focusRect.y}
              width={focusRect.width}
              height={focusRect.height}
              rx={focusRect.radius}
              fill="black"
            />
          ))}
          {focusPath && (
            <path
              d={focusPath.d}
              stroke="black"
              strokeWidth={focusPath.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          )}
        </mask>
      </defs>
      <rect
        width={CATCH_BALL_CONFIG.playWidth}
        height={CATCH_BALL_CONFIG.playHeight}
        fill="rgba(6, 14, 24, 0.34)"
        mask={`url(#${maskId})`}
      />
    </svg>
  );
}

function ReadyTutorial({ page }: { page: TutorialPage }): React.ReactElement {
  return (
    <>
      <div className={`absolute ${page.contentPositionClass}`}>
        <div className="flex items-start gap-4">
          <ReadyBaseballBadge />
          <div className="pt-[10px]">
            <TutorialCopy accentIndices={page.descriptionAccentIndices} lines={page.lines} title={page.title} />
          </div>
        </div>
      </div>
      <GloveIcon className={READY_GLOVE_CLASS} />
      <div className={`absolute left-[178px] top-[320px] ${TUTORIAL_CURSOR_WRAPPER_CLASS}`}>
        <MousePointer2 className={TUTORIAL_CURSOR_ICON_CLASS} />
      </div>
    </>
  );
}

function TutorialBackdrop({ page }: { page: TutorialPage }): React.ReactElement | null {
  if (page.id === 'drag') {
    return (
      <BaseballIcon
        className="absolute left-[232px] top-[76px] h-[58px] w-[58px] opacity-[0.92]"
        sizes="58px"
      />
    );
  }

  return null;
}

function TutorialIndicator({ thumbTop }: { thumbTop: number }): React.ReactElement {
  return (
    <div
      className="absolute overflow-hidden rounded-[4px] border border-[var(--foundation-neutral-880)] bg-white/60"
      style={{
        left: VERTICAL_INDICATOR_TRACK.x,
        top: VERTICAL_INDICATOR_TRACK.y,
        width: VERTICAL_INDICATOR_TRACK.width,
        height: VERTICAL_INDICATOR_TRACK.height,
      }}
    >
      <div className="absolute left-1/2 top-[3px] h-[44px] w-[20px] -translate-x-1/2 rounded-[4px] border border-[var(--foundation-primary-100)] bg-[linear-gradient(180deg,var(--foundation-primary-700)_0%,var(--foundation-primary-500)_100%)]" />
      <div
        className="absolute left-1/2 h-[14px] w-[14px] -translate-x-1/2 rounded-full border border-[var(--foundation-primary-600)] bg-white"
        style={{ top: thumbTop }}
      />
    </div>
  );
}

function TutorialContent({ page }: { page: TutorialPage }): React.ReactElement {
  if (page.id === 'ready') {
    return <ReadyTutorial page={page} />;
  }

  if (page.id === 'drag') {
    return (
      <>
        <svg
          className="pointer-events-none absolute left-0 top-0 h-full w-full"
          viewBox={`0 0 ${CATCH_BALL_CONFIG.playWidth} ${CATCH_BALL_CONFIG.playHeight}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="dragCurveGradient" x1="420" y1="118" x2="328" y2="248" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(143,252,225,0.32)" />
              <stop offset="55%" stopColor="rgba(143,252,225,0.68)" />
              <stop offset="100%" stopColor="rgba(0,194,146,1)" />
            </linearGradient>
          </defs>
          <path
            d="M 420 118 C 468 190 360 174 330 248"
            stroke="url(#dragCurveGradient)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 16"
            fill="none"
            opacity="0.95"
          />
          <path
            d="M 320 236 L 330 248 L 315 248"
            fill="var(--foundation-primary-500)"
            opacity="0.95"
          />
        </svg>
        <div className="absolute left-[290px] top-[210px] h-[76px] w-[76px] rounded-full bg-[rgba(255,106,102,0.34)]" />
        <div className="absolute left-[300px] top-[220px] flex h-[56px] w-[56px] items-center justify-center rounded-[18px] shadow-[0_6px_14px_rgba(0,0,0,0.10)]">
          <div className="h-[20px] w-[20px] rounded-full bg-[var(--foundation-primary-500)]" />
        </div>
        <GloveIcon className={DRAG_GLOVE_CLASS} />
        <div className={`absolute left-[396px] top-[145px] ${TUTORIAL_CURSOR_WRAPPER_CLASS}`}>
          <MousePointer2 className={TUTORIAL_CURSOR_ICON_CLASS} />
        </div>
        <div className={`absolute ${page.contentPositionClass}`}>
          <TutorialCopy accentIndices={page.descriptionAccentIndices} lines={page.lines} title={page.title} />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="absolute left-[294px] top-[196px] h-[68px] w-[68px] rounded-full bg-[rgba(255,106,102,0.34)]" />
      <BaseballIcon className="absolute left-[303px] top-[207px] h-13 w-13" sizes="40px" />
      <GloveIcon className={DROP_GLOVE_CLASS} />
      <div className={`absolute left-[356px] top-[234px] ${TUTORIAL_CURSOR_WRAPPER_CLASS}`}>
        <MousePointer2 className={TUTORIAL_CURSOR_ICON_CLASS.replace('rotate-[18deg]', 'rotate-[20deg]')} />
      </div>
      <div className="absolute left-[436px] top-[212px]">
        <TutorialCopy accentIndices={page.descriptionAccentIndices} lines={page.lines} title={page.title} />
      </div>
    </>
  );
}

export function VqaInstructionPanel(): React.ReactElement {
  const [pageIndex, setPageIndex] = React.useState(0);
  const page = TUTORIAL_PAGES[pageIndex];

  return (
    <div className="relative h-full w-full">
      <TutorialBackdrop page={page} />
      <TutorialFocusMask focusPath={page.focusPath} focusRects={page.focusRects} />
      <TutorialIndicator thumbTop={page.indicatorThumbTop} />

      <button
        type="button"
        onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
        disabled={pageIndex === 0}
        className="absolute left-4 top-1/2 z-10 flex h-[30px] w-[80px] -translate-y-1/2 items-center justify-start text-white transition disabled:cursor-not-allowed disabled:text-white/35"
        aria-label="이전 튜토리얼"
      >
        <ChevronLeft className="h-[30px] w-[30px] stroke-[2.5]" />
      </button>

      <button
        type="button"
        onClick={() => setPageIndex((prev) => Math.min(LAST_PAGE_INDEX, prev + 1))}
        disabled={pageIndex === LAST_PAGE_INDEX}
        className="absolute right-4 top-1/2 z-10 flex h-[30px] w-[80px] -translate-y-1/2 items-center justify-end text-white transition disabled:cursor-not-allowed disabled:text-white/35"
        aria-label="다음 튜토리얼"
      >
        <ChevronRight className="h-[30px] w-[30px] stroke-[2.5]" />
      </button>

      <TutorialContent page={page} />

      <div className="absolute bottom-9 left-1/2 flex -translate-x-1/2 items-center gap-[40px]">
        {TUTORIAL_PAGES.map((tutorialPage, index) => (
          <button
            key={tutorialPage.id}
            type="button"
            onClick={() => setPageIndex(index)}
            className={`h-[14px] w-[14px] rounded-full transition ${
              index <= pageIndex
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
