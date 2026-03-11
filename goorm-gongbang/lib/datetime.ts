const KST_TIMEZONE = "Asia/Seoul";

/**
 * 서버의 UTC ISO 스트링을 JavaScript Date 객체로 변환합니다.
 * 내부 계산(D-Day, 타이머 등)용으로 사용합니다.
 */
export const toDate = (utcIso: string): Date => new Date(utcIso);

/**
 * 서버의 UTC ISO 스트링을 KST(Asia/Seoul) 시간으로 변환하여 포맷팅합니다.
 * 화면 렌더링 직전에만 사용합니다.
 * 
 * @param utcIso 서버에서 받은 UTC ISO 8601 문자열 (예: 2026-03-05T00:00:00Z)
 * @param opts Intl.DateTimeFormatOptions (기본값: YYYY. MM. DD. HH:mm)
 */
export const formatKST = (
  utcIso: string | Date,
  opts: Intl.DateTimeFormatOptions = {},
) => {
  if (!utcIso) return "";
  const date = typeof utcIso === "string" ? new Date(utcIso) : utcIso;
  
  // 파싱 실패 시 원문 반환 방어 코드
  if (isNaN(date.getTime())) {
    return typeof utcIso === "string" ? utcIso : "";
  }

  const defaultOpts: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...opts,
  };

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: KST_TIMEZONE,
    ...defaultOpts,
  }).format(date);
};
