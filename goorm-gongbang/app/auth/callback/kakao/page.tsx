"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

type KakaoLoginResponse = {
  code: string;
  message: string;
  data: {
    accessToken: string;
    user: { userId: number; status: "ACTIVE" | "DEACTIVE" | string };
    onboardingRequired: boolean;
  };
};

export default function KakaoCallbackPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const code = sp.get("code");
    if (!code) {
      toast.error("카카오 로그인 검증 실패");
      router.replace("/auth/login");
      return;
    }
    sessionStorage.removeItem("kakao_oauth_state");

    /* ===========================
        API REQUEST
    =========================== */
    (async () => {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
      const res = await fetch(`${API_BASE_URL}/api/kakao`, { // ★ /auth/kakao로 변경해야함.
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // refreshToken Set-Cookie
        cache: "no-store",
        body: JSON.stringify({ authorizationCode: code }),
      });

      const json = (await res.json().catch(() => null)) as KakaoLoginResponse | null;

      if (!res.ok) {
        /* 명세: 400 / 403 / 500 */
        if (res.status === 400) toast.error(json?.message ?? "카카오 코드가 유효하지 않습니다.");
        else if (res.status === 403) toast.error(json?.message ?? "비활성화된 계정입니다. 관리자에게 문의하세요.");
        else toast.error(json?.message ?? `로그인 실패 (HTTP ${res.status})`);

        router.replace("/auth/login");
        return;
      }

      /* AccessToken 예외 처리 */
      const accessToken = json?.data?.accessToken;
      if (!accessToken) {
        toast.error("accessToken이 응답에 없습니다.");
        router.replace("/auth/login");
        return;
      }

      /* status 예외 처리 - 재 가입 제한 */
      const status = String(json?.data?.user?.status ?? "").toUpperCase();
      if (status === "DEACTIVE") {
        toast.error("비활성화된 계정입니다. 관리자에게 문의하세요.");
        router.replace("/auth/login");
        return;
      }

      /* (accessToken, user) zustand에 저장 */
      setAccessToken(accessToken);
      setUser({
        id: String(json.data.user.userId),
        status: String(json.data.user.status)
      });

      /* 온보딩 분기 */
      if (json.data.onboardingRequired) router.replace("/onboarding"); // 온보딩 페이지로 이동
      else router.replace("/"); // 홈페이지로 이동

      toast.success(json.message ?? "로그인 성공");
    })();
  }, [sp, router, setAccessToken, setUser]);

  return <div className="p-6">로그인 중...</div>;
}
