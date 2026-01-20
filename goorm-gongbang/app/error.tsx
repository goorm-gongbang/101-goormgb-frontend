/* ===========================
   에러 바운더리
=========================== */
"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-2xl font-semibold">
        문제가 발생했습니다
      </h2>

      <p className="text-muted-foreground">
        잠시 후 다시 시도해주세요.
      </p>

      <button
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
      >
        다시 시도
      </button>
    </div>
  );
}
