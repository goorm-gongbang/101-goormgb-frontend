/* ===========================
    * 클라이언트 부트스트랩 Provider 패턴

    웹 시작 시(최초 진입/새로고침)
    1. 쿠키 기반 refresh로 access token을 복구
    2. 토큰으로 내정보(/api/me) 받아서 zustand 삽입
    3. bootstrapped 플래그로 렌더링 제어
    4. 온보딩 필요 여부에 따라 전역 라우팅 제어
=========================== */

"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { refreshAccessToken, getMe } from "@/lib/services";
import { getBotToken } from "@/lib/client/bot-token";

function isOnboardingPath(pathname: string) {
  return pathname === "/onboarding" || pathname.startsWith("/onboarding/");
}

function isAuthPath(pathname: string) {
  return pathname === "/login" || pathname.startsWith("/kakao/callback");
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setUser = useAuthStore((s) => s.setUser);
  const setBootstrapped = useAuthStore((s) => s.setBootstrapped);
  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const user = useAuthStore((s) => s.user);
  const onboardingRequired = user?.onboardingRequired === true;

  const botTokenInitialized = useRef(false);

  // [X-Bot-Token] 사전 생성 (1회만)
  useEffect(() => {
    if (!botTokenInitialized.current) {
      getBotToken();
      botTokenInitialized.current = true;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const token = await refreshAccessToken();

      if (!mounted) return;

      if (token) {
        setAccessToken(token);

        try {
          const user = await getMe();

          if (!mounted) return;

          setUser(user ?? null);
        } catch {
          if (!mounted) return;

          setUser(null);
        }
      } else {
        setAccessToken(null);
        setUser(null);
      }

      if (mounted) {
        setBootstrapped(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [setAccessToken, setUser, setBootstrapped]);

  useEffect(() => {
    if (!bootstrapped) return;
    if (isAuthPath(pathname)) return;
    if (!user) return;

    if (onboardingRequired && !isOnboardingPath(pathname)) {
      router.replace("/onboarding/intro");
      return;
    }

    if (!onboardingRequired && isOnboardingPath(pathname)) {
      router.replace("/");
    }
  }, [bootstrapped, user, onboardingRequired, pathname, router]);

  return <>{children}</>;
}
