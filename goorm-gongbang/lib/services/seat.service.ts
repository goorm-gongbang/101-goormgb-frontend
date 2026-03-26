/* ===========================
   Seat Service
   - 좌석 관련 API 호출
   - Backend: Seat 서비스
=========================== */

import { API_BASE_URL } from "@/lib/api/config";
import { auth, pub } from "@/lib/api/fetch";
import type {
  BookingOptionsRequest,
  BookingOptionsResponse,
  SeatEntryResponse,
  BlockRecommendationResponse,
  SeatAssignmentResponse,
  SeatGroupsEntryResponse,
  SectionBlocksResponse,
  SeatHoldCreateRequest,
  SeatHoldCreateResponse
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
    `${API_BASE_URL}/seat/matches/${matchId}/recommendations/seat-entry`
  );

/* 추천 ON - 추천 블럭 리스트 조회 */
export const getRecommendationBlocks = (matchId: string | number) =>
  auth.get<BlockRecommendationResponse>(
    `${API_BASE_URL}/seat/matches/${matchId}/recommendations/blocks`
  );

/* 추천 ON - 좌석 자동 배정 및 선점 */
export const assignRecommendedSeats = (
  matchId: string | number,
  blockId: string | number
) =>
  auth.post<SeatAssignmentResponse>(
    `${API_BASE_URL}/seat/matches/${matchId}/recommendations/blocks/${blockId}/assign`
  );

/* 추천 OFF - 구역 리스트 조회 */
export const getSeatGroupsEntry = (matchId: string | number) =>
  auth.get<SeatGroupsEntryResponse>(
    `${API_BASE_URL}/seat/matches/${matchId}/seat-groups`
  );

/* 구역 클릭 → 블럭별 포도알 조회 */
export const getSectionBlocks = (
  matchId: string | number,
  sectionId: string | number,
) =>
  auth.get<SectionBlocksResponse>(
    `${API_BASE_URL}/seat/matches/${matchId}/sections/${sectionId}/blocks`
  );

/* 좌석 직접 선택 → Hold 생성 */
export const createSeatHold = (
  matchId: string | number,
  body: SeatHoldCreateRequest,
) =>
  auth.post<SeatHoldCreateResponse, SeatHoldCreateRequest>(
    `${API_BASE_URL}/seat/matches/${matchId}/seat-holds`,
    body,
  );