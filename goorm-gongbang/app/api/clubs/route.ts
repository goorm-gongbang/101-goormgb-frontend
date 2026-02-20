// app/api/clubs/route.ts
import { NextResponse } from "next/server";

type ApiResponse<T> = {
  code: string;
  message: string;
  data: T;
};

type ApiClub = {
  clubId: number;
  koName: string;
  enName: string;
  logoImg: string;
  clubColor: string;
};

type TeamsPayload = {
  clubs: ApiClub[];
};

const MOCK_CLUBS: ApiClub[] = [
  {
    clubId: 1,
    koName: "두산 베어스",
    enName: "Doosan Bears",
    logoImg: "/doosan-bears.png",
    clubColor: "#121130",
  },
  {
    clubId: 2,
    koName: "삼성 라이온즈",
    enName: "Samsung Lions",
    logoImg: "samsung-lions.png",
    clubColor: "#0472C4",
  },
  {
    clubId: 3,
    koName: "키움 히어로즈",
    enName: "Kiwoom Heroes",
    logoImg: "kiwoom-heroes.png",
    clubColor: "#6C1126",
  },
  {
    clubId: 4,
    koName: "한화 이글스",
    enName: "Hanwha Eagles",
    logoImg: "hanwha-eagles.png",
    clubColor: "#E27032",
  },
  {
    clubId: 5,
    koName: "롯데 자이언츠",
    enName: "Lotte Giants",
    logoImg: "lotte-giants.png",
    clubColor: "#072C5A",
  },
  {
    clubId: 6,
    koName: "LG 트윈스",
    enName: "LG Twins",
    logoImg: "lg-twins.png",
    clubColor: "#A32C41",
  },
  {
    clubId: 7,
    koName: "NC 다이노스",
    enName: "NC Dinos",
    logoImg: "nc-dinos.png",
    clubColor: "#1C467D",
  },
  {
    clubId: 8,
    koName: "SSG 랜더스",
    enName: "SSG Landers",
    logoImg: "ssg-landers.png",
    clubColor: "#BB2F45",
  },
  {
    clubId: 9,
    koName: "kt 위즈",
    enName: "kt wiz",
    logoImg: "kt-wiz.png",
    clubColor: "#231F20",
  },
  {
    clubId: 10,
    koName: "KIA 타이거즈",
    enName: "KIA Tigers",
    logoImg: "kia-tigers.png",
    clubColor: "#A32425",
  },
];

function ok<T>(data: T, message = "구단 목록 조회 성공") {
  const body: ApiResponse<T> = { code: "OK", message, data };
  return NextResponse.json(body, { status: 200 });
}

function unauthorized(message = "인증이 필요합니다.") {
  const body: ApiResponse<null> = { code: "UNAUTHORIZED", message, data: null };
  return NextResponse.json(body, { status: 401 });
}

export async function GET(req: Request) {

  // ✅ 토큰 검증은 '임시 mock'이므로 여기서는 통과 처리
  // 실제로 검증하고 싶으면 아래처럼 환경변수로 간단 체크 가능:
  // const expected = process.env.MOCK_ACCESS_TOKEN;
  // if (expected && token !== expected) return unauthorized("토큰이 유효하지 않습니다.");

  return ok<TeamsPayload>({ clubs: MOCK_CLUBS });
}
