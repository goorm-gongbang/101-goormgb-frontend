"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { kakaoLogin } from "@/lib/services";
import { ApiError } from "@/lib/api";

export default function KakaoCallbackPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const authorizationCode = sp.get("code");
    if (!authorizationCode) {
      toast.error("카카오 로그인 검증 실패");
      router.replace("/login");
      return;
    }
    sessionStorage.removeItem("kakao_oauth_state");

    (async () => {
      try {
        const data = await kakaoLogin({ authorizationCode });

        const accessToken = data?.accessToken;
        if (!accessToken) {
          toast.error("accessToken이 응답에 없습니다.");
          router.replace("/login");
          return;
        }

        setAccessToken(accessToken);

        // 온보딩 분기
        if (data?.user) {
          setUser({ id: String(data.user.userId), status: data.user.status });
        }
        if (data?.onboardingRequired) router.replace("/onboarding");
        else router.replace("/");

        toast.success("로그인 성공");
      } catch (e) {
        if (e instanceof ApiError) {
          toast.error(e.message);
        } else {
          toast.error("로그인 처리 중 오류가 발생했습니다.");
        }
        router.replace("/login");
      }
    })();
  }, [sp, router, setAccessToken, setUser]);

  return (
    <div className="min-h-[calc(100vh-0px)] w-full flex flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-[var(--foundation-primary-500)]" />
    </div>
  );
}
