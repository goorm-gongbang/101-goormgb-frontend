import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Mock: POST /api/kakao
 * body: { authorizationCode: string }
 *
 * - 성공: 200 + { accessToken, user, onboardingRequired } 응답
 * - refreshToken은 HttpOnly 쿠키로 Set-Cookie 처리 (Secure는 환경에 맞게)
 * - 실패 케이스도 명세처럼 400/403/500 흉내
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const authorizationCode = body?.authorizationCode;

    // 1) 기본 검증: code 누락/형식 오류 -> 400
    if (!authorizationCode || typeof authorizationCode !== "string") {
      return NextResponse.json(
        { code: "BAD_REQUEST", message: "authorizationCode 누락/형식 오류" },
        { status: 400 }
      );
    }

    // 2) 데모용 실패 분기 (테스트 편의)
    // - code에 특정 문자열이 포함되면 실패를 재현
    if (authorizationCode.includes("bad")) {
      return NextResponse.json(
        { code: "BAD_REQUEST", message: "카카오 토큰 검증 실패(모의)" },
        { status: 400 }
      );
    }

    if (authorizationCode.includes("deactive")) {
      return NextResponse.json(
        { code: "FORBIDDEN", message: "비활성화된 계정입니다.(모의)" },
        { status: 403 }
      );
    }

    if (authorizationCode.includes("boom")) {
      return NextResponse.json(
        { code: "INTERNAL_ERROR", message: "내부 처리 실패(모의)" },
        { status: 500 }
      );
    }

    // 3) 성공 응답 생성 (실제라면 여기서 카카오 토큰 교환/유저 조회를 했을 것)
    const mockUserId = 123;
    const accessToken = `mock-access-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const refreshToken = `mock-refresh-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    // 온보딩 필요 여부도 간단히 랜덤/조건 분기 가능
    const onboardingRequired = true; // 필요에 따라 false로 바꿔 테스트

    const res = NextResponse.json(
      {
        code: "OK",
        message: "로그인 성공(모의)",
        data: {
          accessToken,
          user: { userId: mockUserId, status: "ACTIVE" },
          onboardingRequired,
        },
      },
      { status: 200 }
    );

    // 4) Set-Cookie: refreshToken (HttpOnly)
    // - 개발 로컬(http)에서는 secure: false가 필요할 수 있음
    // - 운영(https)에서는 secure: true 권장
    const isProd = process.env.NODE_ENV === "production";

    res.cookies.set({
      name: "refreshToken",
      value: refreshToken,
      httpOnly: true,
      secure: isProd,        // 로컬 개발이면 false
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,  // 43200 seconds (12h)
    });

    return res;
  } catch (e) {
    console.error("[/api/kakao mock] error:", e);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "내부 처리 실패(Next mock)" },
      { status: 500 }
    );
  }
}
