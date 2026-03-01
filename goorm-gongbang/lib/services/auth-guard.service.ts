/* ===========================
   Auth-Guard Service
   - 인증 관련 API 호출
   - Backend: Auth-Guard 서비스
=========================== */

import { API_BASE_URL } from "@/lib/api/config";
import { auth, pub } from "@/lib/api/fetch";
import type {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  KakaoLoginRequest,
  KakaoLoginResponse,
} from "@/lib/types";

// Re-export types for convenience
export type {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  KakaoLoginRequest,
  KakaoLoginResponse,
};

/* 로그인 (ID/PW) */
export const login = (body: LoginRequest) =>
  pub.post(`${API_BASE_URL}/auth/dev/auth/login`, body);

/* 로그아웃 */
export const logout = () =>
  pub.post(`${API_BASE_URL}/auth/logout`);

/* 토큰 Refresh */
export async function refreshAccessToken(): Promise<string | null> {
  const res = await pub.post(`${API_BASE_URL}/auth/token/refresh`);
  const json = (await res.json().catch(() => null)) as RefreshResponse | null;
  if (!res.ok) return null;
  return json?.data?.accessToken ?? null;
}

/* 카카오 OAuth 로그인 */
export const kakaoLogin = (body: KakaoLoginRequest) =>
  pub.post(`${API_BASE_URL}/auth/kakao/login`, { authorizationCode: body.code });

/* 카카오 로그인 URL 조회 */
export const getKakaoLoginUrl = () =>
  pub.get(`${API_BASE_URL}/auth/kakao/login-url`);

/* 내 정보 조회 (NOTE: 백엔드에 /auth/me 엔드포인트 필요) */
export const getMe = () =>
  auth.get(`${API_BASE_URL}/auth/me`);
