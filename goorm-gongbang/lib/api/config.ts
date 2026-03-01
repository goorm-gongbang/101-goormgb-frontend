/* ===========================
   API Configuration
   - 모든 API 호출의 base URL을 중앙에서 관리
=========================== */

import { useAuthStore } from "@/stores/authStore";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/* CDN URLs */
export const CDN_CLUBS_BASE_URL = process.env.NEXT_PUBLIC_CDN_CLUBS_BASE_URL ?? "";

/* ===========================
   Authenticated Fetch
   - 자동으로 accessToken을 헤더에 추가
   - TODO: 나중에 백엔드에서 permitAll 설정하면 authFetch 대신 일반 fetch 사용
=========================== */
export function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const accessToken = useAuthStore.getState().accessToken;

  const headers: HeadersInit = {
    ...options.headers,
  };

  if (accessToken) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${accessToken}`;
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });
}
