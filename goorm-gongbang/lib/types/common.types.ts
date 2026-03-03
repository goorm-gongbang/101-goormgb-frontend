/**
 * Common Types
 * 공통으로 사용되는 타입 정의
 */

/** API 응답 공통 래퍼 */
export type ApiResponse<T> = {
  code: string;
  message: string;
  data: T;
};

/** API 에러 응답 */
export type ApiErrorResponse = {
  code: string;
  message: string;
  data?: null;
};

/** 페이지네이션 메타 */
export type PaginationMeta = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

/** 페이지네이션 응답 */
export type PaginatedResponse<T> = ApiResponse<{
  content: T[];
  meta: PaginationMeta;
}>;
