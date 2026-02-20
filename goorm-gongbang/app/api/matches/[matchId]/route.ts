import { NextResponse } from "next/server";

type SaleStatus = "ON_SALE" | "UPCOMING" | "SOLD_OUT" | "ENDED";
type PurchaseStatus = "PURCHASABLE" | "NOT_PURCHASABLE";

type Club = {
  clubId: number;
  koName: string;
  enName: string;
  logoImg: string;
  clubColor: string;
};

type MatchGuide = {
  teamsDisplay: string;
  ageLimit: string;
  placeDisplay: string;
  addressDisplay: string;
  datetimeDisplay: string;
  purchaseStatus: PurchaseStatus;
  matchDdayLabel: string; // "D-1", "D-DAY"...
};

type MatchDetail = {
  matchId: number;
  matchAt: string; // ISO-8601
  saleStatus: SaleStatus;
  homeClub: Club;
  awayClub: Club;
  matchGuide: MatchGuide;
};

type ApiResponse<T> = {
  code: string;
  message: string;
  data: T | null;
};

/** ===== Mock DB ===== */
const MOCK_MATCHES: Record<number, Omit<MatchDetail, "matchGuide"> & { stadium?: never }> =
  {
    101: {
      matchId: 101,
      matchAt: "2026-02-21T00:40:00",
      saleStatus: "ON_SALE",
      homeClub: {
        clubId: 6,
        koName: "LG 트윈스",
        enName: "LG Twins",
        logoImg: "lg-twins.png",
        clubColor: "#A32C41",
      },
      awayClub: {
        clubId: 9,
        koName: "kt 위즈",
        enName: "kt wiz",
        logoImg: "kt-wiz.png",
        clubColor: "#231F20",
      },
    },
    102: {
      matchId: 102,
      matchAt: "2026-03-30T18:30:00",
      saleStatus: "UPCOMING",
      homeClub: {
        clubId: 6,
        koName: "LG 트윈스",
        enName: "LG Twins",
        logoImg: "lg-twins.png",
        clubColor: "#A32C41",
      },
      awayClub: {
        clubId: 1,
        koName: "두산 베어스",
        enName: "Doosan Bears",
        logoImg: "doosan-bears.png",
        clubColor: "#131230",
      },
    },
  };

/** ===== Utilities ===== */
function ok<T>(data: T): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ code: "OK", message: "조회 성공", data }, { status: 200 });
}

function err(
  status: number,
  code: string,
  message: string
): NextResponse<ApiResponse<null>> {
  return NextResponse.json({ code, message, data: null }, { status });
}

function parseMatchId(raw: string): number | null {
  // number, integer, positive, safe range
  if (!/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  if (!Number.isSafeInteger(n) || n <= 0) return null;
  return n;
}

function toPurchaseStatus(saleStatus: SaleStatus): PurchaseStatus {
  return saleStatus === "ON_SALE" ? "PURCHASABLE" : "NOT_PURCHASABLE";
}

function formatKstDatetimeDisplay(matchAtIso: string): string {
  const d = new Date(matchAtIso);
  // KST 기준으로 보기 좋게: "YYYY년 MM월 DD일 (요일) HH:mm"
  const fmt = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = fmt.formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";

  const year = get("year");
  const month = get("month");
  const day = get("day");
  const weekday = get("weekday"); // "일", "월" ...
  const hour = get("hour");
  const minute = get("minute");

  return `${year}년 ${month}월 ${day}일 (${weekday}) ${hour}:${minute}`;
}

function startOfDayKst(date: Date): Date {
  // date를 KST 기준 "자정"으로 맞춘 뒤 UTC Date로 환산
  const kst = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Seoul" })
  );
  kst.setHours(0, 0, 0, 0);
  return kst;
}

function calcDdayLabel(matchAtIso: string): string {
  const matchDate = startOfDayKst(new Date(matchAtIso));
  const today = startOfDayKst(new Date());

  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((matchDate.getTime() - today.getTime()) / msPerDay);

  if (diffDays > 0) return `D-${diffDays}`;
  if (diffDays === 0) return "D-DAY";
  // 정책: 지난 경기면 D+로 표기
  return `D+${Math.abs(diffDays)}`;
}

/** ===== Route Handler ===== */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId: raw } = await ctx.params;

    // (옵션) 강제로 500 테스트: /api/matches/101?forceError=1
    const url = new URL(_req.url);
    if (url.searchParams.get("forceError") === "1") {
      throw new Error("Forced error for mock");
    }

    const matchId = parseMatchId(raw);
    if (!matchId) {
      return err(400, "INVALID_MATCH_ID", "잘못된 matchId 형식/범위");
    }

    const base = MOCK_MATCHES[matchId];
    if (!base) {
      return err(404, "MATCH_NOT_FOUND", "존재하지 않는 경기입니다.");
    }

    const teamsDisplay = `${base.homeClub.koName} vs ${base.awayClub.koName}`;

    // 임시 표기값 (원하면 matchId별로 다르게 구성 가능)
    const ageLimit = "전체관람가";
    const placeDisplay = "잠실야구장";
    const addressDisplay = "서울 송파구 올림픽로 19-2 서울종합운동장";

    const data: MatchDetail = {
      ...base,
      matchGuide: {
        teamsDisplay,
        ageLimit,
        placeDisplay,
        addressDisplay,
        datetimeDisplay: formatKstDatetimeDisplay(base.matchAt),
        purchaseStatus: toPurchaseStatus(base.saleStatus),
        matchDdayLabel: calcDdayLabel(base.matchAt),
      },
    };

    return ok(data);
  } catch (e) {
    return err(500, "INTERNAL_SERVER_ERROR", "서버 오류");
  }
}