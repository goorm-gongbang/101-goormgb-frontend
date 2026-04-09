"use client";

import { useAuthStore } from "@/stores/authStore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { KakaoButton } from "@/components/login/KakaoButton";
import { toast } from "sonner";
import { login, getMe, getKakaoLoginUrl } from "@/lib/services";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const { accessToken, user, bootstrapped } = useAuthStore();
  const [hideLogin, setHideLogin] = useState(true);

  useEffect(() => {
    const NEXT_PUBLIC_ENV = process.env.NEXT_PUBLIC_ENV ?? "";
    if (NEXT_PUBLIC_ENV === "staging/prod") {
      setHideLogin(false);
    } else if (NEXT_PUBLIC_ENV === "dev") {
      setHideLogin(true);
    } else {
      setHideLogin(false);
    }
  }, [accessToken, user, bootstrapped]);

  /* ---------------------------
     관리자 로그인 (ID/PW)
  --------------------------- */
  const handleLogin = async () => {
    if (!loginId || !password) return;

    try {
      setLoading(true);

      const data = await login({ loginId, password });
      toast("로그인 성공");

      const token = data?.accessToken;
      if (token) {
        setAccessToken(token);

        // 유저 정보 가져오기
        try {
          const meData = await getMe();
          useAuthStore.getState().setUser(meData ?? null);
        } catch {
          useAuthStore.getState().setUser(null);
        }
      } else {
        console.warn("⚠️ accessToken이 응답에 없습니다.");
      }

      // const agreementRequired = Boolean(data?.agreementRequired); 현재는 안쓰이지만 나중에 쓰일 수 있음.
      const onboardingRequired = Boolean(data?.onboardingRequired);

      // if (agreementRequired) {
      //   router.push("/login");
      //   return;
      // }

      if (onboardingRequired) {
        router.push("/onboarding/intro");
        return;
      }

      router.push("/");
    } catch (e) {
      if (e instanceof ApiError) {
        console.error("❌ LOGIN FAIL:", e.status, e.message);
        toast.error(e.message);
      } else {
        console.error("⚠️ LOGIN ERROR:", e);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------
     카카오 소셜 로그인
  --------------------------- */
  const handleKakaoLogin = async () => {
    try {
      const data = await getKakaoLoginUrl();
      const loginUrl = data?.loginUrl;

      if (!loginUrl) {
        console.error("❌ loginUrl missing:", data);
        return;
      }

      window.location.href = loginUrl;
    } catch (e) {
      if (e instanceof ApiError) {
        console.error("❌ kakao login-url failed:", e.status, e.message);
      } else {
        console.error("⚠️ kakao login-url error:", e);
      }
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen w-full items-center justify-center px-4 py-10 sm:px-6">
        <section className="w-full max-w-md rounded-2xl bg-white px-6 py-8 sm:max-w-[480px] sm:px-10 md:px-10 lg:px-10">
          <div className="flex flex-col items-center gap-10 sm:gap-14 md:gap-16">
            {/* Header */}
            <div className="flex w-full flex-col items-center gap-4">
              <div className="flex w-full justify-center">
                <div className="inline-flex h-14 w-32 items-center justify-center gap-2 p-2 sm:h-16 sm:w-36">
                  <div className="text-center text-xs font-bold leading-5 tracking-tight text-black">
                    <img src="/logo.png" alt="logo" />
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-col items-center justify-center gap-2">
                <h1 className="w-full text-center text-lg font-bold leading-7 text-[var(--foundation-neutral-black)] sm:text-xl">
                  로그인 / 회원가입
                </h1>
                <p className="w-full text-center text-sm font-normal leading-6 text-[var(--foundation-neutral-black)] sm:text-base">
                  간편 로그인으로 <br />더 쉽게, 더 많은 경기를 관람해보세요.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="flex w-full flex-col gap-2.5 sm:gap-3">
              {hideLogin ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleLogin();
                  }}
                >
                  <Input
                    placeholder="아이디 입력"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    className="h-11"
                  />
                  <Input
                    type="password"
                    placeholder="비밀번호 입력"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11"
                  />
                  <button
                    type="submit"
                    disabled={loading || !loginId || !password}
                    className="mt-1 h-11 w-full rounded-md text-sm font-semibold text-[var(--foundation-neutral-40)] hover:bg-[var(--foundation-neutral-960)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? "로그인 중..." : "로그인"}
                  </button>
                </form>

              ) : null}

              <KakaoButton
                onClick={handleKakaoLogin}
                bgVariant="kakao"
                contentPadding="6"
              />
            </div>

            {/* Terms */}
            <div className="w-full px-2 text-center text-[11px] font-medium leading-4 sm:text-xs">
              <span className="text-[var(--foundation-neutral-560)]">
                해당 계정을 통해 표고에 로그인함으로써 <br />
              </span>
              <span className="text-[var(--foundation-blue-500)]">
                개인정보 수집·이용
              </span>
              <span className="text-[var(--foundation-neutral-560)]"> 및 </span>
              <span className="text-[var(--foundation-blue-500)]">
                이용약관
              </span>
              <span className="text-[var(--foundation-neutral-560)]">
                에 동의하는 것으로 간주됩니다.
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
