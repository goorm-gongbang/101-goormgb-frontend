// app/api/onboarding/preferences/route.ts
import { NextResponse } from "next/server";

/** =========================
 * Types (Spec-aligned)
 ========================= */

type PriceMode = "ANY" | "RANGE";

type Viewpoint =
  | "CENTER"
  | "INFIELD_1B"
  | "INFIELD_3B"
  | "OUTFIELD_L"
  | "OUTFIELD_C"
  | "OUTFIELD_R";

type SeatHeight = "LOW" | "MID" | "HIGH" | "ANY";
type Section = "CENTER_SIDE" | "MIDDLE" | "CORNER" | "ANY";

type SeatPositionPref = "AISLE" | "MIDDLE" | "ANY";
type EnvironmentPref = "SHADE" | "SUN_OK" | "ANY";
type MoodPref = "CHEERFUL" | "QUIET" | "ANY";
type ObstructionSensitivity =
  | "NET_SENSITIVE"
  | "RAIL_PILLAR_SENSITIVE"
  | "NORMAL"
  | "ANY";

type MarketingConsent = {
  marketingAgreed: boolean;
};

type Priority = 1 | 2 | 3;

type Preference = {
  priority: Priority;
  viewpoint: Viewpoint;
  seatHeight: SeatHeight;
  section: Section;

  seatPositionPref?: SeatPositionPref;
  environmentPref?: EnvironmentPref;
  moodPref?: MoodPref;
  obstructionSensitivity?: ObstructionSensitivity;

  priceMode?: PriceMode;
  priceMin?: number | null;
  priceMax?: number | null;
};

type RequestBody = {
  marketingConsent: MarketingConsent;
  preferences: Preference[];
};

/** =========================
 * Mock "DB" (in-memory)
 * key: accessToken string
 ========================= */
declare global {
  // eslint-disable-next-line no-var
  var __ONBOARDING_PREF_MOCK__: Map<
    string,
    {
      onboardingStatus: boolean;
      onboardingCompletedAt: string;
      marketingAgreed: boolean;
      marketingAgreedAt: string | null;
      body: RequestBody;
    }
  > | undefined;
}

function getStore() {
  if (!global.__ONBOARDING_PREF_MOCK__) {
    global.__ONBOARDING_PREF_MOCK__ = new Map();
  }
  return global.__ONBOARDING_PREF_MOCK__;
}

/** =========================
 * Helpers
 ========================= */

function nowKSTISOString() {
  // KST: UTC+09:00
  const d = new Date(Date.now() + 9 * 60 * 60 * 1000);
  // ISO without "Z", add +09:00
  const iso = d.toISOString().replace("Z", "+09:00");
  return iso;
}

function jsonError(status: number, message: string, code = "BAD_REQUEST") {
  return NextResponse.json({ code, message, data: null }, { status });
}

function getBearerToken(req: Request) {
  const auth = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!auth) return null;
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  return m[1].trim();
}

function isInt(n: unknown): n is number {
  return typeof n === "number" && Number.isInteger(n);
}

function isNonNegativeInt(n: unknown): n is number {
  return isInt(n) && n >= 0;
}

// ✅ Priority 타입가드 (핵심)
function isPriority(v: unknown): v is Priority {
  return v === 1 || v === 2 || v === 3;
}

const VIEWPOINTS: readonly Viewpoint[] = [
  "CENTER",
  "INFIELD_1B",
  "INFIELD_3B",
  "OUTFIELD_L",
  "OUTFIELD_C",
  "OUTFIELD_R",
] as const;

const SEAT_HEIGHTS: readonly SeatHeight[] = ["LOW", "MID", "HIGH", "ANY"] as const;
const SECTIONS: readonly Section[] = ["CENTER_SIDE", "MIDDLE", "CORNER", "ANY"] as const;

const SEAT_POS: readonly SeatPositionPref[] = ["AISLE", "MIDDLE", "ANY"] as const;
const ENVS: readonly EnvironmentPref[] = ["SHADE", "SUN_OK", "ANY"] as const;
const MOODS: readonly MoodPref[] = ["CHEERFUL", "QUIET", "ANY"] as const;
const OBSTRUCTIONS: readonly ObstructionSensitivity[] = [
  "NET_SENSITIVE",
  "RAIL_PILLAR_SENSITIVE",
  "NORMAL",
  "ANY",
] as const;

const PRICE_MODES: readonly PriceMode[] = ["ANY", "RANGE"] as const;

function assertEnum<T extends readonly string[]>(
  value: unknown,
  allowed: T,
  fieldName: string
): value is T[number] {
  if (typeof value !== "string" || !allowed.includes(value)) return false;
  return true;
}

function normalizeDefaults(p: Preference): Required<Preference> {
  return {
    priority: p.priority,
    viewpoint: p.viewpoint,
    seatHeight: p.seatHeight,
    section: p.section,

    seatPositionPref: p.seatPositionPref ?? "ANY",
    environmentPref: p.environmentPref ?? "ANY",
    moodPref: p.moodPref ?? "ANY",
    obstructionSensitivity: p.obstructionSensitivity ?? "NORMAL",
    priceMode: p.priceMode ?? "ANY",

    priceMin: p.priceMin ?? (null as any),
    priceMax: p.priceMax ?? (null as any),
  };
}

/** =========================
 * Route
 ========================= */

export async function POST(req: Request) {
  // 401: 인증 실패
  const token = getBearerToken(req);
  if (!token) {
    return jsonError(401, "Authorization Bearer 토큰이 필요합니다.", "UNAUTHORIZED");
  }

  // (mock) 403: DEACTIVE는 실제 계정상태가 없으니 데모용 규칙 하나 둠
  // 토큰이 "deactive"를 포함하면 DEACTIVE 취급
  if (token.toLowerCase().includes("deactive")) {
    return jsonError(403, "계정 상태가 DEACTIVE 입니다.", "FORBIDDEN");
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return jsonError(400, "JSON 파싱에 실패했습니다.");
  }

  // validation: marketingConsent.marketingAgreed 필수
  if (
    !body ||
    typeof body !== "object" ||
    !body.marketingConsent ||
    typeof body.marketingConsent !== "object" ||
    typeof body.marketingConsent.marketingAgreed !== "boolean"
  ) {
    return jsonError(400, "marketingConsent.marketingAgreed(boolean)는 필수입니다.");
  }

  // validation: preferences 길이 3 고정
  if (!Array.isArray(body.preferences) || body.preferences.length !== 3) {
    return jsonError(400, "preferences는 길이 3인 배열이어야 합니다.");
  }

  // 409: 이미 온보딩 완료인데 재호출(정책: 최초 저장 엄격)
  const store = getStore();
  if (store.has(token)) {
    return jsonError(409, "이미 온보딩이 완료된 사용자입니다.", "CONFLICT");
  }

  // ✅ priority 중복 + 1,2,3 모두 있어야 함 (타입 안전하게 수정)
  const priorities = body.preferences.map((p) => p?.priority);

  // 먼저 값 자체가 1|2|3 인지 검증
  if (priorities.length !== 3 || priorities.some((r) => !isPriority(r))) {
    return jsonError(400, "priority는 1,2,3이 각각 한 번씩 있어야 합니다.");
  }

  // 여기서부터 priorities는 Priority[] 로 취급 가능
  const prioritySet = new Set<Priority>(priorities as Priority[]);
  const mustPriorities: readonly Priority[] = [1, 2, 3] as const;

  // 중복 체크
  if (prioritySet.size !== 3) {
    return jsonError(400, "priority는 1,2,3이 각각 한 번씩 있어야 합니다.");
  }

  // 포함 체크 (✅ 여기서 타입 에러 사라짐)
  for (const r of mustPriorities) {
    if (!prioritySet.has(r)) {
      return jsonError(400, "priority는 1,2,3이 모두 포함되어야 합니다.");
    }
  }

  // 각 preference 필수: viewpoint, seatHeight, section
  // + viewpoint 중복 불가
  const viewpointSet = new Set<string>();

  for (const [idx, raw] of body.preferences.entries()) {
    if (!raw || typeof raw !== "object") {
      return jsonError(400, `preferences[${idx}] 형식이 올바르지 않습니다.`);
    }

    // required fields
    if (!assertEnum(raw.viewpoint, VIEWPOINTS, "viewpoint")) {
      return jsonError(400, `preferences[${idx}].viewpoint 허용값이 아닙니다.`);
    }
    if (!assertEnum(raw.seatHeight, SEAT_HEIGHTS, "seatHeight")) {
      return jsonError(400, `preferences[${idx}].seatHeight 허용값이 아닙니다.`);
    }
    if (!assertEnum(raw.section, SECTIONS, "section")) {
      return jsonError(400, `preferences[${idx}].section 허용값이 아닙니다.`);
    }

    // optional enums if present
    if (
      raw.seatPositionPref !== undefined &&
      !assertEnum(raw.seatPositionPref, SEAT_POS, "seatPositionPref")
    ) {
      return jsonError(400, `preferences[${idx}].seatPositionPref 허용값이 아닙니다.`);
    }
    if (
      raw.environmentPref !== undefined &&
      !assertEnum(raw.environmentPref, ENVS, "environmentPref")
    ) {
      return jsonError(400, `preferences[${idx}].environmentPref 허용값이 아닙니다.`);
    }
    if (raw.moodPref !== undefined && !assertEnum(raw.moodPref, MOODS, "moodPref")) {
      return jsonError(400, `preferences[${idx}].moodPref 허용값이 아닙니다.`);
    }
    if (
      raw.obstructionSensitivity !== undefined &&
      !assertEnum(raw.obstructionSensitivity, OBSTRUCTIONS, "obstructionSensitivity")
    ) {
      return jsonError(400, `preferences[${idx}].obstructionSensitivity 허용값이 아닙니다.`);
    }
    if (raw.priceMode !== undefined && !assertEnum(raw.priceMode, PRICE_MODES, "priceMode")) {
      return jsonError(400, `preferences[${idx}].priceMode 허용값이 아닙니다.`);
    }

    // viewpoint uniqueness (user_id, viewpoint) unique
    if (viewpointSet.has(raw.viewpoint)) {
      return jsonError(400, "동일 viewpoint로 여러 순위를 등록할 수 없습니다.");
    }
    viewpointSet.add(raw.viewpoint);

    // price validation
    const priceMode: PriceMode = raw.priceMode ?? "ANY";
    const hasMin = raw.priceMin !== undefined && raw.priceMin !== null;
    const hasMax = raw.priceMax !== undefined && raw.priceMax !== null;

    if (priceMode === "ANY") {
      // ignore min/max (null 저장)
      continue;
    }

    // RANGE
    if (!hasMin || !hasMax) {
      return jsonError(400, "priceMode가 RANGE이면 priceMin, priceMax는 둘 다 필수입니다.");
    }
    if (!isNonNegativeInt(raw.priceMin)) {
      return jsonError(400, "priceMin은 0 이상의 정수여야 합니다.");
    }
    if (!isNonNegativeInt(raw.priceMax)) {
      return jsonError(400, "priceMax는 0 이상의 정수여야 합니다.");
    }
    if (raw.priceMax < raw.priceMin) {
      return jsonError(400, "priceMax는 priceMin 이상이어야 합니다.");
    }
  }

  // 서버 기본값 자동 설정(ANY/NORMAL) + priceMode ANY면 null로 저장(모사)
  const normalized: RequestBody = {
    marketingConsent: { marketingAgreed: body.marketingConsent.marketingAgreed },
    preferences: body.preferences
      .map((p) => normalizeDefaults(p))
      .map((p) => {
        if (p.priceMode === "ANY") {
          return {
            ...p,
            priceMin: null as any,
            priceMax: null as any,
          };
        }
        return p;
      }),
  };

  // save mock + onboarding complete
  const now = nowKSTISOString();
  const marketingAgreed = normalized.marketingConsent.marketingAgreed;

  store.set(token, {
    onboardingStatus: true,
    onboardingCompletedAt: now,
    marketingAgreed,
    marketingAgreedAt: marketingAgreed ? now : null,
    body: normalized,
  });

  return NextResponse.json(
    {
      code: "OK",
      message: "온보딩 저장 및 완료 처리 성공",
      data: {
        onboardingStatus: true,
        onboardingCompletedAt: now,
        marketingAgreed,
        marketingAgreedAt: marketingAgreed ? now : null,
      },
    },
    { status: 201 }
  );
}

/**
 * (선택) 디버깅용: 현재 저장된 mock 상태 조회
 * GET /api/onboarding/preferences
 * - Authorization 토큰 기준으로 저장된 body 반환
 */
export async function GET(req: Request) {
  const token = getBearerToken(req);
  if (!token) {
    return jsonError(401, "Authorization Bearer 토큰이 필요합니다.", "UNAUTHORIZED");
  }
  const store = getStore();
  const data = store.get(token);
  if (!data) {
    return jsonError(404, "저장된 온보딩 선호도가 없습니다.", "NOT_FOUND");
  }
  return NextResponse.json({ code: "OK", message: "조회 성공", data }, { status: 200 });
}
