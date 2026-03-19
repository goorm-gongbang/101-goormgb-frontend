"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronsLeft, ChevronsRight, ChevronLeft } from "lucide-react";
import { PaymentDepositModal } from "@/components/my/PaymentDepositModal";
import { CancelTicketModal } from "@/components/my/CancelTicketModal";
import { TicketInfo } from "@/components/my/TicketDetailModal";
import { ReservationItem } from "@/components/my/ReservationItem";

/* ===========================
   [API 연동 가이드] - 데이터 모델
   - 백엔드 측 API (예: GET /api/v1/my/reservations) 명세에 맞추어 아래 Mock 데이터를 실제 Type으로 변경하세요.
   - status 필드의 경우 Enum Type("PAYMENT_WAITING", "RESERVED", "CANCEL_PROCESSING", "REFUND_PROCESSING") 활용을 권장합니다.
=========================== */
export type ReservationStatus = "PAYMENT_WAITING" | "RESERVED" | "CANCEL_PROCESSING" | "REFUND_PROCESSING" | "CANCEL_COMPLETED" | "REFUND_COMPLETED";

export const RESERVATION_STATUS_MAP: Record<ReservationStatus, string> = {
    PAYMENT_WAITING: "입금 대기",
    RESERVED: "결제 완료",
    CANCEL_PROCESSING: "취소 처리 중",
    REFUND_PROCESSING: "환불 처리 중",
    CANCEL_COMPLETED: "취소 완료",
    REFUND_COMPLETED: "환불 완료",
};

export interface Reservation {
    id: string;
    date: string;
    matchTitle: string;
    location: string;
    count: number;
    seat: string;
    status: ReservationStatus;
}

export const MOCK_RESERVATIONS: Reservation[] = [
    { id: "5", date: "2026. 04. 02 (14:00)", matchTitle: "LG 트윈스 vs kt 위즈", location: "잠실", count: 3, seat: "블루석 123블럭 E열 23번, 24번, 25번", status: "CANCEL_PROCESSING" },
    { id: "4", date: "2026. 04. 01 (18:30)", matchTitle: "LG 트윈스 vs SSG 랜더스", location: "잠실", count: 4, seat: "블루석 201블럭 I열 2번, 3번, 4번, 5번", status: "RESERVED" },
    { id: "3", date: "2026. 03. 31 (18:30)", matchTitle: "LG 트윈스 vs KIA 타이거즈", location: "잠실", count: 2, seat: "오렌지석 206블럭 F열 23번, 24번", status: "CANCEL_PROCESSING" },
    { id: "2", date: "2026. 03. 29 (14:00)", matchTitle: "LG 트윈스 vs kt 위즈", location: "잠실", count: 3, seat: "오렌지석 206블럭 3열 13번, 14번", status: "RESERVED" },
    { id: "1", date: "2026. 03. 28 (14:00)", matchTitle: "LG 트윈스 vs kt 위즈", location: "잠실", count: 2, seat: "오렌지석 201블럭 H열 13번, 14번", status: "PAYMENT_WAITING" },
    { id: "10", date: "2025. 10. 27 (18:30)", matchTitle: "LG 트윈스 vs 한화 이글스", location: "잠실", count: 5, seat: "오렌지석 206블럭 F열 23번, 24번", status: "RESERVED" },
    { id: "9", date: "2025. 10. 26 (14:00)", matchTitle: "LG 트윈스 vs 한화 이글스", location: "잠실", count: 2, seat: "오렌지석 206블럭 F열 23번, 24번", status: "RESERVED" },
    { id: "8", date: "2025. 10. 01 (18:30)", matchTitle: "LG 트윈스 vs NC 다이노즈", location: "잠실", count: 1, seat: "오렌지석 206블럭 F열 23번, 24번", status: "RESERVED" },
    { id: "7", date: "2025. 09. 07 (17:00)", matchTitle: "LG 트윈스 vs SSG 랜더스", location: "잠실", count: 3, seat: "오렌지석 206블럭 F열 23번, 24번", status: "RESERVED" },
    { id: "6", date: "2025. 09. 06 (17:00)", matchTitle: "두산 베어스 vs LG 트윈스", location: "잠실", count: 3, seat: "오렌지석 206블럭 F열 23번, 24번", status: "REFUND_PROCESSING" },
    { id: "11", date: "2025. 08. 15 (14:00)", matchTitle: "LG 트윈스 vs 롯데 자이언츠", location: "잠실", count: 2, seat: "오렌지석 206블럭 F열 23번, 24번", status: "CANCEL_COMPLETED" },
    { id: "12", date: "2025. 08. 14 (18:30)", matchTitle: "LG 트윈스 vs 롯데 자이언츠", location: "잠실", count: 4, seat: "블루석 201블럭 I열 2번, 3번, 4번, 5번", status: "REFUND_COMPLETED" },
];

const MOCK_DEPOSIT_INFO = {
    bankName: "국민",
    accountNumber: "000-0000-0000-00",
    accountHolder: "윤정빈",
    amount: 42000,
    deadline: "2026년 3월 24일 (화) 23:59",
};

export default function ReservationsPage() {
    const router = useRouter();

    // TODO: [API 연동 가이드] - 선택된 탭 정보(예: '?tab=history')를 Query String으로 관리하거나 State로 관리합니다.
    const [activeTab, setActiveTab] = useState<"HISTORY" | "CANCEL">("HISTORY");

    /* ===========================
       TODO: [API 연동 가이드] - 통계 정보 및 리스트 조회 
       1. 화면 진입 시 통계 데이터 API (ex: GET /api/v1/my/reservations/summary) 통신
       2. 페이징 및 필터별 리스트 데이터 API (ex: GET /api/v1/my/reservations?page=1&size=10&tab=HISTORY) 통신
       3. isLoading 상태를 두어 Suspense 혹은 Skeleton UI 적용 권장
    =========================== */
    const mockSummary = {
        total: 72,
        upcoming: 3,
        canceling: 2,
        completed: 67
    };

    const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);

    // 모달 상태 관리
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [selectedTicketInfo, setSelectedTicketInfo] = useState<TicketInfo | null>(null);
    const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);

    // 액션 핸들러
    const handleActionClick = (e: React.MouseEvent, item: Reservation) => {
        e.stopPropagation();
        if (item.status === "PAYMENT_WAITING") {
            setIsDepositModalOpen(true);
        } else if (item.status === "RESERVED") {
            // "오렌지석 201블럭 H열 13번, 14번" 파싱
            const parts = item.seat.split(" ");
            const type = parts[0] || "";
            const zone = parts[1] || "";
            const seat = parts.slice(2).join(" ");

            const datePart = item.date.split(" (")[0];
            const timePart = item.date.match(/\((.*?)\)/)?.[1] || "";

            setSelectedTicketInfo({
                matchTitle: item.matchTitle,
                count: item.count,
                type,
                zone,
                seat,
                date: datePart,
                time: timePart,
                location: item.location,
                dateStr: item.date
            });
            setSelectedReservationId(item.id);
            setIsCancelModalOpen(true);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F5] font-pretendard">
            {/* ─── 상단 헤더 (breadcrumb) ─── */}
            <div className="sticky top-0 z-10 bg-white border-b border-[#F0F0F0]">
                <div className="max-w-[1200px] mx-auto px-4 h-12 flex items-center justify-end">
                    <nav className="flex items-center gap-1.5 text-[13px] text-[#9E9E9E]">
                        <button
                            type="button"
                            onClick={() => router.push("/my")}
                            className="hover:text-[#1A1A1A] transition-colors"
                        >
                            마이페이지
                        </button>
                        <span>&gt;</span>
                        <span className="text-[#1A1A1A] font-medium">예매 내역</span>
                    </nav>
                </div>
            </div>

            {/* ─── 본문 ─── */}
            <div className="max-w-[1200px] mx-auto px-4 py-8 flex flex-col min-h-[calc(100vh-48px)]">

                {/* 타이틀 및 백버튼 */}
                <div className="mb-6 flex flex-col gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="text-[13px] text-[#9E9E9E] hover:text-[#1A1A1A] transition-colors self-start font-medium"
                    >
                        &lt; 이전으로 돌아가기
                    </button>
                    <h1 className="text-[24px] font-bold text-[#1A1A1A]">예매 내역</h1>
                </div>

                {/* 요약(Summary) 카드 4개 구성 */}
                {/* TODO: [API 연동 가이드] API 응답 데이터 (mockSummary 속성들)를 바인딩 하세요. */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-[16px] border border-[#E8E8E8] p-6 flex flex-col gap-3 shadow-sm">
                        <span className="text-[15px] font-bold text-[#333]">총 예매 수</span>
                        <span className="text-[32px] font-bold text-[#1A1A1A] leading-none">{mockSummary.total}</span>
                    </div>
                    <div className="bg-white rounded-[16px] border border-[#E8E8E8] p-6 flex flex-col gap-3 shadow-sm">
                        <span className="text-[15px] font-bold text-[#333]">경기 예정</span>
                        <span className="text-[32px] font-bold text-[var(--foundation-primary-500)] leading-none">{mockSummary.upcoming}</span>
                    </div>
                    <div className="bg-white rounded-[16px] border border-[#E8E8E8] p-6 flex flex-col gap-3 shadow-sm">
                        <span className="text-[15px] font-bold text-[#333]">취소 처리 중</span>
                        <span className="text-[32px] font-bold text-[var(--foundation-red-500)] leading-none">{mockSummary.canceling}</span>
                    </div>
                    <div className="bg-white rounded-[16px] border border-[#E8E8E8] p-6 flex flex-col gap-3 shadow-sm">
                        <span className="text-[15px] font-bold text-[#333]">경기 완료</span>
                        <span className="text-[32px] font-bold text-[#A3A3A3] leading-none">{mockSummary.completed}</span>
                    </div>
                </div>

                {/* 탭 네비게이션 */}
                {/* TODO: [API 연동 가이드] 탭 변경(onClick) 시 List Fetch API를 재호출하도록 연동하세요. */}
                <div className="flex items-center gap-6 border-b border-[#E8E8E8] mb-6">
                    <button
                        onClick={() => setActiveTab("HISTORY")}
                        className={`pb-3 text-[16px] font-bold transition-colors relative ${activeTab === "HISTORY" ? "text-[var(--foundation-primary-500)]" : "text-[#9E9E9E] hover:text-[#666]"
                            }`}
                    >
                        예매 내역
                        {activeTab === "HISTORY" && (
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--foundation-primary-500)]" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("CANCEL")}
                        className={`pb-3 text-[16px] font-bold transition-colors relative ${activeTab === "CANCEL" ? "text-[var(--foundation-primary-500)]" : "text-[#9E9E9E] hover:text-[#666]"
                            }`}
                    >
                        취소/환불
                        {activeTab === "CANCEL" && (
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--foundation-primary-500)]" />
                        )}
                    </button>
                </div>

                {/* 테이블 (리스트 영역) */}
                <div className="bg-white rounded-[12px] border border-[#E8E8E8] overflow-hidden">
                    {/* 테이블 헤더 */}
                    <div className="grid grid-cols-[minmax(180px,1fr)_minmax(200px,1fr)_100px_80px_minmax(280px,2fr)_minmax(200px,1fr)] items-center px-6 py-4 bg-[#FAFAFA] border-b border-[#E8E8E8] text-[14px] text-[#666] font-semibold">
                        <div>경기 일시</div>
                        <div>경기 정보</div>
                        <div>장소</div>
                        <div>티켓 수</div>
                        <div>좌석 정보</div>
                        <div className="pl-4">진행 상황</div>
                    </div>

                    {/* 테이블 바디 */}
                    <div className="flex flex-col">
                        {
                            // 탭에 따른 리스트 분기 처리 (취소/환불 탭의 경우 취소, 환불 완료된 건들만 노출)
                            reservations
                                .filter(item => {
                                    if (activeTab === "CANCEL") {
                                        return item.status === "CANCEL_COMPLETED" || item.status === "REFUND_COMPLETED";
                                    }
                                    return item.status !== "CANCEL_COMPLETED" && item.status !== "REFUND_COMPLETED";
                                })
                                .map((item, index, filteredArr) => {
                                    return (
                                        <ReservationItem
                                            key={item.id}
                                            item={item}
                                            index={index}
                                            isLast={index === filteredArr.length - 1}
                                            onActionClick={handleActionClick}
                                        />
                                    );
                                })}
                    </div>
                </div>

                {/* Pagination */}
                {/* TODO: [API 연동 가이드] 백엔드에서 전달받은 Total Elements 수를 기반으로 Pagination 컴포넌트를 동작시키세요. */}
                <div className="mt-12 mb-8 flex items-center justify-center gap-5 text-[#999999] text-[15px]">
                    <button className="hover:text-[#1A1A1A] transition-colors"><ChevronsLeft size={16} /></button>
                    <button className="hover:text-[#1A1A1A] transition-colors"><ChevronLeft size={16} /></button>
                    <button className="text-[var(--foundation-primary-500)] font-bold text-[16px] underline underline-offset-4">1</button>
                    <button className="hover:text-[#1A1A1A] transition-colors">2</button>
                    <button className="hover:text-[#1A1A1A] transition-colors">3</button>
                    <button className="hover:text-[#1A1A1A] transition-colors">4</button>
                    <button className="hover:text-[#1A1A1A] transition-colors"><ChevronRight size={16} /></button>
                    <button className="hover:text-[#1A1A1A] transition-colors"><ChevronsRight size={16} /></button>
                </div>

                {/* 입금 안내 모달 */}
                <PaymentDepositModal
                    isOpen={isDepositModalOpen}
                    onClose={() => setIsDepositModalOpen(false)}
                    depositInfo={MOCK_DEPOSIT_INFO}
                />

                {/* 취소 모달 */}
                <CancelTicketModal
                    isOpen={isCancelModalOpen}
                    onClose={() => setIsCancelModalOpen(false)}
                    ticketInfo={selectedTicketInfo}
                    paymentAmount={selectedTicketInfo ? selectedTicketInfo.count * 20000 + 2000 : 0} // 선택된 좌석 수에 맞게 동적 설정
                    cancelFee={2000} // 예시 고정값
                    onCancelSuccess={() => {
                        if (selectedReservationId) {
                            setReservations(prev =>
                                prev.map(res =>
                                    res.id === selectedReservationId
                                        ? { ...res, status: "CANCEL_PROCESSING" }
                                        : res
                                )
                            );
                        }
                    }}
                />

            </div>
        </div>
    );
}
