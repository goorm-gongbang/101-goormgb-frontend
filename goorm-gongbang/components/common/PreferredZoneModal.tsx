"use client";

import { X } from "lucide-react";
import { PrimaryButton } from "@/components/common/Button";
import { PreferredZoneSection } from "@/components/my/PreferredZoneSection";

type Props = {
  open: boolean;
  selectedBlocks: number[];
  onToggleBlock: (blockNum: number) => void;
  onReset: () => void;
  onClose: () => void;
  onConfirm: () => void;
};

export function PreferredZoneModal({
  open,
  selectedBlocks,
  onToggleBlock,
  onReset,
  onClose,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="flex max-h-[90vh] w-full max-w-[570px] flex-col overflow-hidden rounded-2xl bg-white">
        <div className="flex w-full flex-1 flex-col overflow-hidden p-9">
          <div className="inline-flex w-full items-center justify-end gap-2.5">
            <div className="flex flex-1 items-center justify-start">
              <div className="inline-flex flex-1 flex-col items-start justify-center">
                <div className="self-stretch text-xl font-bold leading-7 text-[var(--foundation-neutral-240)]">
                  선호 구역을 선택해주세요
                </div>
                <div className="inline-flex items-center justify-start gap-2 self-stretch">
                  <div className="text-sm font-medium leading-5 text-[var(--text-info-n600)]">
                    최대 10개까지 선택 가능해요
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="relative self-stretch overflow-hidden cursor-pointer"
            >
              <span className="flex h-12 w-12 items-center justify-center">
                <X className="h-6 w-6 text-[var(--foundation-neutral-240)]" />
              </span>
            </button>
          </div>

          <div className="mt-4 flex w-full flex-1 flex-col overflow-hidden">
            <div className="inline-flex w-full items-center justify-start gap-2">
              <div className="text-sm font-medium leading-5 text-[var(--foundation-primary-500)]">
                현재 선택 개수 : {selectedBlocks.length}개
              </div>
            </div>

            <div className="mt-6 w-full flex-1 overflow-y-auto [&>div]:mb-0 [&>div]:border-0 [&>div]:px-0 [&>div]:py-0">
              <PreferredZoneSection
                selectedBlocks={selectedBlocks}
                onToggle={onToggleBlock}
                onReset={onReset}
              />
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-[var(--stroke-interactive-neutral-default)] bg-white p-6">
          <div className="inline-flex h-10 w-full items-center justify-between">
            <PrimaryButton
              className="flex flex-1"
              size="lg"
              tone="base"
              onClick={onConfirm}
            >
              수정 완료
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
