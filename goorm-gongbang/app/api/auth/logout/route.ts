import { NextResponse } from "next/server";

/** =========================
 * Mock "Redis" (in-memory)
 * key: refreshToken
 * value: { accessToken, createdAt }
 ========================= */
declare global {
  // eslint-disable-next-line no-var
  var __REFRESH_TOKEN_MOCK__: Map<
    string,
    { accessToken: string; createdAt: string }
  > | undefined;
}

function getStore() {
  if (!global.__REFRESH_TOKEN_MOCK__) {
    global.__REFRESH_TOKEN_MOCK__ = new Map();
  }
  return global.__REFRESH_TOKEN_MOCK__;
}

/** =========================
 * Helpers
 ========================= */
function jsonError(status: number, message: string, code = "UNAUTHORIZED") {
  return NextResponse.json({ code, message, data: null }, { status });
}

function getBearerToken(req: Request) {
  const auth = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!auth) return null;
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  return m[1].trim();
}

function getCookie(req: Request, name: string) {
  const cookie = req.headers.get("cookie") || "";
  const parts = cookie.split(";").map((v) => v.trim());
  const found = parts.find((p) => p.startsWith(name + "="));
  if (!found) return null;
  return decodeURIComponent(found.slice(name.length + 1));
}

function buildDeleteCookie(name: string) {
  const isProd = process.env.NODE_ENV === "production";
  // 명세: 쿠키 삭제(예: Max-Age=0)
  return [
    `${name}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    // prod에서만 Secure 권장 (http 로컬에서 Secure면 쿠키가 안 박힐 수 있음)
    isProd ? "Secure" : "",
    "Max-Age=0",
  ]
    .filter(Boolean)
    .join("; ");
}

/** =========================
 * POST /api/auth/logout (MOCK)
 ========================= */
export async function POST(req: Request) {
  // 1) Authorization 체크
  const accessToken = getBearerToken(req);
  if (!accessToken) {
    return jsonError(401, "인증 실패 (Access Token 없음/만료)");
  }

  // 2) refreshToken 쿠키 읽기 (권장 입력)
  const refreshToken = getCookie(req, "refreshToken");

  // 3) (mock) Redis에서 refreshToken 폐기
  if (refreshToken) {
    const store = getStore();
    store.delete(refreshToken);
  }

  // 4) 응답 + 쿠키 삭제
  const res = NextResponse.json(
    {
      code: "OK",
      message: "로그아웃 완료",
      data: null,
    },
    { status: 200 }
  );

  res.headers.append("Set-Cookie", buildDeleteCookie("refreshToken"));

  return res;
}
