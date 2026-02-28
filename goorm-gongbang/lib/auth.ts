/* ===========================
    * HttpOnly refresh 쿠키를 이용해서
      /api/refresh에 POST -> 새 accessToken을 JSON으로 받음.

    * NOTE: 이 파일은 @/lib/services/auth-guard.service.ts로 통합되었습니다.
      기존 코드 호환성을 위해 유지되지만, 새 코드는 @/lib/services를 사용하세요.
=========================== */

import { API_BASE_URL } from "@/lib/api/config";

export type RefreshResponse = {
  code: string;
  message: string;
  data: { accessToken: string };
};

export async function refreshAccessToken(): Promise<string | null> {
  const res = await fetch(`${API_BASE_URL}/auth/token/refresh`, {
    method: "POST",
    credentials: "include", // refreshToken Set-Cookie
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as RefreshResponse | null;

  console.log("[refresh] status:", res.status, "body:", json);

  if (!res.ok) return null;
  return json?.data?.accessToken ?? null;
}
