/* ===========================
   API Fetch Utilities
   - authFetch: 인증 필요한 API (401시 자동 refresh 재시도)
   - publicFetch: 인증 불필요한 API
=========================== */

import { useAuthStore } from "@/stores/authStore";

// 공통 기본 설정
const baseConfig: RequestInit = {
  credentials: "include",
  cache: "no-store",
};

/* ---------------------------
   타입 정의
--------------------------- */
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type FetchOptions<T = unknown> = Omit<RequestInit, "body" | "method"> & {
  method?: HttpMethod;
  body?: T;
};

// refresh 중복 호출 방지용 (동시에 여러 요청이 401을 맞아도 refresh는 1번만)
let refreshPromise: Promise<string | null> | null = null;

/* ---------------------------
   토큰 Refresh (내부용)
--------------------------- */
async function refreshAccessToken(): Promise<string | null> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

  const res = await fetch(`${API_BASE_URL}/auth/token/refresh`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) return null;
  return json?.data?.accessToken ?? null;
}

/* ---------------------------
   refresh 1회 보장 함수
--------------------------- */
async function getRefreshedTokenOnce(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/* ---------------------------
   요청 빌더 헬퍼
   - body가 object면 자동 JSON.stringify + Content-Type 설정
--------------------------- */
function buildRequest<T>(init: FetchOptions<T>): RequestInit {
  const { body, ...rest } = init;
  const headers = new Headers(rest.headers);

  let processedBody: BodyInit | undefined;

  if (body !== undefined) {
    // body가 object면 JSON stringify
    if (typeof body === "object" && body !== null) {
      processedBody = JSON.stringify(body);
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
    } else {
      processedBody = body as BodyInit;
    }
  }

  return {
    ...rest,
    headers,
    body: processedBody,
  };
}

/* ---------------------------
   인증 필요한 API
   - Authorization 헤더 자동 부착
   - body가 object면 자동 JSON.stringify
   - 401시 refresh 후 1회 재시도
   - refresh 실패시 logout
--------------------------- */
export async function authFetch<T = unknown>(
  input: RequestInfo | URL,
  init: FetchOptions<T> = {}
): Promise<Response> {
  const { accessToken } = useAuthStore.getState();
  const request = buildRequest(init);
  const headers = request.headers as Headers;

  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  // 1차 요청
  let res = await fetch(input, {
    ...baseConfig,
    ...request,
  });

  // 401이 아니면 그대로 반환
  if (res.status !== 401) return res;

  // 401이면 refresh 시도
  const newToken = await getRefreshedTokenOnce();
  if (!newToken) {
    // refresh 실패 → 로그아웃
    useAuthStore.getState().logout();
    return res;
  }

  // zustand 업데이트
  useAuthStore.getState().setAccessToken(newToken);

  // 원 요청 1회 재시도
  const retryRequest = buildRequest(init);
  const retryHeaders = retryRequest.headers as Headers;
  retryHeaders.set("Authorization", `Bearer ${newToken}`);

  res = await fetch(input, {
    ...baseConfig,
    ...retryRequest,
  });

  return res;
}

/* ---------------------------
   인증 불필요한 API (public)
   - body가 object면 자동 JSON.stringify
--------------------------- */
export function publicFetch<T = unknown>(
  input: RequestInfo | URL,
  init: FetchOptions<T> = {}
): Promise<Response> {
  const request = buildRequest(init);

  return fetch(input, {
    ...baseConfig,
    ...request,
  });
}

/* ===========================
   Method 헬퍼 (auth)
   - auth.get(url)
   - auth.post(url, body)
   - auth.put(url, body)
   - auth.patch(url, body)
   - auth.delete(url)
=========================== */
export const auth = {
  get: (url: string) => authFetch(url, { method: "GET" }),

  post: <T = unknown>(url: string, body?: T) =>
    authFetch(url, { method: "POST", body }),

  put: <T = unknown>(url: string, body?: T) =>
    authFetch(url, { method: "PUT", body }),

  patch: <T = unknown>(url: string, body?: T) =>
    authFetch(url, { method: "PATCH", body }),

  delete: (url: string) => authFetch(url, { method: "DELETE" }),
};

/* ===========================
   Method 헬퍼 (public)
   - pub.get(url)
   - pub.post(url, body)
   - pub.put(url, body)
   - pub.patch(url, body)
   - pub.delete(url)
=========================== */
export const pub = {
  get: (url: string) => publicFetch(url, { method: "GET" }),

  post: <T = unknown>(url: string, body?: T) =>
    publicFetch(url, { method: "POST", body }),

  put: <T = unknown>(url: string, body?: T) =>
    publicFetch(url, { method: "PUT", body }),

  patch: <T = unknown>(url: string, body?: T) =>
    publicFetch(url, { method: "PATCH", body }),

  delete: (url: string) => publicFetch(url, { method: "DELETE" }),
};
