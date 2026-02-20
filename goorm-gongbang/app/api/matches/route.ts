import { NextResponse } from "next/server";

/* ===========================
   RESPONSE SHAPE
=========================== */
type ApiResponse<T> = { code: string; message: string; data: T };

type ApiClub = {
  clubId: number;
  koName: string;
  enName: string;
  logoImg: string;
};

type Stadium = {
  stadiumId: number;
  koName: string;
  enName: string;
};

type SaleStatus = "ON_SALE" | "UPCOMING" | "SOLD_OUT" | "ENDED";

type ApiMatch = {
  matchId: number;
  matchAt: string; // "YYYY-MM-DDTHH:mm:ss"
  saleStatus: SaleStatus;
  salesOpenAt: string; // 경기 7일전 오전 11시 (ISO-8601, timezone 없이)
  homeClub: ApiClub;
  awayClub: ApiClub;
  stadium: Stadium;
};

type MatchesPayload = {
  date: string; // YYYY-MM-DD
  matchCount: number;
  matches: ApiMatch[];
};

/* ===========================
   HELPERS
=========================== */
// function requireBearer(req: Request) {
//   const auth = req.headers.get("authorization") ?? "";
//   const m = auth.match(/^Bearer\s+(.+)$/i);
//   return m?.[1]?.trim() ?? null;
// }

function json<T>(status: number, body: ApiResponse<T>) {
  return NextResponse.json(body, { status });
}

function isValidYmd(s: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

function toYmdLocal(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isPastDate(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  const reqDay = new Date(y, m - 1, d);
  reqDay.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return reqDay < today;
}

// 경기 7일 전 오전 11시 -> "YYYY-MM-DDT11:00:00"
function calcSalesOpenAt(matchAtIsoLocal: string) {
  // matchAtIsoLocal: "YYYY-MM-DDTHH:mm:ss"
  const [datePart] = matchAtIsoLocal.split("T");
  const [y, m, d] = datePart.split("-").map(Number);

  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 7);
  dt.setHours(11, 0, 0, 0);

  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T11:00:00`;
}

/* ===========================
   MOCK DATA
=========================== */
function makeMockMatches(date: string): ApiMatch[] {
  const matchAt = `${date}T18:30:00`;
  const salesOpenAt = calcSalesOpenAt(matchAt);

  return [
    {
      matchId: 101,
      matchAt,
      saleStatus: "ON_SALE",
      salesOpenAt,
      homeClub: { clubId: 1, koName: "LG 트윈스", enName: "LG Twins", logoImg: "lg-twins.png" },
      awayClub: { clubId: 2, koName: "두산 베어스", enName: "Doosan Bears", logoImg: "doosan-bears.png" },
      stadium: { stadiumId: 3, koName: "잠실야구장", enName: "Jamsil Baseball Stadium" },
    },
    {
      matchId: 102,
      matchAt,
      saleStatus: "ON_SALE",
      salesOpenAt,
      homeClub: { clubId: 1, koName: "LG 트윈스", enName: "LG Twins", logoImg: "lg-twins.png" },
      awayClub: { clubId: 2, koName: "두산 베어스", enName: "Doosan Bears", logoImg: "doosan-bears.png" },
      stadium: { stadiumId: 3, koName: "잠실야구장", enName: "Jamsil Baseball Stadium" },
    },
    {
      matchId: 103,
      matchAt,
      saleStatus: "UPCOMING",
      salesOpenAt,
      homeClub: { clubId: 4, koName: "한화 이글스", enName: "Hanwha Eagles", logoImg: "hanwha-eagles.png" },
      awayClub: { clubId: 5, koName: "롯데 자이언츠", enName: "Lotte Giants", logoImg: "lotte-giants.png" },
      stadium: { stadiumId: 5, koName: "한화생명 이글스파크", enName: "Hanwha Life Eagles Park" },
    },
    {
      matchId: 104,
      matchAt,
      saleStatus: "SOLD_OUT",
      salesOpenAt,
      homeClub: { clubId: 8, koName: "SSG 랜더스", enName: "SSG Landers", logoImg: "ssg-landers.png" },
      awayClub: { clubId: 9, koName: "kt 위즈", enName: "kt wiz", logoImg: "kt-wiz.png" },
      stadium: { stadiumId: 8, koName: "인천SSG랜더스필드", enName: "Incheon SSG Landers Field" },
    },
    {
      matchId: 105,
      matchAt,
      saleStatus: "ENDED",
      salesOpenAt,
      homeClub: { clubId: 8, koName: "SSG 랜더스", enName: "SSG Landers", logoImg: "ssg-landers.png" },
      awayClub: { clubId: 9, koName: "kt 위즈", enName: "kt wiz", logoImg: "kt-wiz.png" },
      stadium: { stadiumId: 8, koName: "인천SSG랜더스필드", enName: "Incheon SSG Landers Field" },
    },
  ];
}

/* ===========================
   ROUTE
=========================== */
export async function GET(req: Request) {
  // const token = requireBearer(req);
  // if (!token) {
  //   return json<null>(401, {
  //     code: "UNAUTHORIZED",
  //     message: "Authorization: Bearer <accessToken> 헤더가 필요합니다.",
  //     data: null,
  //   });
  // }

  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");

  const date = dateParam ?? toYmdLocal(new Date());

  if (!isValidYmd(date)) {
    return json<null>(400, {
      code: "INVALID_DATE_FORMAT",
      message: "날짜 형식이 올바르지 않습니다. YYYY-MM-DD 형식으로 입력해주세요.",
      data: null,
    });
  }

  if (isPastDate(date)) {
    return json<null>(400, {
      code: "PAST_DATE_NOT_ALLOWED",
      message: "오늘 이전 날짜는 조회할 수 없습니다.",
      data: null,
    });
  }

  const matches = makeMockMatches(date);

  return json<MatchesPayload>(200, {
    code: "OK",
    message: "경기 목록 조회 성공",
    data: {
      date,
      matchCount: matches.length,
      matches,
    },
  });
}
