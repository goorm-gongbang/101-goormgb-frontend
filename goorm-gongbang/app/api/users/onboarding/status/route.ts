// app/api/users/onboarding/status/route.ts
import { NextResponse } from "next/server";

type OkResponse = {
  code: "OK";
  message: string;
  data: {
    onboardingStatus: boolean;
    onboardingCompletedAt: string | null;
  };
};

type ErrorResponse = {
  code: "UNAUTHORIZED" | "FORBIDDEN";
  message: string;
};

function json<T>(body: T, status = 200) {
  return NextResponse.json(body, { status });
}

export async function GET(req: Request) {
  // 1) Authorization 헤더 확인
  const auth = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    const body: ErrorResponse = {
      code: "UNAUTHORIZED",
      message: "인증 실패(토큰 없음/만료)",
    };
    return json(body, 401);
  }

  const token = auth.slice("Bearer ".length).trim();
  if (!token) {
    const body: ErrorResponse = {
      code: "UNAUTHORIZED",
      message: "인증 실패(토큰 없음/만료)",
    };
    return json(body, 401);
  }

  // 2) 계정 상태가 DEACTIVE인 케이스를 임시로 토큰 값으로 구분
  //    예: Authorization: Bearer deactive
  if (token === "deactive") {
    const body: ErrorResponse = {
      code: "FORBIDDEN",
      message: "계정 상태가 DEACTIVE 입니다.",
    };
    return json(body, 403);
  }

  // 3) 온보딩 상태(임시): query로 바꿔서 테스트 가능하게
  //    예: /api/users/onboarding/status?done=true
  const url = new URL(req.url);
  const done = url.searchParams.get("done"); // "true" | "false" | null

  const onboardingStatus = done === "true" ? true : false;

  const body: OkResponse = {
    code: "OK",
    message: "조회 성공",
    data: {
      onboardingStatus,
      onboardingCompletedAt: onboardingStatus ? new Date().toISOString() : null,
    },
  };

  return json(body, 200);
}
