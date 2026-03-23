"use client";

import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { StadiumMap } from "@/components/my/StadiumMap";
import type { SectionBlock, SectionBlockSeatStatus } from "@/lib/types";

type Props = {
  selectedIndices: number[];
  blocks: SectionBlock[];
  activeBlockId: number | null;
  selectedSeatIds: number[];
  onSelectBlock: (blockId: number) => void;
  onToggleSeat: (seatId: number) => void;
};

const BLOCK_WIDTH = 288;
const BLOCK_GAP = 10;
const BLOCK_TOP = 200;
const BLOCK_START_LEFT = 100;
const CANVAS_HEIGHT = 849;

function getSeatClassName(
  saleStatus: SectionBlockSeatStatus,
  isSelected: boolean,
) {
  if (isSelected) {
    return "border border-[var(--foundation-orange-800)] bg-[var(--foundation-orange-600)] text-[var(--foundation-orange-50)]";
  }

  switch (saleStatus) {
    case "AVAILABLE":
      return "border border-[var(--foundation-orange-500)] bg-[var(--foundation-orange-300)] text-transparent";
    case "HELD":
      return "border border-[var(--foundation-neutral-820)] bg-[var(--foundation-neutral-920)] text-transparent";
    case "BLOCKED":
      return "border border-[var(--foundation-neutral-760)] bg-[var(--foundation-neutral-860)] text-transparent";
    case "SOLD_OUT":
      return "border border-[var(--foundation-neutral-800)] bg-[var(--background-interactive-neutral-default)] text-transparent";
    default:
      return "border border-[var(--foundation-neutral-800)] bg-[var(--background-interactive-neutral-default)] text-transparent";
  }
}

function isSeatDisabled(saleStatus: SectionBlockSeatStatus) {
  return saleStatus !== "AVAILABLE";
}

function SeatBlock({
  block,
  left,
  selectedSeatIds,
  onSelectBlock,
  onToggleSeat,
}: {
  block: SectionBlock;
  left: number;
  selectedSeatIds: number[];
  onSelectBlock: (blockId: number) => void;
  onToggleSeat: (seatId: number) => void;
}) {
  const rows = useMemo(() => block.rows, [block.rows]);

  return (
    <div
      className="absolute inline-flex w-72 flex-col items-center justify-start"
      style={{ left, top: BLOCK_TOP }}
      onMouseEnter={() => onSelectBlock(block.blockId)}
    >
      <div className="text-center text-3xl font-semibold text-[var(--foundation-neutral-240)] font-['Pretendard']">
        {block.displayName}
      </div>

      <div className="inline-flex items-center justify-start gap-2 overflow-hidden bg-[var(--foundation-neutral-white)] py-4 pl-2.5 pr-5 shadow-[0px_12px_30px_rgba(0,0,0,0.14)]">
        <div className="inline-flex w-63 flex-col items-start justify-start gap-1">
          {rows.map((row) => (
            <div
              key={`${block.blockId}-${row.rowNo}`}
              className={[
                "inline-flex self-stretch items-center gap-2",
                [4, 5, 6, 7].includes(row.rowNo) ? "justify-center" : "justify-start",
              ].join(" ")}
            >
              <div className="inline-flex w-6 flex-col items-end justify-center gap-2">
                <div className="text-center text-[10.13px] font-semibold text-[var(--foundation-neutral-240)] font-['Pretendard']">
                  {row.rowNo}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-start gap-1">
                {row.seats.map((seat) => {
                  const isSelected = selectedSeatIds.includes(seat.seatId);
                  const disabled = isSeatDisabled(seat.saleStatus);

                  return (
                    <button
                      key={seat.seatId}
                      type="button"
                      disabled={disabled}
                      aria-label={`${block.displayName} ${row.rowNo}열 ${seat.seatNo}번`}
                      onClick={() => {
                        onSelectBlock(block.blockId);
                        onToggleSeat(seat.seatId);
                      }}
                      className={[
                        "relative flex h-3 w-3 items-center justify-center rounded-[3.04px] text-[8px] font-semibold transition-colors",
                        disabled ? "cursor-not-allowed" : "cursor-pointer",
                        getSeatClassName(seat.saleStatus, isSelected),
                      ].join(" ")}
                      title={`${row.rowNo}열 ${seat.seatNo}번 (${seat.saleStatus})`}
                    >
                      {isSelected ? "✓" : null}
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
  blocks,
  selectedSeatIds,
  onSelectBlock,
  onToggleSeat,
}: Props) {
  const [isMapOpen, setIsMapOpen] = useState(true);

  const canvasWidth = Math.max(
    1389,
    BLOCK_START_LEFT * 2 +
    blocks.length * BLOCK_WIDTH +
    Math.max(0, blocks.length - 1) * BLOCK_GAP,
  );

  return (
    <div className="relative w-full self-stretch overflow-hidden">
      <div className="absolute right-2 top-2 z-30 sm:right-4 sm:top-4">
        <div className="overflow-hidden rounded-2xl bg-[var(--foundation-neutral-white)] shadow-[0px_0px_20px_0px_rgba(0,0,0,0.15)]">
          <div className="flex items-center justify-between gap-3 px-1 py-1">
            <div className="px-2 text-xs font-semibold text-[var(--foundation-neutral-640)] sm:text-sm">
              블럭 위치
            </div>

            <button
              type="button"
              onClick={() => setIsMapOpen((prev) => !prev)}
              className="cursor-pointer rounded-md px-2 py-1 text-xs font-semibold text-[var(--foundation-neutral-500)] transition-colors hover:bg-[var(--foundation-neutral-50)] hover:text-[var(--foundation-neutral-700)]"
            >
              {isMapOpen ? <X className="h-4 w-4" /> : "열기"}
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
          {blocks.map((block, index) => (
            <SeatBlock
              key={block.blockId}
              block={block}
              left={BLOCK_START_LEFT + index * (BLOCK_WIDTH + BLOCK_GAP)}
              selectedSeatIds={selectedSeatIds}
              onSelectBlock={onSelectBlock}
              onToggleSeat={onToggleSeat}
            />
          ))}

          {blocks.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center">
              <div className="rounded-xl bg-[var(--foundation-neutral-white)] px-6 py-4 text-sm font-medium text-[var(--foundation-neutral-500)] shadow-[0px_12px_30px_rgba(0,0,0,0.14)]">
                조회 가능한 블럭 좌석이 없습니다.
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
