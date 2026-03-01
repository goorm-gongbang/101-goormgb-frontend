/* ===========================
   Seat Service
   - 좌석 관련 API 호출
   - Backend: Seat 서비스
=========================== */

import { API_BASE_URL } from "@/lib/api/config";
import { auth, pub } from "@/lib/api/fetch";
import type { SeatStatus, Seat, SeatsData, SeatReservationRequest } from "@/lib/types";

// Re-export types for convenience
export type { SeatStatus, Seat, SeatsData, SeatReservationRequest };

/* 좌석 목록 조회 (public) */
export const getSeats = (matchId: string | number) =>
  pub.get(`${API_BASE_URL}/seats?matchId=${matchId}`);

/* 좌석 예약 */
export const reserveSeats = (body: SeatReservationRequest) =>
  auth.post(`${API_BASE_URL}/seats/reserve`, body);

/* 좌석 예약 취소 */
export const cancelReservation = (reservationId: string | number) =>
  auth.delete(`${API_BASE_URL}/seats/reservations/${reservationId}`);
