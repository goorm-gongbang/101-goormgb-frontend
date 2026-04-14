"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  startOfDay,
  addDays,
  isSameDay,
  addMonths,
  getDaysInMonth,
  setDate as setDateOfMonth,
} from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarDays, ChevronDown } from "lucide-react";

const DOW_KO = ["일", "월", "화", "수", "목", "금", "토"] as const;

function addMonthsClamped(base: Date, deltaMonths: number) {
  const baseDay = base.getDate();

  // target month로 이동(1일 기준)
  const targetMonthFirst = startOfDay(addMonths(new Date(base.getFullYear(), base.getMonth(), 1), deltaMonths));
  const lastDay = getDaysInMonth(targetMonthFirst);

  // baseDay가 targetMonth의 마지막 일보다 크면 clamp
  return startOfDay(setDateOfMonth(targetMonthFirst, Math.min(baseDay, lastDay)));
}

type Props = {
  className?: string;
  sideCount?: number;
  onChange?: (date: Date) => void;
};

function getTodayStartInKST() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  return startOfDay(new Date(year, month - 1, day));
}

function useResponsiveSideCount(fixed?: number) {
  const [sc, setSc] = React.useState<number>(fixed ?? 4);

  React.useEffect(() => {
    if (typeof fixed === "number") return;

    const calc = () => {
      const w = window.innerWidth;
      if (w < 640) return 2;   // mobile: 5칸
      if (w < 1024) return 3;  // tablet: 7칸
      return 4;                // desktop: 9칸
    };

    const onResize = () => setSc(calc());
    setSc(calc());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [fixed]);

  return fixed ?? sc;
}

export function TodayInitSelectableDateStrip({ className, sideCount, onChange }: Props) {
  const today = React.useMemo(() => getTodayStartInKST(), []);
  const [selectedDate, setSelectedDate] = React.useState<Date>(today);

  const responsiveSideCount = useResponsiveSideCount(sideCount);

  const headerYear = selectedDate.getFullYear();
  const headerMonthIndex0 = selectedDate.getMonth();
  const headerMonth = String(headerMonthIndex0 + 1).padStart(2, "0");

  const items = React.useMemo(() => {
    const start = addDays(selectedDate, -responsiveSideCount);

    return Array.from({ length: responsiveSideCount * 2 + 1 }, (_, i) => {
      const date = startOfDay(addDays(start, i));

      return {
        date,
        dow: DOW_KO[date.getDay()],
        day: date.getDate(),
        isToday: isSameDay(date, today),
        inMonth: date.getFullYear() === headerYear && date.getMonth() === headerMonthIndex0,
      };
    });
  }, [selectedDate, responsiveSideCount, today, headerYear, headerMonthIndex0]);

  const updateSelected = (d: Date) => {
    const next = startOfDay(d);
    setSelectedDate(next);
    onChange?.(next);
  };

  const goPrevMonth = () => updateSelected(addMonthsClamped(selectedDate, -1));
  const goNextMonth = () => updateSelected(addMonthsClamped(selectedDate, +1));

  const goPrevDay = () => updateSelected(addDays(selectedDate, -1));
  const goNextDay = () => updateSelected(addDays(selectedDate, +1));

  const PRIMARY_500 = "text-[var(--foundation-primary-500)]";

  const [open, setOpen] = React.useState(false);

  return (
    <div className={cn("w-full flex flex-col items-center gap-3", className)}>
      <div className="w-full flex flex-col items-center gap-3">
        <div className="w-full flex justify-center">
          <div className="flex items-center mr-25">
            <div className="flex items-center gap-3">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    data-icon="on"
                    data-state="Default"
                    className={cn(
                      "w-20 h-9 min-w-20 px-4 py-2 cursor-pointer",
                      "bg-[var(--background-white)] rounded-md",
                      "outline outline-1 outline-offset-[-1px] outline-[var(--foundation-neutral-880)]",
                      "inline-flex justify-center items-center",
                      open
                        ? "bg-[var(--foundation-primary-10)] outline-[var(--foundation-primary-500)]"
                        : "bg-[var(--background-white)] outline-[var(--foundation-neutral-880)]"
                    )}
                    aria-label="날짜 선택"
                  >
                    <div className="w-6 h-6 pr-0.5 flex justify-start items-center">
                      <CalendarDays
                        className="h-5 w-5 text-[var(--foundation-primary-500)]"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </div>
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
                    selected={selectedDate}
                    onSelect={(d) => {
                      if (!d) return;
                      updateSelected(d);
                      setOpen(false);
                    }}
                    className="rounded-lg border"
                    captionLayout="dropdown-months"
                  />
                </PopoverContent>
              </Popover>

              <button
                type="button"
                onClick={goPrevMonth}
                className="w-8 h-8 flex items-center justify-center cursor-pointer"
                aria-label="이전 달"
              >
                <ChevronLeft className="w-5 h-5 text-[var(--light-foreground)]" strokeWidth={2} />
              </button>
            </div>

            <div className="ml-7 flex items-center gap-7">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="flex items-center">
                  <div className="text-zinc-950 text-lg sm:text-xl font-semibold font-['Pretendard'] leading-8">
                    {headerYear}&nbsp;
                  </div>
                  <div className="text-zinc-950 text-lg sm:text-xl font-semibold font-['Pretendard'] leading-8">.</div>
                </div>
                <div className="text-zinc-950 text-lg sm:text-xl font-semibold font-['Pretendard'] leading-8">
                  {headerMonth}
                </div>
              </div>

              <button
                type="button"
                onClick={goNextMonth}
                className="w-8 h-8 flex items-center justify-center cursor-pointer"
                aria-label="다음 달"
              >
                <ChevronRight className="w-5 h-5 text-[var(--light-foreground)]" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>


        <div className="w-full border-b-[0.80px] border-[var(--foundation-neutral-880)]">
          <div className="w-full overflow-x-auto">
            <div className="w-full flex items-center justify-between gap-1 sm:gap-2">
              <button
                type="button"
                onClick={goPrevDay}
                className={cn(
                  "shrink-0 rounded-full outline outline-1 outline-offset-[-1px]",
                  "bg-[var(--foundation-neutral-white)] outline-[var(--foundation-neutral-800)]",
                  "w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center cursor-pointer"
                )}
                aria-label="이전 날짜"
              >
                <ChevronLeft className="w-4 h-4 text-[var(--foundation-neutral-160)]" strokeWidth={2} />
              </button>

              <div className="flex flex-1 items-stretch justify-between gap-1 sm:gap-2 min-w-0">
                {items.map((it) => {
                  const isSelected = isSameDay(it.date, selectedDate);
                  const dim = !it.inMonth;

                  const baseDowColor = dim
                    ? "text-[var(--foundation-neutral-360)]"
                    : "text-[var(--foundation-neutral-20)]";
                  const baseDayColor = dim
                    ? "text-[var(--foundation-neutral-360)]"
                    : "text-[var(--foundation-neutral-20)]";

                  const dowColor = isSelected ? PRIMARY_500 : baseDowColor;
                  const dayColor = isSelected ? PRIMARY_500 : baseDayColor;

                  const topLabel = it.isToday && isSelected ? "오늘" : it.dow;

                  return (
                    <button
                      key={it.date.toISOString()}
                      type="button"
                      onClick={() => updateSelected(it.date)}
                      className={cn(
                        "flex-1 min-w-0 rounded-2xl",
                        "px-1.5 sm:px-2.5 py-3 sm:py-4",
                        "flex flex-col items-center justify-center gap-2 sm:gap-3",
                        dim && "opacity-30"
                      )}
                      title={`${it.date.getFullYear()}.${String(it.date.getMonth() + 1).padStart(2, "0")}.${String(
                        it.day
                      ).padStart(2, "0")} (${it.dow})`}
                      aria-label={`${it.dow} ${it.day}일`}
                    >
                      <div
                        className={cn(
                          "w-full text-center font-medium font-['Pretendard'] leading-6",
                          "text-sm sm:text-base",
                          dowColor,
                          "truncate"
                        )}
                      >
                        {topLabel}
                      </div>
                      <div
                        className={cn(
                          "text-center font-bold font-['Pretendard'] leading-7",
                          "text-lg sm:text-xl",
                          dayColor
                        )}
                      >
                        {it.day}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={goNextDay}
                className={cn(
                  "shrink-0 rounded-full outline outline-1 outline-offset-[-1px]",
                  "bg-[var(--foundation-neutral-white)] outline-[var(--foundation-neutral-800)]",
                  "w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center cursor-pointer"
                )}
                aria-label="다음 날짜"
              >
                <ChevronRight className="w-4 h-4 text-[var(--foundation-neutral-160)]" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
