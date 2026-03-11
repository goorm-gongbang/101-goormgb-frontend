/**
 * Order-Core Service Types
 * 경기, 구단, 온보딩 관련 타입 정의
 */

/** 구단 정보 (리스트용) */
export type Club = {
  clubId: number; // 구단 식별자
  koName: string; // 구단명(한국어)
  enName: string; // 구단명(영어)
  logoImg: string; // 로고 이미지
  clubColor?: string; // 브랜드 컬러
};

/** 경기장 정보 */
export type Stadium = {
  koName: string;
  enName: string;
  address?: string;
};

/** 구단 상세 조회용 경기장 정보 */
export type ClubStadium = {
  stadiumId: number;
  koName: string;
};

/** 구단 현재 시즌 성적 */
export type ClubSeasonStats = {
  battingAverage: number;
  draws: number;
  era: number;
  gamesBehind: number;
  losses: number;
  seasonRanking: number;
  seasonYear: number;
  winRate: number;
  wins: number;
};

/** 구단 상세 정보 */
export type ClubDetail = {
  clubId: number;
  koName: string;
  enName?: string;
  logoImg: string;
  clubColor?: string;
  stadium: ClubStadium;
  homepageRedirectUrl: string | null;
  currentSeasonStats: ClubSeasonStats | null;
};

/** 판매 상태 */
export type SaleStatus = "ON_SALE" | "UPCOMING" | "SOLD_OUT" | "ENDED";

/** 구매 상태 */
export type PurchaseStatus = "PURCHASABLE" | "NOT_PURCHASABLE";

/** 경기 정보 */
export type Match = {
  matchId: number; // 경기 식별자
  matchAt: string; // 경기 일시 (ISO-8601 형식)
  saleStatus: SaleStatus; // 경기 판매 상태
  salesOpenAt: string;
  homeClub: Club; // 홈
  awayClub: Club; // 어웨이
  stadium: Stadium; // 경기장
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
  matchId: number; // 경기 식별자
  matchAt: string; // 경기 일시 (ISO-8601 형식)
  saleStatus: SaleStatus; // 경기 판매 상태
  homeClub: Club; // 홈
  awayClub: Club; // 어웨이
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
export type Viewpoint =
  | "CENTER"
  | "INFIELD_1B"
  | "INFIELD_3B"
  | "OUTFIELD_L"
  | "OUTFIELD_C"
  | "OUTFIELD_R";

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
export type ObstructionSensitivity =
  | "NET_SENSITIVE"
  | "RAIL_PILLAR_SENSITIVE"
  | "NORMAL"
  | "ANY";

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
export type PreferenceBase = Pick<
  Preference,
  "priority" | "viewpoint" | "seatHeight" | "section"
>;

/** 온보딩 선호도 저장 요청 */
export type OnboardingPreferencesRequest = {
  marketingConsent: { marketingAgreed: boolean };
  preferences: Preference[];
};

/** 구단 월별 경기 조회  - 상대팀 정보 */
export type OpponentClub = {
  clubId: number;
  koName: string;
  logoImg: string;
};

/** 구단 월별 경기 조회 - 경기 정보 */
export type Matches = {
  matchId: number;
  matchAt: string;
  opponentClub: OpponentClub;
  saleStatus: SaleStatus;
  isHomeMatch: boolean;
};

/** 구단 월별 경기 조회 */
export type ClubMonthMatches = {
  clubId: number;
  year: number;
  month: number;
  totalMatchCount: number;
  matches: Matches[];
};

/** 구단 월별 경기 조회 응답 */
export interface CalendarMatch {
  matchId: number;
  matchAt: string;
  opponentClub: {
    clubId: number;
    koName: string;
    logoImg: string;
  };
  saleStatus: SaleStatus;
  isHomeMatch: boolean;
}
