/* ===========================
   Seat Service
   - 좌석 관련 API 호출
   - Backend: Seat 서비스
=========================== */

import { API_BASE_URL } from "@/lib/api/config";
import { auth } from "@/lib/api/fetch";
import { flushTelemetryBeforeProtectedRequest } from "@/lib/telemetry/runtime";
import type {
  BookingOptionsRequest,
  BookingOptionsResponse,
  SeatEntryResponse,
  BlockRecommendationResponse,
  SeatAssignmentResponse,
  SeatGroupsEntryResponse,
  SectionBlocksResponse,
  SeatHoldCreateRequest,
  SeatHoldCreateResponse,
} from "@/lib/types";

/* 예매 조건 저장 */
export const saveBookingOptions = (matchId: string | number, body: BookingOptionsRequest) =>
  auth.post<BookingOptionsResponse, BookingOptionsRequest>(
    `${API_BASE_URL}/seat/matches/${matchId}/booking-options`,
    body,
  );

/* 추천 ON - 추천 좌석 초기 진입 */
export const getRecommendationSeatEntry = (matchId: string | number) =>
  auth.get<SeatEntryResponse>(
    `${API_BASE_URL}/seat/matches/${matchId}/recommendations/seat-entry`,
  );

/* 추천 ON - 추천 블럭 리스트 조회 */
export const getRecommendationBlocks = async (matchId: string | number) => {
  // AI telemetry 연동: 보호 API 평가 전에 현재 좌석 탐색 batch를 선반영한다.
  await flushTelemetryBeforeProtectedRequest();

  return auth.get<BlockRecommendationResponse>(
    `${API_BASE_URL}/seat/matches/${matchId}/recommendations/blocks`,
  );
};

/* 추천 ON - 좌석 자동 배정 및 선점 */
export const assignRecommendedSeats = async (
  matchId: string | number,
  blockId: string | number,
) => {
  // AI telemetry 연동: 자동 배정 요청 직전 최신 seat-stage raw batch를 전송한다.
  await flushTelemetryBeforeProtectedRequest();

  return auth.post<SeatAssignmentResponse>(
    `${API_BASE_URL}/seat/matches/${matchId}/recommendations/blocks/${blockId}/assign`,
  );
};

/* 추천 OFF - 구역 리스트 조회 */
export const getSeatGroupsEntry = async (matchId: string | number) => {
  // AI telemetry 연동: 보호 API 평가 전에 현재 좌석 탐색 batch를 선반영한다.
  await flushTelemetryBeforeProtectedRequest();

  return auth.get<SeatGroupsEntryResponse>(
    `${API_BASE_URL}/seat/matches/${matchId}/seat-groups`,
  );
};

/* 구역 클릭 → 블럭별 포도알 조회 */
export const getSectionBlocks = async (
  matchId: string | number,
  sectionId: string | number,
) => {
  // AI telemetry 연동: 블럭 상세 조회 직전 최신 seat-stage raw batch를 전송한다.
  await flushTelemetryBeforeProtectedRequest();

  return auth.get<SectionBlocksResponse>(
    `${API_BASE_URL}/seat/matches/${matchId}/sections/${sectionId}/blocks`,
  );
};

/* 좌석 직접 선택 → Hold 생성 */
export const createSeatHold = async (
  matchId: string | number,
  body: SeatHoldCreateRequest,
) => {
  // AI telemetry 연동: hold 생성 직전 최신 seat-stage raw batch를 전송한다.
  await flushTelemetryBeforeProtectedRequest();

  return auth.post<SeatHoldCreateResponse, SeatHoldCreateRequest>(
    `${API_BASE_URL}/seat/matches/${matchId}/seat-holds`,
    body,
  );
};
