"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronsLeft, ChevronsRight, ChevronLeft } from "lucide-react";
import { PaymentDepositModal } from "@/components/my/PaymentDepositModal";
import { TicketDetailModal } from "@/components/my/TicketDetailModal";
import { CancelTicketModal } from "@/components/my/CancelTicketModal";
import { TicketCard, Ticket } from "@/components/my/TicketCard";

const MOCK_TICKETS: Ticket[] = [
  {
    id: "1",
    dDay: "D-Day",
    status: "PAYMENT_WAITING",
    count: 2,
    matchTitle: "LG 트윈스 vs kt 위즈",
    dateStr: "2026. 03. 28 (토) 14:00",
    type: "블루석",
    zone: "103",
    seat: "G열 23, 24",
    date: "3월 28일",
    location: "잠실 경기장",
    time: "14:00"
  },
  {
    id: "2",
    dDay: "D-1",
    status: "RESERVED",
    count: 3,
    matchTitle: "LG 트윈스 vs kt 위즈",
    dateStr: "2026. 03. 29 (일) 14:00",
    type: "블루석",
    zone: "103",
    seat: "G열 23, 24, 25",
    date: "3월 29일",
    location: "잠실 경기장",
    time: "14:00"
  },
  {
    id: "3",
    dDay: "D-4",
    status: "RESERVED",
    count: 4,
    matchTitle: "LG 트윈스 vs SSG 랜더스",
    dateStr: "2026. 04. 01 (수) 14:00",
    type: "레드석",
    zone: "201",
    seat: "A열 1, 2, 3, 4",
    date: "4월 1일",
    location: "잠실 경기장",
    time: "14:00"
  }
];

const MOCK_DEPOSIT_INFO = {
  bankName: "국민",
  accountNumber: "000-0000-0000-00",
  accountHolder: "윤정빈",
  amount: 42000,
  deadline: "2026년 3월 24일 (화) 23:59",
};

export default function TicketsPage() {
  const router = useRouter();

  // TODO: [API 연동 가이드] - 경기 예정 티켓 목록 조회
  // 1. 컴포넌트 마운트 시 리액트 쿼리(useQuery) 또는 useEffect + fetch 로 백엔드 API(예: GET /api/my/tickets)를 호출합니다.
  // 2. 서버에서 받은 데이터를 setTickets 에 저장하여 상태를 업데이트합니다.
  // 3. 로딩 상태(isLoading)를 추가하여 데이터 요청 중일 때는 스켈레톤 UI나 로딩 스피너를 보여주는 것이 좋습니다.
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  // 티켓 상세 레이어 상태
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // 티켓 취소 모달 상태
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const handleOpenTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsTicketModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-pretendard">
      {/* ─── 상단 헤더 (breadcrumb) ─── */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#F0F0F0]">
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
            className="text-[13px] text-[#9E9E9E] hover:text-[#1A1A1A] transition-colors self-start"
          >
            &lt; 이전으로 돌아가기
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
                onDeposit={(ticket) => setIsDepositModalOpen(true)}
                onCancel={(ticket) => {
                  setSelectedTicket(ticket);
                  setIsCancelModalOpen(true);
                }}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="mt-16 mb-8 flex items-center justify-center gap-5 text-[#999999] text-[15px]">
          <button className="hover:text-[#1A1A1A] transition-colors"><ChevronsLeft size={16} /></button>
          <button className="hover:text-[#1A1A1A] transition-colors"><ChevronLeft size={16} /></button>
          <button className="text-[var(--foundation-primary-500)] font-bold text-[16px] underline underline-offset-4">1</button>
          <button className="hover:text-[#1A1A1A] transition-colors"><ChevronRight size={16} /></button>
          <button className="hover:text-[#1A1A1A] transition-colors"><ChevronsRight size={16} /></button>
        </div>

        {/* 입금 안내 모달 */}
        <PaymentDepositModal
          isOpen={isDepositModalOpen}
          onClose={() => setIsDepositModalOpen(false)}
          depositInfo={MOCK_DEPOSIT_INFO}
        />

        {/* 티켓 상세 모달 (Layer) */}
        <TicketDetailModal
          isOpen={isTicketModalOpen}
          onClose={() => setIsTicketModalOpen(false)}
          ticketInfo={selectedTicket}
        />

        {/* 취소 모달 */}
        <CancelTicketModal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          ticketInfo={selectedTicket}
          // TODO: [API 연동 가이드] - 실제 API 응답 받은 티켓 세부 결제 정보(총 금액, 취소 수수료)를 바인딩 하세요.
          paymentAmount={selectedTicket ? selectedTicket.count * 20000 + 2000 : 0}
          cancelFee={2000}
          onCancelSuccess={() => {
            /* 
              TODO: [API 연동 가이드] - 목록 UI 갱신 (Optimistic Update)
              모달에서 취소 처리(API 200 OK)가 성공하면, 
              여기서 리스트 API를 재조회(refetch) 하거나 아래처럼 프론트엔드 State에서만 즉각적으로 필터링하여 카드를 분리합니다.
            */
            if (selectedTicket) {
              setTickets(prev => prev.filter(t => t.id !== selectedTicket.id));
            }
          }}
        />
      </div>
    </div>
  );
}
