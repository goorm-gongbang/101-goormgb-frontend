/**
 * Seat Service Types
 * 좌석 관련 타입 정의
 */

/** 좌석 상태 */
export type SeatStatus = "AVAILABLE" | "RESERVED" | "SOLD" | "BLOCKED";

/** 좌석 정보 */
export type Seat = {
  seatId: string;
  section: string;
  row: string;
  seatNumber: string;
  status: SeatStatus;
  price: number;
  seatType?: string;
};

/** 좌석 목록 응답 데이터 */
export type SeatsData = {
  matchId: number;
  seats: Seat[];
  updatedAt: string;
};

/** 좌석 예약 요청 */
export type SeatReservationRequest = {
  matchId: number;
  seatIds: string[];
  userId: string;
};

/** 좌석 예약 응답 */
export type SeatReservationResponse = {
  code: string;
  message: string;
  data: {
    reservationId: string;
    expiresAt: string;
    seats: Seat[];
  };
};

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