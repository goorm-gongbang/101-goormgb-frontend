/* ===========================
   404 페이지
=========================== */
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-muted-foreground">
        페이지를 찾을 수 없습니다.
      </p>

      <Link
        href="/"
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
      >
        홈으로 이동
      </Link>
    </div>
  );
}