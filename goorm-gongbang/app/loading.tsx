/* ===========================
   로딩 UI
=========================== */
export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
        <span className="text-muted-foreground">
          로딩 중...
        </span>
      </div>
    </div>
  );
}