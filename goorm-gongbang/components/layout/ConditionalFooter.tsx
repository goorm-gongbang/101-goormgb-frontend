/* 특정 페이지에서만 보이는 래퍼 */
"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

export function ConditionalFooter() {
  const pathname = usePathname();

  const showFooter =
    pathname === "/" ||
    pathname.startsWith("/matches/") ||
    pathname.startsWith("/clubs/");

  if (!showFooter) return null;

  return <Footer />;
}
