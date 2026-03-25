/* ===========================
   브라우저 전용 관측/분석 유틸
   - Grafana Faro 이벤트 래퍼
   - 공통 필드 자동 포함
   - 민감정보 필터링
=========================== */

import { getFaro } from "./faro";

type EventProps = Record<string, string | number | boolean | undefined>;

// 허용된 필드만 전송 (화이트리스트)
const ALLOWED_FIELDS = new Set([
  "route",
  "device_type",
  "is_logged_in",
  "payment_method",
  "seat_count",
  "ticket_count",
  "flow_step",
  "match_slug",
  "error_code",
  "error_type",
  "step",
  "method",
]);

// 금지 필드 패턴 (2차 방어)
const DENIED_PATTERNS = [
  /token/i,
  /password/i,
  /email/i,
  /phone/i,
  /secret/i,
  /credential/i,
  /user_id/i,
  /order_id/i,
  /session_id/i,
];

/**
 * 민감정보 필터링 + string 변환 (Faro EventAttributes 호환)
 */
function sanitizeProps(props: EventProps): Record<string, string> {
  const sanitized: Record<string, string> = {};

  Object.entries(props).forEach(([key, value]) => {
    if (value === undefined) return;
    // 허용 필드만 통과
    if (!ALLOWED_FIELDS.has(key)) return;
    // 금지 패턴 2차 체크
    if (DENIED_PATTERNS.some((pattern) => pattern.test(key))) return;
    // Faro는 string만 허용
    sanitized[key] = String(value);
  });

  return sanitized;
}

/**
 * 디바이스 타입 감지
 */
function getDeviceType(): "mobile" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  return /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent)
    ? "mobile"
    : "desktop";
}

/**
 * 공통 필드 생성 (Faro EventAttributes 호환 - string only)
 * - is_logged_in은 훅(useAnalytics)에서 주입됨
 */
function getCommonProps(
  route: string,
  extra?: EventProps
): Record<string, string> {
  const base: Record<string, string> = {
    route,
    device_type: getDeviceType(),
  };

  if (extra) {
    return { ...base, ...sanitizeProps(extra) };
  }

  return base;
}

/**
 * 페이지 뷰 전송
 */
export function trackPageView(route: string, props?: EventProps): void {
  if (typeof window === "undefined") return;

  const faro = getFaro();
  if (!faro) return;

  faro.api?.pushEvent("page_view", getCommonProps(route, props));
}

/**
 * 액션 이벤트 전송
 */
export function trackAction(name: string, props?: EventProps): void {
  if (typeof window === "undefined") return;

  const faro = getFaro();
  if (!faro) return;

  const route = window.location.pathname;
  faro.api?.pushEvent(name, getCommonProps(route, props));
}

/**
 * 에러 이벤트 전송
 */
export function trackError(
  name: string,
  error?: Error | string,
  props?: EventProps
): void {
  if (typeof window === "undefined") return;

  const faro = getFaro();
  if (!faro) return;

  const route = window.location.pathname;
  const errorProps: Record<string, string> = {
    ...getCommonProps(route, props),
    error_type: error instanceof Error ? error.name : "Error",
    error_code: typeof error === "string" ? error : error?.message || "unknown",
  };

  faro.api?.pushEvent(name, errorProps);
}
