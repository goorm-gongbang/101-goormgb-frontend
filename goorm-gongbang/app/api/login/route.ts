import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const loginId = body?.loginId;
  const password = body?.password;

  // 실패 케이스 흉내
  if (!loginId || !password) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "아이디 또는 비밀번호 불일치" },
      { status: 400 }
    );
  }

  if (loginId === "deactive") {
    return NextResponse.json(
      { code: "FORBIDDEN", message: "계정이 비활성화(DEACTIVE) 상태입니다." },
      { status: 403 }
    );
  }

  if (password !== "1234") {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "아이디 또는 비밀번호가 일치하지 않습니다." },
      { status: 400 }
    );
  }

  // ✅ 5분 뒤 만료되는 "모의 accessToken" 발급
  const expiresInMs = 5 * 60 * 1000; // 5분
  const exp = Date.now() + expiresInMs;
  const accessToken = `mock.${exp}`; // 예: mock.1737950000000

  // 성공: refreshToken 쿠키(HTTPOnly) + accessToken 응답 바디
  const res = NextResponse.json(
    {
      code: "OK",
      message: "로그인 성공",
      data: {
        accessToken,
        agreementRequired: false,
        onboardingRequired: true,
      },
    },
    { status: 200 }
  );

  res.cookies.set("refreshToken", "refresh-token-mock", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return res;
}
