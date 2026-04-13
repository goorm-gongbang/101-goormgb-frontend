// lib/services/order-core.server.ts
import "server-only";
import { API_BASE_URL } from "@/lib/api/config";
import type { ClubsData, MatchesData } from "@/lib/types";

type ServerFetchInit = RequestInit & {
  next?: {
    revalidate?: number | false;
  };
};

async function readPublicApiData<T>(
  input: string,
  init?: ServerFetchInit,
): Promise<T | null> {
  try {
    const res = await fetch(input, init);
    const json = await res.json().catch(() => null);

    if (!res.ok) return null;
    return json?.data ?? json ?? null;
  } catch {
    return null;
  }
}

export const getInitialMatches = (date: string) => {
  return readPublicApiData<MatchesData>(
    `${API_BASE_URL}/order/matches?date=${date}`,
    { cache: "no-store" },
  );
};

export const getInitialClubs = () => {
  return readPublicApiData<ClubsData>(
    `${API_BASE_URL}/order/clubs`,
    { next: { revalidate: 3600 } },
  );
};
