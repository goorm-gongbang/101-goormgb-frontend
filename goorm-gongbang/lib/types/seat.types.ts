/**
 * Seat Service Types
 * 좌석 관련 타입 정의
 */

/** 좌석 가격 정보 (UI용) */
export type SeatPriceRow = {
  seatType: string;
  weekday: string;
  weekend: string;
};

/** 외야 가격 정보 (UI용) */
export type OutfieldPriceRow = {
  groupLabel?: string;
  category: string;
  weekday: string;
  weekend: string;
};

/* 예매 조건 저장 */
export type BookingOptionsRequest = {
  recommendationEnabled?: boolean,
  nearAdjacentToggle?: boolean,
  ticketCount: number | null;
};

/* 예매 조건 응답 */
export type BookingOptionsResponse = {
  matchId: number,
  recommendationEnabled?: boolean,
  nearAdjacentToggle?: boolean,
  ticketCount: number | null;
};

/* 추천 좌석 초기 진입 응답 */
export type SeatEntryResponse = {
  match: {
    matchId: number;
    homeClub: {
      clubId: number;
      koName: string;
      logoImg: string;
    };
    awayClub: {
      clubId: number;
      koName: string;
      logoImg: string;
    };
    matchAt: string;
    stadium: {
      stadiumId: number;
      koName: string;
    };
  };
  seatSession: {
    recommendationEnabled: boolean;
    headCount: number;
    preferredBlockIds: number[];
  };
};

/* 추천 블럭 리스트 응답 */
export type BlockRecommendationResponse = {
  matchId: number;
  ticketCount: number;
  blocks: {
    blockId: number;
    blockCode: string;
    sectionName: string;
    areaName: string;
    viewpoint: string;
    realConsecutiveCount: number;
    remainingSeatCount: number;
    rank: number;
  }[];
};

/* 좌석 자동 배정 및 선점 */
export type SeatAssignmentResponse = {
  matchId: number;
  blockCode: string;
  sectionName: string;
  assignedSeats: {
    matchSeatId: number;
    rowNo: number;
    seatNo: number;
    templateColNo: number;
  }[];
  holdExpiresAt: string;
  semiConsecutive: boolean;
};

/* 구역 리스트 조회 */
export type SeatGroupsEntryResponse = {
  match: {
    matchId: number;
    homeClub: {
      clubId: number;
      koName: string;
      logoImg: string;
    };
    awayClub: {
      clubId: number;
      koName: string;
      logoImg: string;
    };
    matchAt: string;
    stadium: {
      stadiumId: number;
      koName: string;
    };
  };
  seatSession: {
    recommendationEnabled: boolean;
    ticketCount: number;
    nearAdjacentToggle: boolean;
  };
  seatGroups: SeatAreaGroup[];
};

export type SeatAreaGroup = {
  areaId: number;
  areaName: string;
  sections: SeatGroupSection[];
};

export type SeatGroupSection = {
  sectionId: number;
  sectionName: string;
  displayName: string;
  blockIds: number[];
  remainingSeatCount: number;
};

/* 구역 클릭 → 블럭별 포도알 조회 */
export type SectionBlockSeatStatus =
  | "AVAILABLE"
  | "HELD"
  | "BLOCKED"
  | "SOLD_OUT";

export type SectionBlockSeat = {
  seatId: number;
  seatNo: number;
  saleStatus: SectionBlockSeatStatus;
};

export type SectionBlockRow = {
  rowNo: number;
  remainingSeatCount: number;
  seats: SectionBlockSeat[];
};

export type SectionBlock = {
  blockId: number;
  blockCode: string;
  displayName: string;
  rows: SectionBlockRow[];
};

export type SectionBlocksResponse = {
  blocks: SectionBlock[];
};

/* 좌석 직접 선택 → Hold 생성 */
export type SeatHoldCreateRequest = {
  seatIds: number[];
};

export type SeatHoldCreateResponse = {
  matchId: number;
  seatIds: number[];
  seatCount: number;
  holdExpiresAt: string;
};