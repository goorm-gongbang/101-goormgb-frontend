"use client";

import { useMemo, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { StadiumMap } from "@/components/my/StadiumMap";

type SeatStatus = "available" | "sold";

type SeatRow = {
  rowLabel: string;
  seats: SeatStatus[];
};

type Props = {
  selectedIndices: number[];
  blockNumbers: number[];
  selectedBlockNumber: number;
  selectedSeats: string[];
  onSelectBlock: (blockNumber: number) => void;
  onToggleSeat: (seatKey: string) => void;
};

const BLOCK_WIDTH = 288;
const BLOCK_GAP = 10;
const BLOCK_TOP = 200;
const BLOCK_START_LEFT = 100;
const CANVAS_HEIGHT = 849;

function getSeatRows(blockNumber: number): SeatRow[] {
  return [
    { rowLabel: "1", seats: Array(14).fill("available" as SeatStatus) },
    { rowLabel: "2", seats: Array(14).fill("available" as SeatStatus) },
    { rowLabel: "3", seats: Array(14).fill("available" as SeatStatus) },
    { rowLabel: "4", seats: Array(7).fill("available" as SeatStatus) },
    { rowLabel: "5", seats: Array(7).fill("available" as SeatStatus) },
    { rowLabel: "6", seats: Array(7).fill("available" as SeatStatus) },
    { rowLabel: "7", seats: Array(7).fill("available" as SeatStatus) },
    { rowLabel: "8", seats: Array(14).fill("available" as SeatStatus) },
    { rowLabel: "9", seats: Array(14).fill("available" as SeatStatus) },
    { rowLabel: "10", seats: Array(14).fill("available" as SeatStatus) },
    { rowLabel: "11", seats: Array(14).fill("available" as SeatStatus) },
    { rowLabel: "12", seats: Array(14).fill("available" as SeatStatus) },
    { rowLabel: "13", seats: Array(14).fill("available" as SeatStatus) },
    { rowLabel: "14", seats: Array(14).fill("available" as SeatStatus) },
    { rowLabel: "15", seats: Array(14).fill("available" as SeatStatus) },
    { rowLabel: "16", seats: Array(14).fill("available" as SeatStatus) },
    { rowLabel: "17", seats: Array(14).fill("available" as SeatStatus) },
    { rowLabel: "18", seats: Array(14).fill("available" as SeatStatus) },
    { rowLabel: "19", seats: Array(14).fill("available" as SeatStatus) },
    { rowLabel: "20", seats: Array(14).fill("available" as SeatStatus) },
    { rowLabel: "21", seats: Array(14).fill("available" as SeatStatus) },
    { rowLabel: "22", seats: Array(14).fill("available" as SeatStatus) },
  ];
}

function getSeatClassName(status: SeatStatus, isSelected: boolean) {
  if (isSelected) {
    return "bg-[var(--foundation-orange-600)] outline outline-1 outline-[var(--foundation-orange-800)]";
  }

  if (status === "sold") {
    return "border border-[var(--foundation-neutral-800)] bg-[var(--background-interactive-neutral-default)]";
  }

  return "border border-[var(--foundation-orange-500)] bg-[var(--foundation-orange-300)]";
}

function SeatBlock({
  blockNumber,
  left,
  selectedSeats,
  onSelectBlock,
  onToggleSeat,
}: {
  blockNumber: number;
  left: number;
  selectedSeats: string[];
  onSelectBlock: (blockNumber: number) => void;
  onToggleSeat: (seatKey: string) => void;
}) {
  const rows = useMemo(() => getSeatRows(blockNumber), [blockNumber]);

  return (
    <div
      className="absolute inline-flex w-72 flex-col items-center justify-start"
      style={{ left, top: BLOCK_TOP }}
      onMouseEnter={() => onSelectBlock(blockNumber)}
    >
      <div className="text-center text-3xl font-semibold text-[var(--foundation-neutral-240)] font-['Pretendard']">
        {blockNumber}
      </div>

      <div className="inline-flex items-center justify-start gap-2 overflow-hidden bg-[var(--foundation-neutral-white)] py-4 pl-2.5 pr-5 shadow-[0px_12px_30px_rgba(0,0,0,0.14)]">
        <div className="inline-flex w-60 flex-col items-start justify-start gap-1">
          {rows.map((row) => (
            <div
              key={`${blockNumber}-${row.rowLabel}`}
              className={[
                "inline-flex self-stretch items-center gap-2",
                ["4", "5", "6", "7"].includes(row.rowLabel)
                  ? "justify-center"
                  : "justify-start",
              ].join(" ")}
            >
              <div className="inline-flex w-4 flex-col items-end justify-center gap-2">
                <div className="text-center text-[10.13px] font-semibold text-[var(--foundation-neutral-240)] font-['Pretendard']">
                  {row.rowLabel}
                </div>
              </div>

              <div className="flex items-center justify-start gap-1">
                {row.seats.map((seatStatus, seatIndex) => {
                  const seatKey = `${blockNumber}-${row.rowLabel}-${seatIndex + 1}`;
                  const isSelected = selectedSeats.includes(seatKey);

                  return (
                    <button
                      key={seatKey}
                      type="button"
                      disabled={seatStatus === "sold"}
                      onClick={() => {
                        onSelectBlock(blockNumber);
                        onToggleSeat(seatKey);
                      }}
                      className={[
                        "relative flex h-3 w-3 items-center justify-center rounded-[3.04px]",
                        seatStatus === "sold" ? "cursor-not-allowed" : "cursor-pointer",
                        getSeatClassName(seatStatus, isSelected),
                      ].join(" ")}
                    >
                      {isSelected ? (
                        <ChevronDown className="text-[var(--foundation-orange-50)]" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BlockSeatDetailView({
  selectedIndices,
  blockNumbers,
  selectedSeats,
  onSelectBlock,
  onToggleSeat,
}: Props) {
  const [isMapOpen, setIsMapOpen] = useState(true);

  const canvasWidth = Math.max(
    1389,
    BLOCK_START_LEFT * 2 +
    blockNumbers.length * BLOCK_WIDTH +
    Math.max(0, blockNumbers.length - 1) * BLOCK_GAP,
  );

  return (
    <div className="relative w-full self-stretch overflow-hidden">
      <div className="absolute right-2 top-2 z-30 sm:right-4 sm:top-4">
        <div className="overflow-hidden rounded-2xl bg-[var(--foundation-neutral-white)] shadow-[0px_0px_20px_0px_rgba(0,0,0,0.15)]">
          <div
            className={[
              "flex items-center justify-between gap-3 px-1 py-1"
            ].join(" ")}
          >
            <div className="text-xs font-semibold text-[var(--foundation-neutral-640)] sm:text-sm">

            </div>

            <button
              type="button"
              onClick={() => setIsMapOpen((prev) => !prev)}
              className="cursor-pointer rounded-md px-2 py-1 text-xs font-semibold text-[var(--foundation-neutral-500)] transition-colors hover:bg-[var(--foundation-neutral-50)] hover:text-[var(--foundation-neutral-700)]"
            >
              {isMapOpen ? <X className="h-4 w-4" /> : "펼치기"}
            </button>
          </div>

          {isMapOpen ? (
            <div className="w-[140px] p-2 sm:w-[200px] sm:p-3">
              <StadiumMap selectedIndices={selectedIndices} onToggle={() => { }} />
            </div>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-hidden rounded-xl sm:rounded-2xl">
        <div
          className="relative overflow-hidden bg-[var(--foundation-neutral-900)]"
          style={{ width: canvasWidth, height: CANVAS_HEIGHT }}
        >
          {blockNumbers.map((blockNumber, index) => (
            <SeatBlock
              key={blockNumber}
              blockNumber={blockNumber}
              left={BLOCK_START_LEFT + index * (BLOCK_WIDTH + BLOCK_GAP)}
              selectedSeats={selectedSeats}
              onSelectBlock={onSelectBlock}
              onToggleSeat={onToggleSeat}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
