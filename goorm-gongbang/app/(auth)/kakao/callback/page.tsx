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

function maskToken(token: string | undefined) {
  if (!token) return null;
  return `${token.slice(0, 8)}...(${token.length})`;
}

export default function KakaoCallbackPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setUser = useAuthStore((s) => s.setUser);
  const setBootstrapped = useAuthStore((s) => s.setBootstrapped);

  useEffect(() => {
    const authorizationCode = sp.get("code");
    console.log("[KakaoCallback] authorizationCode exists:", !!authorizationCode);

    if (!authorizationCode) {
      toast.error("카카오 로그인 검증 실패");
      router.replace("/login");
      return;
    }

    sessionStorage.removeItem("kakao_oauth_state");
    console.log("[KakaoCallback] kakao_oauth_state removed");

    let cancelled = false;

    (async () => {
      try {
        const data = await kakaoLogin({ authorizationCode });
        console.log("[KakaoCallback] kakaoLogin response:", {
          accessToken: maskToken(data?.accessToken),
          onboardingRequired: data?.onboardingRequired,
          hasUser: !!data?.user,
          user: data?.user,
        });

        if (cancelled) return;

        const accessToken = data?.accessToken;
        console.log("[KakaoCallback] accessToken exists:", !!accessToken);

        if (!accessToken) {
          toast.error("accessToken이 응답에 없습니다.");
          router.replace("/login");
          return;
        }

        setAccessToken(accessToken);
        console.log("[KakaoCallback] accessToken saved:", maskToken(accessToken));

        if (data?.user) {
          setUser({
            id: String(data.user.userId),
            status: data.user.status,
          });
          console.log("[KakaoCallback] user saved from kakaoLogin:", {
            id: String(data.user.userId),
            status: data.user.status,
          });
        } else {
          try {
            console.log("[KakaoCallback] user missing. getMe start");
            const me = await getMe();

            if (cancelled) return;

            setUser(me ?? null);
            console.log("[KakaoCallback] user saved from getMe:", me);
          } catch {
            if (cancelled) return;

            setUser(null);
            console.log("[KakaoCallback] getMe failed. user saved as null");
          }
        }

        setBootstrapped(true);
        console.log("[KakaoCallback] bootstrapped saved as true");
        console.log("[KakaoCallback] auth store snapshot:", {
          accessToken: maskToken(useAuthStore.getState().accessToken ?? undefined),
          user: useAuthStore.getState().user,
          bootstrapped: useAuthStore.getState().bootstrapped,
        });

        if (data?.onboardingRequired) {
          console.log("[KakaoCallback] redirect:", "/onboarding/intro");
          router.replace("/onboarding/intro");
        } else {
          const next = sessionStorage.getItem("kakao_redirect_next");
          sessionStorage.removeItem("kakao_redirect_next");
          const redirectPath = getSafeRedirectPath(next);
          console.log("[KakaoCallback] kakao_redirect_next:", next);
          console.log("[KakaoCallback] redirect:", redirectPath);

          router.replace(redirectPath);
        }

        toast.success("로그인 성공");
      } catch (e) {
        if (cancelled) return;

        if (e instanceof ApiError) {
          console.log("[KakaoCallback] ApiError:", {
            status: e.status,
            message: e.message,
          });
          toast.error(e.message);
        } else {
          console.log("[KakaoCallback] unknown error:", e);
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
