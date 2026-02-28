/* ===========================
   Auth-Guard Service
   - 인증 관련 API 호출
   - Backend: Auth-Guard 서비스
=========================== */

import { API_BASE_URL } from "@/lib/api/config";
import type {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  KakaoLoginRequest,
  KakaoLoginResponse,
} from "@/lib/types";

// Re-export types for convenience
export type { LoginRequest, LoginResponse, RefreshResponse, KakaoLoginRequest, KakaoLoginResponse };

/* ---------------------------
   로그인 (ID/PW)
--------------------------- */
export async function login(body: LoginRequest): Promise<Response> {
  return fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
    cache: "no-store",
  });
}

/* ---------------------------
   로그아웃
--------------------------- */
export async function logout(): Promise<Response> {
  return fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  });
}

/* ---------------------------
   토큰 Refresh
--------------------------- */
export async function refreshAccessToken(): Promise<string | null> {
  const res = await fetch(`${API_BASE_URL}/auth/token/refresh`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as RefreshResponse | null;

  if (!res.ok) return null;
  return json?.data?.accessToken ?? null;
}

/* ---------------------------
   카카오 OAuth 로그인
--------------------------- */
export async function kakaoLogin(body: KakaoLoginRequest): Promise<Response> {
  return fetch(`${API_BASE_URL}/auth/kakao`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
    cache: "no-store",
  });
}

/* ---------------------------
   내 정보 조회
--------------------------- */
export async function getMe(accessToken: string): Promise<Response> {
  return fetch(`${API_BASE_URL}/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
    cache: "no-store",
  });
}
