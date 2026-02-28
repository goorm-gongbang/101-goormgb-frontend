/**
 * Order-Core Service Types
 * 경기, 구단, 온보딩 관련 타입 정의
 */

/** 구단 정보 */
export type Club = {
  clubId: number;
  koName: string;
  enName: string;
  logoImg: string;
  clubColor?: string;
};

/** 경기장 정보 */
export type Stadium = {
  koName: string;
  enName: string;
  address?: string;
};

/** 판매 상태 */
export type SaleStatus = "ON_SALE" | "UPCOMING" | "SOLD_OUT" | "ENDED";

/** 구매 상태 */
export type PurchaseStatus = "PURCHASABLE" | "NOT_PURCHASABLE";

/** 경기 정보 */
export type Match = {
  matchId: number;
  matchAt: string;
  saleStatus: SaleStatus;
  salesOpenAt: string;
  homeClub: Club;
  awayClub: Club;
  stadium: Stadium;
};

/** 경기 목록 응답 데이터 */
export type MatchesData = {
  date: string;
  matchCount: number;
  matches: Match[];
};

/** 경기 안내 정보 */
export type MatchGuide = {
  teamsDisplay: string;
  ageLimit: string;
  placeDisplay: string;
  addressDisplay: string;
  datetimeDisplay: string;
  purchaseStatus: PurchaseStatus;
  matchDdayLabel: string;
};

/** 경기 상세 정보 */
export type MatchDetail = {
  matchId: number;
  matchAt: string;
  saleStatus: SaleStatus;
  homeClub: Club;
  awayClub: Club;
  matchGuide: MatchGuide;
};

/** 구단 목록 응답 데이터 */
export type ClubsData = {
  clubs: Club[];
};

/** 온보딩 상태 응답 */
export type OnboardingStatusResponse = {
  code: string;
  message: string;
  data: {
    onboardingStatus: boolean;
  };
};

/** 온보딩 선호도 - 시점 */
export type Viewpoint = "CENTER" | "INFIELD_1B" | "INFIELD_3B" | "OUTFIELD_L" | "OUTFIELD_C" | "OUTFIELD_R";

/** 온보딩 선호도 - 좌석 높이 */
export type SeatHeight = "LOW" | "MID" | "HIGH" | "ANY";

/** 온보딩 선호도 - 구역 */
export type Section = "CENTER_SIDE" | "MIDDLE" | "CORNER" | "ANY";

/** 온보딩 선호도 - 좌석 위치 */
export type SeatPositionPref = "AISLE" | "MIDDLE" | "ANY";

/** 온보딩 선호도 - 환경 */
export type EnvironmentPref = "SHADE" | "SUN_OK" | "ANY";

/** 온보딩 선호도 - 분위기 */
export type MoodPref = "CHEERFUL" | "QUIET" | "ANY";

/** 온보딩 선호도 - 시야 방해 민감도 */
export type ObstructionSensitivity = "NET_SENSITIVE" | "RAIL_PILLAR_SENSITIVE" | "NORMAL" | "ANY";

/** 온보딩 선호도 - 가격 모드 */
export type PriceMode = "ANY" | "RANGE";

/** 온보딩 선호도 */
export type Preference = {
  priority: 1 | 2 | 3;
  viewpoint: Viewpoint;
  seatHeight: SeatHeight;
  section: Section;
  seatPositionPref: SeatPositionPref;
  environmentPref: EnvironmentPref;
  moodPref: MoodPref;
  obstructionSensitivity: ObstructionSensitivity;
  priceMode: PriceMode;
  priceMin?: number | null;
  priceMax?: number | null;
};

/** 온보딩 선호도 기본값 (1단계) */
export type PreferenceBase = Pick<Preference, "priority" | "viewpoint" | "seatHeight" | "section">;

/** 온보딩 선호도 저장 요청 */
export type OnboardingPreferencesRequest = {
  marketingConsent: { marketingAgreed: boolean };
  preferences: Preference[];
};
