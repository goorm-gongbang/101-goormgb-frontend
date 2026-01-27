// src/server/customMetrics.ts
import { client } from "@/lib/server/metrics";
import { getRegistry } from "@/lib/server/metrics";

export function getHttpDurationMetric() {
  const registry = getRegistry();

  // 중복 생성 방지: 레지스트리에서 이미 있으면 가져오기
  const existing = registry.getSingleMetric("next_http_server_duration_ms");
  if (existing) return existing as client.Histogram<string>;

  return new client.Histogram({
    name: "next_http_server_duration_ms",
    help: "Next.js server route duration (ms)",
    labelNames: ["route", "method", "status"] as const,
    buckets: [10, 25, 50, 100, 250, 500, 1000, 2000, 5000],
    registers: [registry],
  });
}


/*

-- API ROUTE 사용 시 예시 --

import { NextResponse } from "next/server";
import { initMetrics } from "@/server/metrics";
import { getHttpDurationMetric } from "@/server/customMetrics";

export const runtime = "nodejs";

export async function GET() {
  initMetrics();
  const metric = getHttpDurationMetric();

  const start = Date.now();
  let status = 200;

  try {
    // ... 작업
    return NextResponse.json({ ok: true });
  } catch (e) {
    status = 500;
    return NextResponse.json({ ok: false }, { status });
  } finally {
    metric
      .labels({ route: "/api/example", method: "GET", status: String(status) })
      .observe(Date.now() - start);
  }
}


*/