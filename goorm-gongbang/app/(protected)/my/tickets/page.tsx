"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronsLeft, ChevronsRight, ChevronLeft } from "lucide-react";
import { PaymentDepositModal } from "@/components/my/PaymentDepositModal";
import { TicketDetailModal } from "@/components/my/TicketDetailModal";
import { CancelTicketModal } from "@/components/my/CancelTicketModal";
import { TicketCard, Ticket, TicketStatus } from "@/components/my/TicketCard";
import { getUpcomingTickets, getTicketDetail } from "@/lib/services";
import type { UpcomingTicketItem } from "@/lib/types";

/* UpcomingTicketItem (API) → Ticket (UI) 매핑 */
const API_STATUS_MAP: Record<string, TicketStatus> = {
  PAYMENT_PENDING: "PAYMENT_WAITING",
  PAID: "RESERVED",
  RESERVED: "RESERVED",
  UNDER_REVIEW: "UNDER_REVIEW",
};

function toTicket(item: UpcomingTicketItem): Ticket {
  const d = new Date(item.match.matchAt);
  const pad = (n: number) => String(n).padStart(2, "0");
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const dateStr = `${d.getFullYear()}. ${pad(d.getMonth() + 1)}. ${pad(d.getDate())} (${weekdays[d.getDay()]}) ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const date = `${d.getMonth() + 1}월 ${d.getDate()}일`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  const type = item.seats[0]?.sectionName ?? "";
  const zone = item.seats[0]?.blockCode ?? "";
  const rowGroups = item.seats.reduce<Record<string, number[]>>((acc, s) => {
    (acc[String(s.rowNo)] ??= []).push(s.seatNo);
    return acc;
  }, {});
  const seat = Object.entries(rowGroups)
    .map(([row, nums]) => `${row}열 ${nums.join(", ")}`)
    .join(" / ");

  const dDayLabel = item.dDay === 0 ? "D-Day" : `D-${item.dDay}`;

  return {
    id: String(item.ticketId),
    dDay: dDayLabel,
    status: API_STATUS_MAP[item.status] ?? "RESERVED",
    statusLabel: item.statusLabel,
    actions: item.actions,
    dateStr,
    matchTitle: `${item.match.homeClub.koName} vs ${item.match.awayClub.koName}`,
    count: item.seatCount,
    type,
    zone,
    seat,
    date,
    location: item.match.stadium.koName,
    time,
  };
}

function formatDepositDeadline(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${weekdays[d.getDay()]}) ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function TicketsPage() {
  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [depositInfo, setDepositInfo] = useState<{
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    amount: number;
    deadline: string;
  } | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketModalKey, setTicketModalKey] = useState(0);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelInfo, setCancelInfo] = useState<{ paymentAmount: number; cancelFee: number } | null>(null);

  const fetchedRef = useRef(false);

  const fetchTickets = (page: number) => {
    getUpcomingTickets({ page, size: 10 }).then((data) => {
      setTickets(data.tickets.map(toTicket));
      setTotalPages(data.pagination.totalPages);
    });
  };

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchTickets(currentPage);
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchTickets(page);
  };

  const handleOpenTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsTicketModalOpen(true);
    setTicketModalKey(prev => prev + 1);
  };

  const handleDeposit = (ticket: Ticket) => {
    getTicketDetail(Number(ticket.id)).then((detail) => {
      if (!detail.virtualAccount) return;
      setDepositInfo({
        bankName: detail.virtualAccount.bank,
        accountNumber: detail.virtualAccount.accountNumber,
        accountHolder: detail.virtualAccount.holder,
        amount: detail.payment?.totalAmount ?? 0,
        deadline: formatDepositDeadline(detail.virtualAccount.depositDeadline),
      });
      setIsDepositModalOpen(true);
    });
  };

  const handleCancel = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    getTicketDetail(Number(ticket.id)).then((detail) => {
      const totalAmount = detail.payment?.totalAmount ?? 0;
      const feeRate = detail.cancellationPolicy?.feeRate ?? "0";
      const rate = parseFloat(feeRate.replace("%", "")) / 100;
      const cancelFee = rate > 0 ? Math.round(totalAmount * rate) + 2000 : 0;
      setCancelInfo({ paymentAmount: totalAmount, cancelFee });
      setIsCancelModalOpen(true);
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-pretendard">
      {/* ─── 상단 헤더 (breadcrumb) ─── */}
      <div className="sticky top-12 z-10 bg-white border-b border-[#F0F0F0]">
        <div className="max-w-[1200px] mx-auto px-4 h-12 flex items-center justify-end">
          <nav className="flex items-center gap-1.5 text-xs text-[#9E9E9E]">
            <button
              type="button"
              onClick={() => router.push("/my")}
              className="hover:text-[#1A1A1A] transition-colors"
            >
              마이페이지
            </button>
            <span>&gt;</span>
            <span className="text-[#1A1A1A] font-medium">경기 예정 티켓</span>
          </nav>
        </div>
      </div>

      {/* ─── 본문 ─── */}
      <div className="max-w-[1200px] mx-auto px-4 py-8 flex flex-col min-h-[calc(100vh-48px)]">
        {/* 이전으로 돌아가기 & 타이틀 */}
        <div className="mb-6 flex flex-col gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="mb-8 text-[13px] font-medium text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors flex items-center gap-1"
                >
                    <ChevronLeft className="w-4 h-4" />
                    이전으로 돌아가기
                </button>
          <h1 className="text-[22px] font-bold text-[#1A1A1A]">경기 예정 티켓</h1>
        </div>

        {/* 티켓 목록 */}
        <div className="flex flex-col gap-4 flex-1">
          {tickets.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-[#999999] bg-white rounded-[20px] border border-[#E8E8E8]">
              <p>예정된 경기 티켓이 없습니다.</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onClick={handleOpenTicket}
                onDeposit={handleDeposit}
                onCancel={handleCancel}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 mb-8 flex items-center justify-center gap-5 text-[#999999] text-[15px]">
            <button
              className="hover:text-[#1A1A1A] transition-colors"
              onClick={() => handlePageChange(0)}
              disabled={currentPage === 0}
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              className="hover:text-[#1A1A1A] transition-colors"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i)}
                className={
                  currentPage === i
                    ? "text-[var(--foundation-primary-500)] font-bold text-[16px] underline underline-offset-4"
                    : "hover:text-[#1A1A1A] transition-colors"
                }
              >
                {i + 1}
              </button>
            ))}
            <button
              className="hover:text-[#1A1A1A] transition-colors"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
            >
              <ChevronRight size={16} />
            </button>
            <button
              className="hover:text-[#1A1A1A] transition-colors"
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={currentPage === totalPages - 1}
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        )}

        {/* 입금 안내 모달 */}
        {depositInfo && (
          <PaymentDepositModal
            isOpen={isDepositModalOpen}
            onClose={() => {
              setIsDepositModalOpen(false);
              setDepositInfo(null);
            }}
            depositInfo={depositInfo}
          />
        )}

        {/* 티켓 상세 모달 (Layer) */}
        {isTicketModalOpen && (
          <TicketDetailModal
            key={ticketModalKey}
            isOpen={isTicketModalOpen}
            onClose={() => setIsTicketModalOpen(false)}
            ticketInfo={selectedTicket}
            ticketId={selectedTicket ? Number(selectedTicket.id) : undefined}
          />
        )}

        {/* 취소 모달 */}
        <CancelTicketModal
          isOpen={isCancelModalOpen}
          onClose={() => { setIsCancelModalOpen(false); setCancelInfo(null); }}
          ticketInfo={selectedTicket}
          ticketId={selectedTicket ? Number(selectedTicket.id) : undefined}
          paymentAmount={cancelInfo?.paymentAmount ?? 0}
          cancelFee={cancelInfo?.cancelFee ?? 0}
          onCancelSuccess={() => {
            if (selectedTicket) {
              setTickets(prev => prev.filter(t => t.id !== selectedTicket.id));
            }
          }}
        />
      </div>
    </div>
  );
}
