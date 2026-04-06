/* ===========================
   Order-Core Service
   - 경기, 구단, 온보딩 선호도 API 호출
   - Backend: Order-Core 서비스
   - TODO: 나중에 백엔드에서 permitAll 설정하면 auth → pub 사용
=========================== */

import { API_BASE_URL } from "@/lib/api/config";
import { auth, pub } from "@/lib/api/fetch";
import type {
  Club,
  Stadium,
  SaleStatus,
  Match,
  MatchesData,
  MatchDetail,
  ClubsData,
  ClubDetail,
  OnboardingStatusResponse,
  OnboardingPreferencesRequest,
  ClubMonthMatches,
  OnboardingPreferencesResponse,
  PreferredBlockUpdateRequest,
  OrderSheetResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  ProcessPaymentRequest,
  ProcessPaymentResponse,
  CreateCashReceiptRequest,
  CreateCashReceiptResponse,
  CreateInquiryRequest,
  CreateInquiryResponse,
  IssueInquiryPresignedUrlRequest,
  IssueInquiryPresignedUrlResponse,
  ConfirmInquiryFileRequest,
} from "@/lib/types";

// Re-export types for convenience
export type {
  Club,
  Stadium,
  SaleStatus,
  Match,
  MatchesData,
  MatchDetail,
  ClubsData,
  ClubDetail,
  OnboardingStatusResponse,
  OnboardingPreferencesRequest,
  OnboardingPreferencesResponse,
  PreferredBlockUpdateRequest
};

/* 경기 목록 조회 */
export const getMatches = (date?: string) => {
  const params = date ? `?date=${date}` : "";
  return pub.get<MatchesData>(`${API_BASE_URL}/order/matches${params}`);
};

/* 경기 상세 조회 */
export const getMatchById = (matchId: string | number) =>
  pub.get<MatchDetail>(`${API_BASE_URL}/order/matches/${matchId}`);

/* 구단 목록 조회 */
export const getClubs = () => pub.get<ClubsData>(`${API_BASE_URL}/order/clubs`);

/* 구단 상세 조회 */
export const getClubById = (clubId: string | number) =>
  pub.get<ClubDetail>(`${API_BASE_URL}/order/clubs/${clubId}`);

/* 구단 경기 일정(월 단위) 조회 */
export const getClubSchedule = (
  clubId: string | number,
  year: string | number,
  month: string | number,
) =>
  pub.get<ClubMonthMatches>(
    `${API_BASE_URL}/order/clubs/${clubId}/matches?year=${year}&month=${month}`,
  );

/* 온보딩 선호도 조회 */
export const getOnboardingStatus = () =>
  auth.get<{
    onboardingStatus: boolean;
    onboardingCompletedAt?: string | null;
  }>(
    `${API_BASE_URL}/order/onboarding/status`,
  );

/* 온보딩 선호도 저장 */
export const saveOnboardingPreferences = (body: OnboardingPreferencesRequest) =>
  auth.post(`${API_BASE_URL}/order/onboarding/preferences`, body);

/* 온보딩 선호도 응답 */
export const getOnboardingPreferences = () =>
  auth.get<OnboardingPreferencesResponse>(`${API_BASE_URL}/order/onboarding/preferences`);

/* 선호 구역 수정 */
export const saveOnboardingPreferencesBlocks = (body: PreferredBlockUpdateRequest) =>
  auth.put(`${API_BASE_URL}/order/onboarding/preferred-blocks`, body);

/* 주문서 조회 */
export const getOrderSheet = (
  matchId: string | number,
  seatIds: number[],
) =>
  auth.get<OrderSheetResponse>(
    `${API_BASE_URL}/order/mypage/orders/sheet?matchId=${matchId}&seatIds=${seatIds.join(",")}`
  );

/* 주문 생성 */
export const createOrder = (body: CreateOrderRequest) =>
  auth.post<CreateOrderResponse, CreateOrderRequest>(
    `${API_BASE_URL}/order/mypage/orders`,
    body,
  );

/* 결제 처리 */
export const processPayment = (
  orderId: number,
  body: ProcessPaymentRequest,
) =>
  auth.post<ProcessPaymentResponse, ProcessPaymentRequest>(
    `${API_BASE_URL}/order/mypage/orders/${orderId}/payment`,
    body,
  );

/* 현금 영수증 신청 */
export const createCashReceipt = (
  orderId: number,
  body: CreateCashReceiptRequest,
) =>
  auth.post<CreateCashReceiptResponse, CreateCashReceiptRequest>(
    `${API_BASE_URL}/order/mypage/orders/${orderId}/cash-receipt`,
    body,
  );

/* 1대1 문의 작성 */
export const createInquiry = (body: CreateInquiryRequest) =>
  auth.post<CreateInquiryResponse, CreateInquiryRequest>(
    `${API_BASE_URL}/order/mypage/inquiries`,
    body,
  );

/* 1대1 문의 이미지 */
export const issueInquiryPresignedUrl = (
  inquiryId: number,
  body: IssueInquiryPresignedUrlRequest,
) =>
  auth.post<IssueInquiryPresignedUrlResponse, IssueInquiryPresignedUrlRequest>(
    `${API_BASE_URL}/order/mypage/inquiries/${inquiryId}/presigned-url`,
    body,
  );

/* 문의 첨부파일 확정 */
export const confirmInquiryFile = (
  inquiryId: number,
  body: ConfirmInquiryFileRequest,
) =>
  auth.patch<string, ConfirmInquiryFileRequest>(
    `${API_BASE_URL}/order/mypage/inquiries/${inquiryId}/file`,
    body,
  );