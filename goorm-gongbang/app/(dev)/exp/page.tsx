"use client";
import * as React from "react";
import { useEffect, useState } from "react";

const MODAL_OPEN_KEY = "exp_modal_open";

export default function Exp() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const navEntries = performance.getEntriesByType("navigation");
    const isReload =
      navEntries.length > 0 &&
      (navEntries[0] as PerformanceNavigationTiming).type === "reload";

    const wasModalOpen = sessionStorage.getItem(MODAL_OPEN_KEY) === "true";

  }, []);

  useEffect(() => {
    if (isOpen) {
      sessionStorage.setItem(MODAL_OPEN_KEY, "true");
    } else {
      sessionStorage.removeItem(MODAL_OPEN_KEY);
    }
  }, [isOpen]);

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-lg bg-black px-4 py-2 text-white"
      >
        모달 열기
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-2 text-lg font-semibold">모달 제목</div>
            <p className="mb-6 text-sm text-gray-600">
              모달이 열린 상태에서 새로고침하면 콘솔이 찍힙니다.
            </p>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-black"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
