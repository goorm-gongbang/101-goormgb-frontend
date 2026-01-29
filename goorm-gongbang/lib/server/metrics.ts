/* ===========================
   Metrics Singleton (Server Only)
   - prom-client를 한 번만 초기화
   - 모든 메트릭을 하나의 Registry로 관리
=========================== */

import client from "prom-client";

/* ===========================
   Global Singleton 선언
=========================== */
declare global {
  // eslint-disable-next-line no-var
  var __PROM_REGISTRY__: client.Registry | undefined;
  // eslint-disable-next-line no-var
  var __PROM_INITIALIZED__: boolean | undefined;
}

/* ===========================
   Registry Getter
=========================== */
export function getRegistry(): client.Registry {
  if (!global.__PROM_REGISTRY__) {
    global.__PROM_REGISTRY__ = new client.Registry();
  }
  return global.__PROM_REGISTRY__;
}

/* ===========================
   Metrics 초기화
   - Node 기본 지표 (heap, gc, eventloop 등)
=========================== */
export function initMetrics() {
  if (global.__PROM_INITIALIZED__) return;

  const registry = getRegistry();

  client.collectDefaultMetrics({
    register: registry,
    prefix: "next_", // 서비스 구분용 prefix
  });

  global.__PROM_INITIALIZED__ = true;
}

/* ===========================
   Utils
=========================== */

/**
 * Prometheus 라벨 카디널리티 폭발 방지용
 * - /events/123 → /events/:id
 * - query string 제거
 */
export function normalizePath(path: string): string {
  return path
    .split("?")[0]
    .replace(/\/\d+(?=\/|$)/g, "/:id")
    .replace(
      /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?=\/|$)/gi,
      "/:uuid"
    );
}

/* ===========================
   Metric Factory (중복 방지)
=========================== */
function getOrCreateHistogram<T extends string>(
  name: string,
  help: string,
  labelNames: readonly T[],
  buckets: number[]
): client.Histogram<T> {
  initMetrics();
  const registry = getRegistry();

  const existing = registry.getSingleMetric(name);
  if (existing) return existing as client.Histogram<T>;

  return new client.Histogram<T>({
    name,
    help,
    labelNames: labelNames as T[],
    buckets,
    registers: [registry],
  });
}

function getOrCreateCounter<T extends string>(
  name: string,
  help: string,
  labelNames: readonly T[]
): client.Counter<T> {
  initMetrics();
  const registry = getRegistry();

  const existing = registry.getSingleMetric(name);
  if (existing) return existing as client.Counter<T>;

  return new client.Counter<T>({
    name,
    help,
    labelNames: labelNames as T[],
    registers: [registry],
  });
}

/* ===========================
   ✅ SSR 성능 메트릭 (Next 서버)
=========================== */
export const ssrDuration = getOrCreateHistogram(
  "ticketing_ssr_duration_seconds",
  "Server-side rendering duration",
  ["page"] as const,
  [0.05, 0.1, 0.25, 0.5, 1, 2, 5]
);

/* ===========================
   ✅ Next → Spring API 호출 메트릭
   (SSR 중 fetch/axios 사용 시)
=========================== */
export const apiCallDuration = getOrCreateHistogram(
  "ticketing_api_call_duration_seconds",
  "Backend API call duration",
  ["endpoint", "status"] as const,
  [0.05, 0.1, 0.25, 0.5, 1, 2, 5]
);

export const apiCallTotal = getOrCreateCounter(
  "ticketing_api_calls_total",
  "Total backend API calls",
  ["endpoint", "status"] as const
);

/* ===========================
   Export prom-client (선택)
=========================== */
export { client };
