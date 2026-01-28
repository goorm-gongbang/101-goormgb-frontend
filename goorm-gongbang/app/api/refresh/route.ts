import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies(); // ✅ await 추가
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { code: "UNAUTHORIZED", message: "refreshToken 없음" },
      { status: 401 }
    );
  }

  return NextResponse.json(
    {
      code: "OK",
      message: "재발급 성공",
      data: { accessToken: "access-token-refreshed-" + Date.now() },
    },
    { status: 200 }
  );
}
