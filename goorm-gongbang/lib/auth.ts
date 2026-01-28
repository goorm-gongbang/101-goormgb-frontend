/* ===========================
    * HttpOnly refresh 쿠키를 이용해서 
      /api/refresh에 POST -> 새 accessToken을 JSON으로 받음.
=========================== */

export type RefreshResponse = {
  code: string;
  message: string;
  data: { accessToken: string };
};

export async function refreshAccessToken(): Promise<string | null> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
  const res = await fetch(`${API_BASE_URL}/api/refresh`, { // ★ 추후 /auth/token/refresh 변경
    method: "POST",
    credentials: "include", // refreshToken Set-Cookie
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as RefreshResponse | null;

  console.log("[refresh] status:", res.status, "body:", json); // ★운영환경에서는 제거
  
  if (!res.ok) return null;
  return json?.data?.accessToken ?? null;
}
