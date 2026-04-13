import HomeClient from "./HomeClient";
import {
  getInitialMatches,
  getInitialClubs,
} from "@/lib/services/order-core.server";

function getTodayISO() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

export default async function Home() {
  const todayISO = getTodayISO();

  const [matchesPayload, teamsPayload] = await Promise.all([
    getInitialMatches(todayISO),
    getInitialClubs(),
  ]);

  return (
    <HomeClient
      initialDate={todayISO}
      initialMatchesPayload={matchesPayload}
      initialTeamsPayload={teamsPayload}
    />
  );
}
