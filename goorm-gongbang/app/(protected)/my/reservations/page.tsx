"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { PaymentDepositModal } from "@/components/my/PaymentDepositModal";
import { CancelTicketModal } from "@/components/my/CancelTicketModal";
import { TicketInfo } from "@/components/my/TicketDetailModal";
import { ReservationItem } from "@/components/my/ReservationItem";
import { getTicketList, getTicketDetail } from "@/lib/services";
import { parseFeeRate } from "@/lib/utils";
import type { TicketItem, TicketSummary } from "@/lib/types";

/* ===========================
   Reservation 타입 (UI용)
=========================== */
export type ReservationStatus =
    | "PAYMENT_PENDING"
    | "PAID"
    | "RESERVED"
    | "UNDER_REVIEW"
    | "CANCEL_REQUESTED"
    | "CANCEL_PROCESSING"
    | "CANCELLED"
    | "REFUND_PROCESSING"
    | "CANCEL_COMPLETED"
    | "REFUND_COMPLETED";

export const CANCEL_REFUND_STATUSES: ReservationStatus[] = [
    "CANCEL_REQUESTED",
    "CANCEL_PROCESSING",
    "CANCELLED",
    "REFUND_PROCESSING",
    "CANCEL_COMPLETED",
    "REFUND_COMPLETED",
];

export const RESERVATION_STATUS_MAP: Record<string, string> = {
    PAYMENT_PENDING: "입금 대기",
    PAID: "결제 완료",
    RESERVED: "결제 완료",
    UNDER_REVIEW: "정밀 확인 중",
    CANCEL_REQUESTED: "취소 요청 중",
    CANCEL_PROCESSING: "취소 처리 중",
    CANCELLED: "취소 완료",
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

const PAGE_SIZE = 10;

function getPageRange(current: number, total: number): (number | "ellipsis")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);

    const pages: (number | "ellipsis")[] = [0];
    const left = Math.max(1, current - 1);
    const right = Math.min(total - 2, current + 1);

    if (left > 1) pages.push("ellipsis");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < total - 2) pages.push("ellipsis");
    pages.push(total - 1);

    return pages;
}

function toReservation(item: TicketItem): Reservation {
    const d = new Date(item.matchAt);
    const pad = (n: number) => String(n).padStart(2, "0");
    const date = `${d.getFullYear()}. ${pad(d.getMonth() + 1)}. ${pad(d.getDate())} (${pad(d.getHours())}:${pad(d.getMinutes())})`;
    const seat = item.seats
        .map((s) => `${s.sectionName} ${s.blockCode}블럭 ${s.rowNo}열 ${s.seatNo}번`)
        .join(", ");

    return {
        id: String(item.ticketId),
        date,
        matchTitle: `${item.homeClub.koName} vs ${item.awayClub.koName}`,
        location: item.stadiumName,
        count: item.seatCount,
        seat,
        status: item.status as ReservationStatus,
    };
}



const MOCK_DEPOSIT_INFO = {
    bankName: "국민",
    accountNumber: "000-0000-0000-00",
    accountHolder: "윤정빈",
    amount: 42000,
    deadline: "2026년 3월 24일 (화) 23:59",
};

export default function ReservationsPage() {
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<"HISTORY" | "CANCEL">("HISTORY");
    const [currentPage, setCurrentPage] = useState(0);
    const [summary, setSummary] = useState<TicketSummary | null>(null);
    const [items, setItems] = useState<Reservation[]>([]);
    const [totalPages, setTotalPages] = useState(0);

    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [selectedTicketInfo, setSelectedTicketInfo] = useState<TicketInfo | null>(null);
    const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
    const [cancelInfo, setCancelInfo] = useState<{ paymentAmount: number; cancelFee: number } | null>(null);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const loadData = async () => {
        try {
            const apiTab = activeTab === "HISTORY" ? "BOOKED" : "CANCEL_REFUND";
            const result = await getTicketList({ 
                tab: apiTab, 
                page: currentPage, 
                size: PAGE_SIZE 
            });

            setSummary(result.summary);
            setTotalPages(result.pagination.totalPages);
            setItems(result.tickets.map(toReservation));
        } catch (error: any) {
            toast.error(error.message || "예매 내역을 불러오지 못했습니다.");
        }
    };

    useEffect(() => {
        loadData();
    }, [activeTab, currentPage]);

    const handleTabChange = (tab: "HISTORY" | "CANCEL") => {
        setActiveTab(tab);
        setCurrentPage(0);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleActionClick = async (e: React.MouseEvent, item: Reservation) => {
        e.stopPropagation();
        if (loadingId) return;

        if (item.status === "PAYMENT_PENDING") {
            setIsDepositModalOpen(true);
        } else if (item.status === "UNDER_REVIEW") {
            router.push("/my/support");
        } else if (item.status === "PAID" || item.status === "RESERVED") {
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
                dateStr: item.date,
            });
            setSelectedReservationId(item.id);
            
            setLoadingId(item.id);
            try {
                const detail = await getTicketDetail(Number(item.id));
                const totalAmount = detail.payment?.totalAmount ?? 0;
                const cancelFee = Math.round(totalAmount * parseFeeRate(detail.cancellationPolicy?.feeRate));
                setCancelInfo({ paymentAmount: totalAmount, cancelFee });
                setIsCancelModalOpen(true);
            } catch (error: any) {
                toast.error(error.message || "예매 상세 정보를 불러오지 못했습니다.");
            } finally {
                setLoadingId(null);
            }
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
                        className="mb-8 text-[13px] font-medium text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors flex items-center gap-1"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        이전으로 돌아가기
                    </button>
                    <h1 className="text-[24px] font-bold text-[#1A1A1A]">예매 내역</h1>
                </div>

                {/* 요약(Summary) 카드 */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-[16px] border border-[#E8E8E8] p-6 flex flex-col gap-3 shadow-sm">
                        <span className="text-[15px] font-bold text-[#333]">총 예매 수</span>
                        <span className="text-[32px] font-bold text-[#1A1A1A] leading-none">{summary?.totalCount ?? "-"}</span>
                    </div>
                    <div className="bg-white rounded-[16px] border border-[#E8E8E8] p-6 flex flex-col gap-3 shadow-sm">
                        <span className="text-[15px] font-bold text-[#333]">경기 예정</span>
                        <span className="text-[32px] font-bold text-[var(--foundation-primary-500)] leading-none">{summary?.upcomingCount ?? "-"}</span>
                    </div>
                    <div className="bg-white rounded-[16px] border border-[#E8E8E8] p-6 flex flex-col gap-3 shadow-sm">
                        <span className="text-[15px] font-bold text-[#333]">취소 처리 중</span>
                        <span className="text-[32px] font-bold text-[var(--foundation-red-500)] leading-none">{summary?.cancelProcessingCount ?? "-"}</span>
                    </div>
                    <div className="bg-white rounded-[16px] border border-[#E8E8E8] p-6 flex flex-col gap-3 shadow-sm">
                        <span className="text-[15px] font-bold text-[#333]">경기 완료</span>
                        <span className="text-[32px] font-bold text-[#A3A3A3] leading-none">{summary?.completedCount ?? "-"}</span>
                    </div>
                </div>

                {/* 탭 네비게이션 */}
                <div className="flex items-center gap-6 border-b border-[#E8E8E8] mb-6">
                    <button
                        onClick={() => handleTabChange("HISTORY")}
                        className={`pb-3 text-[16px] font-bold transition-colors relative ${activeTab === "HISTORY" ? "text-[var(--foundation-primary-500)]" : "text-[#9E9E9E] hover:text-[#666]"}`}
                    >
                        예매 내역
                        {activeTab === "HISTORY" && (
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--foundation-primary-500)]" />
                        )}
                    </button>
                    <button
                        onClick={() => handleTabChange("CANCEL")}
                        className={`pb-3 text-[16px] font-bold transition-colors relative ${activeTab === "CANCEL" ? "text-[var(--foundation-primary-500)]" : "text-[#9E9E9E] hover:text-[#666]"}`}
                    >
                        취소/환불
                        {activeTab === "CANCEL" && (
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--foundation-primary-500)]" />
                        )}
                    </button>
                </div>

                {/* 테이블 */}
                <div className="bg-white rounded-[12px] border border-[#E8E8E8] overflow-hidden">
                    <div className="grid grid-cols-[minmax(180px,1fr)_minmax(200px,1fr)_100px_80px_minmax(280px,2fr)_minmax(200px,1fr)] items-center px-6 py-4 bg-[#FAFAFA] border-b border-[#E8E8E8] text-[14px] text-[#666] font-semibold">
                        <div>경기 일시</div>
                        <div>경기 정보</div>
                        <div>장소</div>
                        <div>티켓 수</div>
                        <div>좌석 정보</div>
                        <div className="pl-4">진행 상황</div>
                    </div>
                    <div className="flex flex-col">
                        {items.length === 0 ? (
                            <div className="py-16 text-center text-[#999] text-[14px]">
                                {activeTab === "CANCEL" ? "취소/환불 내역이 없습니다." : "예매 내역이 없습니다."}
                            </div>
                        ) : (
                            items.map((item, index) => (
                                <ReservationItem
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    isLast={index === items.length - 1}
                                    onActionClick={handleActionClick}
                                    isLoading={loadingId === item.id}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 mb-4">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); if (currentPage > 0) handlePageChange(currentPage - 1); }}
                                        aria-disabled={currentPage === 0}
                                        className={currentPage === 0 ? "pointer-events-none opacity-40" : ""}
                                    />
                                </PaginationItem>

                                {getPageRange(currentPage, totalPages).map((page, idx) =>
                                    page === "ellipsis" ? (
                                        <PaginationItem key={`ellipsis-${idx}`}>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    ) : (
                                        <PaginationItem key={page}>
                                            <PaginationLink
                                                href="#"
                                                isActive={currentPage === page}
                                                onClick={(e) => { e.preventDefault(); handlePageChange(page); }}
                                            >
                                                {page + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    )
                                )}

                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); if (currentPage < totalPages - 1) handlePageChange(currentPage + 1); }}
                                        aria-disabled={currentPage === totalPages - 1}
                                        className={currentPage === totalPages - 1 ? "pointer-events-none opacity-40" : ""}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}

                {/* 입금 안내 모달 */}
                <PaymentDepositModal
                    isOpen={isDepositModalOpen}
                    onClose={() => setIsDepositModalOpen(false)}
                    depositInfo={MOCK_DEPOSIT_INFO}
                />

                {/* 취소 모달 */}
                <CancelTicketModal
                    isOpen={isCancelModalOpen}
                    onClose={() => { setIsCancelModalOpen(false); setCancelInfo(null); }}
                    ticketInfo={selectedTicketInfo}
                    ticketId={selectedReservationId ? Number(selectedReservationId) : undefined}
                    paymentAmount={cancelInfo?.paymentAmount ?? 0}
                    cancelFee={cancelInfo?.cancelFee ?? 0}
                    onCancelSuccess={loadData}
                />
            </div>
        </div>
    );
}
