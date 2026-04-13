"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { kakaoLogin, getMe } from "@/lib/services";
import { ApiError } from "@/lib/api";

function getSafeRedirectPath(next: string | null) {
  if (!next) return "/";
  if (!next.startsWith("/")) return "/";
  if (next.startsWith("//")) return "/";
  if (next.startsWith("/login")) return "/";
  if (next.startsWith("/kakao/callback")) return "/";
  if (next.startsWith("/onboarding")) return "/";

  return next;
}

export default function KakaoCallbackPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setUser = useAuthStore((s) => s.setUser);
  const setBootstrapped = useAuthStore((s) => s.setBootstrapped);

  useEffect(() => {
    const authorizationCode = sp.get("code");

    if (!authorizationCode) {
      toast.error("카카오 로그인 검증 실패");
      router.replace("/login");
      return;
    }

    sessionStorage.removeItem("kakao_oauth_state");

    let cancelled = false;

    (async () => {
      try {
        const data = await kakaoLogin({ authorizationCode });
        if (cancelled) return;

        const accessToken = data?.accessToken;

        if (!accessToken) {
          toast.error("accessToken이 응답에 없습니다.");
          router.replace("/login");
          return;
        }

        setAccessToken(accessToken);

        if (data?.user) {
          setUser({
            id: String(data.user.userId),
            status: data.user.status,
          });

        } else {
          try {
            const me = await getMe();

            if (cancelled) return;

            setUser(me ?? null);
          } catch {
            if (cancelled) return;

            setUser(null);
          }
        }

        setBootstrapped(true);

        if (data?.onboardingRequired) {
          router.replace("/onboarding/intro");
        } else {
          const next = sessionStorage.getItem("kakao_redirect_next");
          sessionStorage.removeItem("kakao_redirect_next");
          const redirectPath = getSafeRedirectPath(next);

          router.replace(redirectPath);
        }

        toast.success("로그인 성공");
      } catch (e) {
        if (cancelled) return;

        if (e instanceof ApiError) {
          toast.error(e.message);
        } else {
          toast.error("로그인 처리 중 오류가 발생했습니다.");
        }

        router.replace("/login");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sp, router, setAccessToken, setUser, setBootstrapped]);

  return (
    <div className="min-h-[calc(100vh-0px)] w-full flex flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-[var(--foundation-primary-500)]" />
    </div>
  );
}
