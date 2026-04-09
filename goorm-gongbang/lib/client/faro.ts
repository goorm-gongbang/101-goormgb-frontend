/* ===========================
   Grafana Faro 초기화
   - 프론트엔드 관측성 (RUM, Tracing)
   - API 호출만 추적 (범위 제한)
=========================== */

import { initializeFaro, getWebInstrumentations } from "@grafana/faro-web-sdk";
import { TracingInstrumentation } from "@grafana/faro-web-tracing";

type FaroInstance = ReturnType<typeof initializeFaro>;

let faroInstance: FaroInstance | null = null;

// Tracing 대상 API (내부 API만 - 정적 파일/외부 요청 제외)
const TRACE_TARGET_URLS = [
  /api\.staging\.playball\.one/,
  /api\.playball\.one/,
  /api\.goormgb\.space/,
];

/**
 * Faro 초기화 (클라이언트 전용)
 * - 서버에서 호출 시 null 반환
 * - 중복 호출 시 기존 인스턴스 반환
 */
export function initFaro(): FaroInstance | null {
  // 서버 사이드 실행 방지
  if (typeof window === "undefined") return null;

  // 이미 초기화되었으면 기존 인스턴스 반환
  if (faroInstance) return faroInstance;

  const faroUrl = process.env.NEXT_PUBLIC_FARO_URL;

  // URL이 없으면 초기화하지 않음
  if (!faroUrl) {
    console.warn("[Faro] NEXT_PUBLIC_FARO_URL is not set. Faro disabled.");
    return null;
  }

  faroInstance = initializeFaro({
    url: faroUrl,
    app: {
      name: "goormgb-frontend",
      version: process.env.NEXT_PUBLIC_RELEASE || "1.0.0",
      environment: process.env.NEXT_PUBLIC_ENV || "development",
    },
    instrumentations: [
      // 기본 웹 계측 (console, errors, web vitals 등)
      ...getWebInstrumentations(),
      // 분산 추적 - 내부 API만 추적 (외부/정적 파일 제외)
      new TracingInstrumentation({
        instrumentationOptions: {
          propagateTraceHeaderCorsUrls: TRACE_TARGET_URLS,
        },
      }),
    ],
  });

  return faroInstance;
}

/**
 * Faro 인스턴스 가져오기
 */
export function getFaro(): FaroInstance | null {
  return faroInstance;
}
