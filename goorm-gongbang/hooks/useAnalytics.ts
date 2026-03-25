"use client";

import { useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/stores/authStore";
import { trackAction, trackError, trackPageView } from "@/lib/client/analytics";

type EventProps = Record<string, string | number | boolean | undefined>;

/**
 * 로그인 상태를 자동으로 주입하는 헬퍼
 */
function useWithAuth() {
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = !!user;

  const withAuth = useCallback(
    (props?: EventProps): EventProps => ({
      ...props,
      is_logged_in: isLoggedIn,
    }),
    [isLoggedIn]
  );

  return { isLoggedIn, withAuth };
}

/**
 * 페이지 뷰 자동 트래킹 훅
 * - 컴포넌트 마운트 시 page_view 이벤트 전송
 * - 로그인 상태 자동 주입
 * - props는 JSON.stringify로 안정적 의존성 처리
 */
export function useTrackPageView(pageName: string, props?: EventProps) {
  const tracked = useRef(false);
  const { withAuth } = useWithAuth();
  // props 객체를 안정적으로 비교하기 위해 JSON 문자열로 변환
  const propsKey = props ? JSON.stringify(props) : "";

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    const parsedProps = propsKey ? JSON.parse(propsKey) : undefined;
    trackPageView(pageName, withAuth(parsedProps));
  }, [pageName, propsKey, withAuth]);
}

/**
 * 이벤트 트래킹 훅
 * - trackEvent: 수동 이벤트 전송 (로그인 상태 자동 주입)
 */
export function useTrackEvent() {
  const { withAuth } = useWithAuth();

  const trackEvent = useCallback(
    (name: string, props?: EventProps) => {
      trackAction(name, withAuth(props));
    },
    [withAuth]
  );

  return { trackEvent };
}

/**
 * 에러 트래킹 훅 (로그인 상태 자동 주입)
 */
export function useTrackError() {
  const { withAuth } = useWithAuth();

  const track = useCallback(
    (name: string, error?: Error | string, props?: EventProps) => {
      trackError(name, error, withAuth(props));
    },
    [withAuth]
  );

  return { trackError: track };
}

// ============================================
// 도메인별 특화 훅
// ============================================

/**
 * 로그인 트래킹 훅 (로그인 상태 자동 주입)
 * @example
 * const { onLoginSuccess, onLoginFail } = useLoginTracking("kakao");
 *
 * try {
 *   await login();
 *   onLoginSuccess();
 * } catch (e) {
 *   onLoginFail(e);
 * }
 */
export function useLoginTracking(method: "kakao" | "google") {
  const { withAuth } = useWithAuth();

  const onLoginSuccess = useCallback(() => {
    trackAction("login_success", withAuth({ method }));
  }, [method, withAuth]);

  const onLoginFail = useCallback(
    (error?: Error | string) => {
      trackError("login_fail", error, withAuth({ method }));
    },
    [method, withAuth]
  );

  return { onLoginSuccess, onLoginFail };
}

/**
 * 결제 트래킹 훅 (로그인 상태 자동 주입)
 * @example
 * const { onPaymentSuccess, onPaymentFail, onCheckoutStart } = usePaymentTracking();
 *
 * // 주문서 진입 시
 * onCheckoutStart({ ticket_count: 2 });
 *
 * // 결제 완료 시
 * onPaymentSuccess({ payment_method: "toss" });
 */
export function usePaymentTracking() {
  const { withAuth } = useWithAuth();

  const onCheckoutStart = useCallback(
    (props?: EventProps) => {
      trackAction("checkout_start", withAuth(props));
    },
    [withAuth]
  );

  const onPaymentStart = useCallback(
    (props?: EventProps) => {
      trackAction("payment_start", withAuth(props));
    },
    [withAuth]
  );

  const onPaymentSuccess = useCallback(
    (props?: EventProps) => {
      trackAction("payment_success", withAuth(props));
    },
    [withAuth]
  );

  const onPaymentFail = useCallback(
    (error?: Error | string, props?: EventProps) => {
      trackError("payment_fail", error, withAuth(props));
    },
    [withAuth]
  );

  return { onCheckoutStart, onPaymentStart, onPaymentSuccess, onPaymentFail };
}

/**
 * 좌석 트래킹 훅 (로그인 상태 자동 주입)
 * @example
 * const { onSeatRecommendClick, onSeatSelectClick } = useSeatTracking();
 *
 * // 추천 좌석 선택 시
 * onSeatRecommendClick({ seat_count: 2 });
 */
export function useSeatTracking() {
  const { withAuth } = useWithAuth();

  const onSeatRecommendClick = useCallback(
    (props?: EventProps) => {
      trackAction("seat_recommend_click", withAuth(props));
    },
    [withAuth]
  );

  const onSeatSelectClick = useCallback(
    (props?: EventProps) => {
      trackAction("seat_select_click", withAuth(props));
    },
    [withAuth]
  );

  const onSeatFetchFail = useCallback(
    (error?: Error | string, props?: EventProps) => {
      trackError("seat_fetch_fail", error, withAuth(props));
    },
    [withAuth]
  );

  return { onSeatRecommendClick, onSeatSelectClick, onSeatFetchFail };
}

/**
 * 매치 트래킹 훅 (로그인 상태 자동 주입)
 * @example
 * const { onMatchClick } = useMatchTracking();
 *
 * // 매치 카드 클릭 시
 * onMatchClick({ match_slug: "lg-vs-samsung-20260401" });
 */
export function useMatchTracking() {
  const { withAuth } = useWithAuth();

  const onMatchClick = useCallback(
    (props?: EventProps) => {
      trackAction("match_click", withAuth(props));
    },
    [withAuth]
  );

  const onMatchDetailView = useCallback(
    (props?: EventProps) => {
      trackAction("match_detail_view", withAuth(props));
    },
    [withAuth]
  );

  return { onMatchClick, onMatchDetailView };
}

/**
 * API 에러 트래킹 훅 (로그인 상태 자동 주입)
 * @example
 * const { onApiFail } = useApiTracking();
 *
 * try {
 *   await fetchData();
 * } catch (e) {
 *   onApiFail("seat_api", e);
 * }
 */
export function useApiTracking() {
  const { withAuth } = useWithAuth();

  const onApiFail = useCallback(
    (apiName: string, error?: Error | string, props?: EventProps) => {
      trackError(`${apiName}_fail`, error, withAuth(props));
    },
    [withAuth]
  );

  return { onApiFail };
}
