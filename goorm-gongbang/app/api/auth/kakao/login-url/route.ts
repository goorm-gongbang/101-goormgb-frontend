// app/api/auth/kakao/login-url/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // ✅ 명세: redirectUri는 optional
  const redirectUri =
    searchParams.get("redirectUri") ??
    process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI ??
    "";

  const clientId = process.env.NEXT_PUBLIC_KAKAO_REST_KEY ?? "";

  if (!clientId) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "KAKAO clientId missing", data: null },
      { status: 400 }
    );
  }

  if (!redirectUri) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "redirectUri missing", data: null },
      { status: 400 }
    );
  }

  // ✅ 백엔드가 생성해서 내려주는 loginUrl (임시 mock)
  const loginUrl =
    "https://kauth.kakao.com/oauth/authorize" +
    `?response_type=code` +
    `&client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return NextResponse.json(
    {
      code: "OK",
      message: "조회 성공",
      data: { loginUrl },
    },
    { status: 200 }
  );
}
