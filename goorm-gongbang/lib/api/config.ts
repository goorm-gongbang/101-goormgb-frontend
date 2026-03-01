/* ===========================
   API Configuration
   - 모든 API 호출의 base URL을 중앙에서 관리
=========================== */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/* CDN URLs */
export const CDN_CLUBS_BASE_URL = process.env.NEXT_PUBLIC_CDN_CLUBS_BASE_URL ?? "";
