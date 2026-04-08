/* ===========================
   Mypage Service
   - 마이페이지 관련 API 호출
   - Backend: Mypage 서비스
=========================== */

import { API_BASE_URL } from "@/lib/api/config";
import { auth } from "@/lib/api/fetch";
import { ApiError } from "@/lib/api/error";
import { toast } from "sonner";
import type { AccountInfo, UpdateNicknameRequest, TicketListData, TicketListParams, TicketDetail, TicketQrData, UpcomingTicketData, TicketCancelResult, MyPageProfileData, InquiryDetail } from "@/lib/types";

/* 닉네임 수정 */
export const updateNickname = async (body: UpdateNicknameRequest): Promise<AccountInfo> => {
  try {
    return await auth.put<AccountInfo, UpdateNicknameRequest>(
      `${API_BASE_URL}/order/mypage/account`,
      body,
    );
  } catch (err) {
    const message =
      err instanceof ApiError && err.status === 400
        ? "닉네임 입력값을 확인해주세요."
        : err instanceof ApiError
          ? err.message
          : "닉네임 수정에 실패했습니다.";
    toast.error(message);
    throw err;
  }
};

/* 예매 내역 조회 */
export const getTicketList = async (params: TicketListParams = {}): Promise<TicketListData> => {
  const query = new URLSearchParams();
  if (params.tab !== undefined) query.set("tab", params.tab);
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.size !== undefined) query.set("size", String(params.size));
  const qs = query.toString();

  try {
    return await auth.get<TicketListData>(
      `${API_BASE_URL}/order/mypage/tickets${qs ? `?${qs}` : ""}`,
    );
  } catch (err) {
    const message =
      err instanceof ApiError && err.status === 400
        ? "잘못된 요청입니다. 페이지 크기는 최대 10까지 가능합니다."
        : err instanceof ApiError
          ? err.message
          : "예매 내역을 불러오지 못했습니다.";
    toast.error(message);
    throw err;
  }
};

/* 예매 상세 조회 */
export const getTicketDetail = async (ticketId: number): Promise<TicketDetail> => {
  try {
    return await auth.get<TicketDetail>(`${API_BASE_URL}/order/mypage/tickets/${ticketId}`);
  } catch (err) {
    const message =
      err instanceof ApiError && err.status === 403
        ? "본인 소유의 티켓만 조회할 수 있습니다."
        : err instanceof ApiError && err.status === 404
          ? "티켓 정보를 찾을 수 없습니다."
          : err instanceof ApiError
            ? err.message
            : "예매 상세 정보를 불러오지 못했습니다.";
    toast.error(message);
    throw err;
  }
};

/* 경기 예정 티켓 조회 */
export const getUpcomingTickets = async (params: { page?: number; size?: number } = {}): Promise<UpcomingTicketData> => {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.size !== undefined) query.set("size", String(params.size));
  const qs = query.toString();

  try {
    return await auth.get<UpcomingTicketData>(
      `${API_BASE_URL}/order/mypage/tickets/upcoming${qs ? `?${qs}` : ""}`,
    );
  } catch (err) {
    const message =
      err instanceof ApiError && err.status === 400
        ? "잘못된 요청입니다. 페이지 크기는 최대 10까지 가능합니다."
        : err instanceof ApiError
          ? err.message
          : "경기 예정 티켓을 불러오지 못했습니다.";
    toast.error(message);
    throw err;
  }
};

/* QR 토큰 조회 */
export const getTicketQr = async (ticketId: number): Promise<TicketQrData> => {
  try {
    return await auth.get<TicketQrData>(`${API_BASE_URL}/order/mypage/tickets/${ticketId}/qr`);
  } catch (err) {
    // 400은 입장 가능 시간이 아닌 경우 등 UI에서 직접 처리하므로 toast 생략
    if (err instanceof ApiError && err.status === 400) {
      throw err;
    }
    const message =
      err instanceof ApiError && err.status === 403
        ? "본인 소유의 티켓만 조회할 수 있습니다."
        : err instanceof ApiError && err.status === 404
          ? "티켓 정보를 찾을 수 없습니다."
          : err instanceof ApiError
            ? err.message
            : "QR 정보를 불러오지 못했습니다.";
    toast.error(message);
    throw err;
  }
};

/* 티켓 취소 */
export const cancelTicket = async (ticketId: number): Promise<TicketCancelResult> => {
  try {
    return await auth.post<TicketCancelResult>(
      `${API_BASE_URL}/order/mypage/tickets/${ticketId}/cancel`,
    );
  } catch (err) {
    const message =
      err instanceof ApiError && err.status === 400
        ? "취소할 수 없는 상태의 티켓입니다."
        : err instanceof ApiError && err.status === 403
          ? "본인 소유의 티켓만 취소할 수 있습니다."
          : err instanceof ApiError && err.status === 404
            ? "티켓 정보를 찾을 수 없습니다."
            : err instanceof ApiError
              ? err.message
              : "티켓 취소에 실패했습니다.";
    toast.error(message);
    throw err;
  }
};

/* 마이페이지 프로필 조회 */
export const getMyPageProfile = async (): Promise<MyPageProfileData> => {
  try {
    return await auth.get<MyPageProfileData>(`${API_BASE_URL}/order/mypage/profile`);
  } catch (err) {
    const message =
      err instanceof ApiError && err.status === 404
        ? "사용자 정보를 찾을 수 없습니다."
        : err instanceof ApiError
          ? err.message
          : "프로필 정보를 불러오지 못했습니다.";
    toast.error(message);
    throw err;
  }
};

/* 문의 상세 조회 */
export const getInquiryDetail = async (inquiryId: number): Promise<InquiryDetail> => {
  try {
    return await auth.get<InquiryDetail>(`${API_BASE_URL}/order/mypage/inquiries/${inquiryId}`);
  } catch (err) {
    const message =
      err instanceof ApiError && err.status === 403
        ? "본인 문의만 조회할 수 있습니다."
        : err instanceof ApiError && err.status === 404
          ? "문의 내역을 찾을 수 없습니다."
          : err instanceof ApiError
            ? err.message
            : "문의 상세 정보를 불러오지 못했습니다.";
    toast.error(message);
    throw err;
  }
};

/* 계정 기본 정보 조회 */
export const getAccountInfo = async (): Promise<AccountInfo> => {
  try {
    return await auth.get<AccountInfo>(`${API_BASE_URL}/order/mypage/account`);
  } catch (err) {
    const message =
      err instanceof ApiError ? err.message : "계정 정보를 불러오지 못했습니다.";
    toast.error(message);
    throw err;
  }
};
