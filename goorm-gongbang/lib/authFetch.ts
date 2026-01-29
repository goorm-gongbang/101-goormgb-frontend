/* ===========================
    * authFetch 래퍼

    1. Authorization 헤더 자동 부착 Bearer
    2. 원 요청 1회 재시도
    3. refresh 실패 시 logout 진행
=========================== */

import { useAuthStore } from "@/stores/authStore";
import { refreshAccessToken } from "@/lib/auth";

let refreshPromise: Promise<string | null> | null = null; // refresh 중복 호출 방지용 (동시에 여러 요청이 401을 맞아도 refresh는 1번만)

/* refresh 1회 보장 함수 */
async function getRefreshedTokenOnce() {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const { accessToken } = useAuthStore.getState(); // zustand에서 accessToken 가져오기

  const headers = new Headers(init.headers); // 헤더 합치기
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`); // Authorization 헤더에 주입

  /* 1차 요청 */
  let res = await fetch(input, {
    ...init,
    headers,
    credentials: "include", // refreshToken Set-Cookie
    cache: "no-store",
  });

  if (res.status !== 401) return res; // 401(Unauthorized)만 accessToken 만료/무효로 보고 refresh ★서버 정책에 따라 조건 추가
 
  const newToken = await getRefreshedTokenOnce(); // 401이면 refresh 시도
  if (!newToken) { // refresh도 실패 → 로그인 만료로 간주
    useAuthStore.getState().logout(); // zustand 상태 초기화
    return res;
  }

  /* zustand 업데이트 */
  useAuthStore.getState().setAccessToken(newToken);

  /* 원 요청 1회 재시도 */
  const retryHeaders = new Headers(init.headers);
  retryHeaders.set("Authorization", `Bearer ${newToken}`);

  res = await fetch(input, {
    ...init,
    headers: retryHeaders,
    credentials: "include",
    cache: "no-store",
  });

  return res;
}
