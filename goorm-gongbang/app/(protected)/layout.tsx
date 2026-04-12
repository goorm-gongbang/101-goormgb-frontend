"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = bootstrapped && !!accessToken && !!user;

  useEffect(() => {
    if (!bootstrapped) return;

    if (!isLoggedIn) {
      const { intentionalLogout, clearLogoutFlag } = useAuthStore.getState();
      if (intentionalLogout) {
        clearLogoutFlag();
        router.replace("/");
      } else {
        const query = searchParams.toString();
        const next = query ? `${pathname}?${query}` : pathname;
        router.replace(`/login?next=${encodeURIComponent(next)}`);
      }
    }
  }, [bootstrapped, isLoggedIn, pathname, searchParams, router]);

  if (!bootstrapped) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="w-8 h-8 rounded-full border-4 border-[var(--foundation-primary-500)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) return null;

  return <>{children}</>;
}