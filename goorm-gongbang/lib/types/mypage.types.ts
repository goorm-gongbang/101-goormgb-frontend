/**
 * Mypage Service Types
 * 마이페이지 관련 타입 정의
 */

/* SNS 연동 계정 정보 */
export type SnsAccount = {
  provider: string;
  providerUserId: string;
};

/* 계정 기본 정보 */
export type AccountInfo = {
  email: string;
  nickname: string;
  profileImageUrl: string;
  snsAccount: SnsAccount;
};

/* 계정 정보 조회/수정 응답 래퍼 */
export type AccountInfoResponse = {
  code: string;
  message: string;
  data: AccountInfo;
};

/* 닉네임 수정 요청 */
export type UpdateNicknameRequest = {
  nickname: string;
};

/* ─── 예매 내역 조회 ─── */

export type TicketTab = "BOOKED" | "CANCEL_REFUND";

export type TicketListParams = {
  tab?: TicketTab;
  page?: number;
  size?: number;
};

export type TicketSummary = {
  totalCount: number;
  upcomingCount: number;
  cancelProcessingCount: number;
  completedCount: number;
};

export type Pagination = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};

export type TicketClub = {
  clubId: number;
  koName: string;
};

export type TicketSeat = {
  sectionName: string;
  blockCode: string;
  rowNo: number;
  seatNo: number;
};

export type TicketActions = {
  canDeposit: boolean;
  canCancel: boolean;
  canViewDetail: boolean;
};

export type TicketItem = {
  ticketId: number;
  matchAt: string;
  homeClub: TicketClub;
  awayClub: TicketClub;
  stadiumName: string;
  seatCount: number;
  seats: TicketSeat[];
  status: string;
  actions: TicketActions;
};

export type TicketListData = {
  summary: TicketSummary;
  currentTab: string;
  pagination: Pagination;
  tickets: TicketItem[];
};

export type TicketListResponse = {
  code: string;
  message: string;
  data: TicketListData;
};

/* ─── 예매 상세 조회 ─── */

export type TicketStadium = {
  stadiumId: number;
  koName: string;
  address: string;
};

export type TicketMatch = {
  matchId: number;
  matchAt: string;
  homeClub: TicketClub;
  awayClub: TicketClub;
  stadium: TicketStadium;
};

export type CashReceipt = {
  type: string;
  number: string;
  totalAmount: number;
};

export type TicketPayment = {
  totalAmount: number;
  serviceFee: number;
  paymentMethod: string;
  paidAt: string;
  cashReceipt: CashReceipt | null;
};

export type CancellationPolicy = {
  deadline: string;
  feeRate: string;
};

export type VirtualAccount = {
  bank: string;
  accountNumber: string;
  holder: string;
  depositDeadline: string;
};

export type TicketCancellation = {
  cancelledAt: string;
  cancellationFee: number;
  refundedAmount: number;
};

export type TicketDetail = {
  ticketId: number;
  status: string;
  match: TicketMatch;
  seats: TicketSeat[];
  payment: TicketPayment | null;
  cancellationPolicy: CancellationPolicy | null;
  virtualAccount: VirtualAccount | null;
  cancellation: TicketCancellation | null;
  actions: TicketActions;
};

export type TicketDetailResponse = {
  code: string;
  message: string;
  data: TicketDetail;
};

/* ─── 경기 예정 티켓 조회 ─── */

export type UpcomingTicketItem = {
  ticketId: number;
  dDay: number;
  status: string;
  statusLabel: string;
  seatCount: number;
  match: TicketMatch;
  seats: TicketSeat[];
  actions: TicketActions;
};

export type UpcomingTicketData = {
  totalCount: number;
  pagination: Pagination;
  tickets: UpcomingTicketItem[];
};

export type UpcomingTicketResponse = {
  code: string;
  message: string;
  data: UpcomingTicketData;
};

/* ─── 마이페이지 프로필 조회 ─── */

export type UserProfile = {
  nickname: string;
  profileImageUrl: string;
  snsProvider: string;
};

export type MyPageProfileData = {
  profile: UserProfile;
  ticketSummary: TicketSummary;
};

export type MyPageProfileResponse = {
  code: string;
  message: string;
  data: MyPageProfileData;
};

/* ─── 티켓 취소 ─── */

export type TicketCancelResult = {
  ticketId: number;
  status: string;
  totalAmount: number;
  cancellationFee: number;
  refundedAmount: number;
};

export type TicketCancelResponse = {
  code: string;
  message: string;
  data: TicketCancelResult;
};

/* ─── 문의 상세 조회 ─── */

export type InquiryDetail = {
  inquiryId: number;
  category: string;
  title: string;
  content: string;
  phoneNumber: string;
  status: string;
  fileAttached: boolean;
  downloadUrl: string | null;
  createdAt: string;
};

export type InquiryDetailResponse = {
  code: string;
  message: string;
  data: InquiryDetail;
};

/* ─── QR 토큰 조회 ─── */

export type TicketQrData = {
  ticketId: number;
  qrToken: string;
  expiresAt: string;
  match: TicketMatch;
  seats: TicketSeat[];
};

export type TicketQrResponse = {
  code: string;
  message: string;
  data: TicketQrData;
};
