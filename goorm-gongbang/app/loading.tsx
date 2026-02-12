"use client";

/* ===========================
   로딩 UI
=========================== */
import { Spinner } from "@/components/ui/spinner"
export default function Loading() {
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="h-6 w-6" />
      </div>
    </div>
  );
}