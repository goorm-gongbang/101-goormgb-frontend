/* ===========================
    * 클라이언트 부트스트랩 Provider 패턴

    웹 시작 시(최초 진입/새로고침)
    1. 쿠키 기반 refresh로 access token을 복구
    2. 토큰으로 내정보(/api/me) 받아서 zustand 삽입
    3. bootstrapped 플래그로 렌더링 제어
=========================== */

"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { refreshAccessToken, getMe } from "@/lib/services";

export default function Providers({ children }: { children: React.ReactNode }) {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setUser = useAuthStore((s) => s.setUser);
  const bootstrapped = useAuthStore((s) => s.bootstrapped); // 초기 인증 복구 절차 플래그
  const setBootstrapped = useAuthStore((s) => s.setBootstrapped);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const token = await refreshAccessToken(); // [1] refresh로 accessToken 복구 (쿠키 기반)
      if (!mounted) return;
      if (token) setAccessToken(token); // 토큰이 있으면 store에 저장

      /* [2] 유저 정보 가져오기: /api/me */
      if (token) {
        const meRes = await getMe();
        if (meRes.ok) {
          const meJson = await meRes.json().catch(() => null);
          const user = meJson?.data ?? null;
          if (mounted) setUser(user);
        } else {
          if (mounted) setUser(null); // 토큰은 있는데 me가 실패하면 세션 문제 가능 → 정리
        }
      }
      if (mounted) setBootstrapped(true); // [3] 부트스트랩 완료 (초기 절차 끝)
    })();

    return () => { mounted = false; };
  }, [setAccessToken, setUser, setBootstrapped]);

  if (!bootstrapped) return null;

  return <>{children}</>;
}
