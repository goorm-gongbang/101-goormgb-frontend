/**
 * Recommendation Service Types
 * 추천 관련 타입 정의
 */

/** 추천 경기 */
export type RecommendedMatch = {
  matchId: number;
  score: number;
  reason: string;
};

/** 추천 경기 목록 응답 */
export type RecommendationsResponse = {
  code: string;
  message: string;
  data: {
    recommendations: RecommendedMatch[];
  };
};

/** 추천 좌석 */
export type RecommendedSeat = {
  seatId: string;
  section: string;
  row: string;
  seatNumber: string;
  score: number;
  reason: string;
  price: number;
};

/** 좌석 추천 요청 */
export type SeatRecommendationRequest = {
  matchId: number;
  preferences?: {
    viewpoint?: string;
    seatHeight?: string;
    section?: string;
    priceMin?: number;
    priceMax?: number;
  };
};

/** 좌석 추천 응답 */
export type SeatRecommendationResponse = {
  code: string;
  message: string;
  data: {
    recommendations: RecommendedSeat[];
  };
};
