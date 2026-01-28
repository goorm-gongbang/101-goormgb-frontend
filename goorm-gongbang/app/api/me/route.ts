import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const hasBearer = auth.startsWith("Bearer ");

  if (!hasBearer) {
    return NextResponse.json(
      { code: "UNAUTHORIZED", message: "토큰 없음" },
      { status: 401 }
    );
  }

  return NextResponse.json(
    {
      code: "OK",
      message: "조회 성공",
      data: { id: "u_1", status: "ACTIVE" },
    },
    { status: 200 }
  );
}
