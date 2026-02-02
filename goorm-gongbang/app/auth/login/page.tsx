"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { KakaoButton } from "@/components/login/KakaoButton";
import { toast } from "sonner"
import { nanoid } from "nanoid";
import { authFetch } from "@/lib/authFetch";

export default function LoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const { accessToken, user, bootstrapped } = useAuthStore();

  useEffect(() => {
    console.log("[Justand]", { accessToken, user, bootstrapped }); // ★ 배포 시 지워질 부분
  }, [accessToken, user, bootstrapped]);

  /* ===========================
      API REQUEST
  =========================== */
  /* 관리자 로그인 (임시) */
  const handleLogin = async () => {
    if (!loginId || !password) return;

    try {
      setLoading(true);

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
      const res = await fetch(`${API_BASE_URL}/api/login`, { // ★ 실제 API -> /auth/signup
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // refreshToken Set-Cookie
        body: JSON.stringify({ loginId, password }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("❌ LOGIN FAIL:", res.status, json);
        // 명세: 400 / 403 / 500
        if (res.status === 400) toast.error(json?.message ?? "아이디 또는 비밀번호 불일치");
        else if (res.status === 403) toast.error(json?.message ?? "비활성화된 계정입니다. 관리자에게 문의하세요.");
        else toast.error(json?.message ?? `로그인 실패 (HTTP ${res.status})`);

        return;
      }

      /* Server: { code, message, data: { accessToken, agreementRequired, onboardingRequired } } */
      console.log("✅ LOGIN SUCCESS:", json);
      toast(json?.message ?? "로그인 성공");

      /* AccessToken zustand에 삽입 */
      const accessToken = json?.data?.accessToken;
      accessToken ? setAccessToken(accessToken) : console.warn("⚠️ accessToken이 응답에 없습니다.");

      /* 유저 정보 가져오기 /api/me */
      if (accessToken) {
        const meRes = await authFetch(`${API_BASE_URL}/api/me`); // ★ 추후 실제 api 문서에 맞게 변경해야함.
        if (meRes.ok) {
          const meJson = await meRes.json().catch(() => null);
          const user = meJson?.data ?? null;
          useAuthStore.getState().setUser(user);
        } else {
          useAuthStore.getState().setUser(null);
        }
      }

      const agreementRequired = Boolean(json?.data?.agreementRequired);
      const onboardingRequired = Boolean(json?.data?.onboardingRequired);

      if (agreementRequired) {
        router.push("/auth/login"); // 약관 동의 하지 않았을 경우 -> 로그인
        return;
      }

      if (onboardingRequired) {
        router.push("/onboarding"); // 온보딩 페이지로 이동
        return;
      }

      router.push("/"); // 둘다 아닌 경우

    } catch (e) { console.error("⚠️ LOGIN ERROR:", e); return; }
    finally { setLoading(false); }
  };

  /* 카카오 소셜 로그인 */
  const handleKakaoLogin = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

      const res = await fetch(
        `${API_BASE_URL}/api/auth/kakao/login-url`, // 이부분 실제 api url로 수정 /auth/kakao/login-url ★
        {
          method: "GET",
          credentials: "include",
          headers: { "Accept": "application/json" },
        }
      );

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("❌ kakao login-url failed:", res.status, json);
        return;
      }

      const loginUrl: string | undefined = json?.data?.loginUrl;
      if (!loginUrl) {
        console.error("❌ loginUrl missing:", json);
        return;
      }

      /* url 이동 */
      window.location.href = loginUrl;
    } catch (e) { console.error("⚠️ kakao login-url error:", e); }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Center container */}
      <div className="mx-auto flex min-h-screen w-full items-center justify-center px-4 py-10 sm:px-6">
        {/* Card */}
        <section
          className="
            w-full max-w-md
            rounded-2xl bg-white
            px-6 py-8
            sm:max-w-[480px] sm:px-10
            md:px-10
            lg:px-10
          "
        >
          <div className="flex flex-col items-center gap-10 sm:gap-14 md:gap-16">
            {/* Header */}
            <div className="flex w-full flex-col items-center gap-4">
              {/* Logo */}
              <div className="flex w-full justify-center">
                <div className="inline-flex h-14 w-32 items-center justify-center gap-2 bg-gray-200 p-2 sm:h-16 sm:w-36">
                  <div className="text-center text-xs font-bold leading-5 tracking-tight text-black">
                    로고
                  </div>
                </div>
              </div>

              {/* Title / Description */}
              <div className="flex w-full flex-col items-center justify-center gap-2">
                <h1 className="w-full text-center text-lg font-bold leading-7 text-[var(--foundation-neutral-black)] sm:text-xl">
                  로그인 / 회원가입
                </h1>
                <p className="w-full text-center text-sm font-normal leading-6 text-[var(--foundation-neutral-black)] sm:text-base">
                  간편 로그인으로 <br />
                  더 쉽게, 더 많은 경기를 관람해보세요.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="flex w-full flex-col gap-2.5 sm:gap-3">
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
                type="button"
                onClick={handleLogin}
                disabled={loading || !loginId || !password}
                className="
                  mt-1 h-11 w-full rounded-md
                  text-sm font-semibold text-[var(--foundation-neutral-40)]
                  hover:bg-[var(--foundation-neutral-960)]
                  active:scale-[0.99]
                  disabled:cursor-not-allowed disabled:opacity-50
                  cursor-pointer
                "
              >
                {loading ? "로그인 중..." : "로그인"}
              </button>

              {/* Kakao */}
              <KakaoButton onClick={handleKakaoLogin} bgVariant="kakao" contentPadding="6" />
            </div>

            {/* Terms */}
            <div className="w-full px-2 text-center text-[11px] font-medium leading-4 sm:text-xs">
              <span className="text-[var(--foundation-neutral-560)]">
                해당 계정을 통해 표고에 로그인함으로써 <br />
              </span>
              <Link
                href="/terms/privacy"
                className="text-[var(--foundation-blue-500)] hover:underline"
              >
                개인정보 수집·이용
              </Link>
              <span className="text-[var(--foundation-neutral-560)]"> 및 </span>
              <Link
                href="/terms/service"
                className="text-[var(--foundation-blue-500)] hover:underline"
              >
                이용약관
              </Link>
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
