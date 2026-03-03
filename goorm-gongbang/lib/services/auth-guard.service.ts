/* ===========================
   Auth-Guard Service
   - 인증 관련 API 호출
   - Backend: Auth-Guard 서비스
=========================== */

import { API_BASE_URL } from "@/lib/api/config";
import { auth, pub } from "@/lib/api/fetch";
import { ApiError } from "@/lib/api/error";
import type {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  KakaoLoginRequest,
  KakaoLoginResponse,
  User,
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
  pub.post<LoginResponse, LoginRequest>(`${API_BASE_URL}/auth/dev/auth/login`, body);

/* 로그아웃 */
export const logout = () =>
  pub.post<void>(`${API_BASE_URL}/auth/logout`);

/* 토큰 Refresh */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const data = await pub.post<RefreshResponse>(`${API_BASE_URL}/auth/token/refresh`);
    return data?.data?.accessToken ?? null;
  } catch (e) {
    if (e instanceof ApiError) return null;
    throw e;
  }
}

/* 카카오 OAuth 로그인 */
export const kakaoLogin = (body: KakaoLoginRequest) =>
  pub.post<KakaoLoginResponse>(`${API_BASE_URL}/auth/kakao/login`, { authorizationCode: body.code });

/* 카카오 로그인 URL 조회 */
export const getKakaoLoginUrl = () =>
  pub.get<{ loginUrl: string }>(`${API_BASE_URL}/auth/kakao/login-url`);

/* 내 정보 조회 (/auth/me) */
export const getMe = () =>
  auth.get<User | null>(`${API_BASE_URL}/auth/me`);
