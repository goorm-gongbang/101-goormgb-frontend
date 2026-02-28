/* ===========================
   Seat Service
   - 좌석 관련 API 호출
   - Backend: Seat 서비스
=========================== */

import { API_BASE_URL } from "@/lib/api/config";
import type { SeatStatus, Seat, SeatsData, SeatReservationRequest } from "@/lib/types";

// Re-export types for convenience
export type { SeatStatus, Seat, SeatsData, SeatReservationRequest };

/* ---------------------------
   좌석 목록 조회
--------------------------- */
export async function getSeats(matchId: string | number): Promise<Response> {
  return fetch(`${API_BASE_URL}/seats?matchId=${matchId}`, {
    method: "GET",
    cache: "no-store",
  });
}

/* ---------------------------
   좌석 예약
--------------------------- */
export async function reserveSeats(
  accessToken: string,
  body: SeatReservationRequest
): Promise<Response> {
  return fetch(`${API_BASE_URL}/seats/reserve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
    credentials: "include",
    cache: "no-store",
  });
}

/* ---------------------------
   좌석 예약 취소
--------------------------- */
export async function cancelReservation(
  accessToken: string,
  reservationId: string | number
): Promise<Response> {
  return fetch(`${API_BASE_URL}/seats/reservations/${reservationId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
    cache: "no-store",
  });
}
