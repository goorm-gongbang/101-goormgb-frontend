"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { kakaoLogin, type KakaoLoginResponse } from "@/lib/services";

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

    (async () => {
      const res = await kakaoLogin({ code });
      const json = (await res.json().catch(() => null)) as KakaoLoginResponse | null;

      if (!res.ok) {
        if (res.status === 400) toast.error(json?.message ?? "카카오 코드가 유효하지 않습니다.");
        else if (res.status === 403) toast.error(json?.message ?? "비활성화된 계정입니다. 관리자에게 문의하세요.");
        else toast.error(json?.message ?? `로그인 실패 (HTTP ${res.status})`);

        router.replace("/auth/login");
        return;
      }

      const accessToken = json?.data?.accessToken;
      if (!accessToken) {
        toast.error("accessToken이 응답에 없습니다.");
        router.replace("/auth/login");
        return;
      }

      setAccessToken(accessToken);

      // 온보딩 분기
      if (json?.data?.onboardingRequired) router.replace("/onboarding");
      else router.replace("/");

      toast.success(json?.message ?? "로그인 성공");
    })();
  }, [sp, router, setAccessToken, setUser]);

  return (
    <div className="min-h-[calc(100vh-0px)] w-full flex flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-[var(--foundation-primary-500)]" />
    </div>
  );
}
