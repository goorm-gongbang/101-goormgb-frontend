// lib/services/order-core.server.ts
import "server-only";
import { API_BASE_URL } from "@/lib/api/config";
import type { ClubsData, MatchesData } from "@/lib/types";

/* 경기 목록 조회 - 서버 초기 렌더용 */
export const getInitialMatches = async (date: string) => {
  try {
    const res = await fetch(`${API_BASE_URL}/order/matches?date=${date}`, {
      cache: "no-store",
    });
    console.log("getInitialMatchesres:", res);
    const json = await res.json().catch(() => null);
    console.log("getInitialMatchesresjson:", json);
    if (!res.ok) {
      throw new Error(json?.message ?? `경기 목록 조회 실패 (${res.status})`);
    }

    return (json?.data ?? json ?? null) as MatchesData | null;
  } catch (error) {
    console.error("경기 목록 조회 실패:", error);
    return null;
  }
};

/* 구단 목록 조회 - 서버 초기 렌더용 */
export const getInitialClubs = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/order/clubs`, {
        cache: "no-store",
    });
    console.log("getInitialClubsres:", res);
    const json = await res.json().catch(() => null);
    console.log("getInitialClubsjson:", json);

    if (!res.ok) {
      throw new Error(json?.message ?? `구단 목록 조회 실패 (${res.status})`);
    }

    return (json?.data ?? json ?? null) as ClubsData | null;
  } catch (error) {
    console.error("구단 목록 조회 실패:", error);
    return null;
  }
};
