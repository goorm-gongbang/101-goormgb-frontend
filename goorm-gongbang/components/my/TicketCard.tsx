import { ChevronRight } from "lucide-react";
import { TicketInfo } from "@/components/my/TicketDetailModal";

export type TicketStatus = "PAYMENT_WAITING" | "RESERVED" | "UNDER_REVIEW";

export interface TicketActions {
    canDeposit: boolean;
    canCancel: boolean;
    canViewDetail: boolean;
}

export interface Ticket extends TicketInfo {
    id: string;
    dDay: string;
    status: TicketStatus;
    dateStr: string;
    actions?: TicketActions;
    statusLabel?: string;
}

interface TicketCardProps {
    ticket: Ticket;
    onClick: (ticket: Ticket) => void;
    onDeposit: (ticket: Ticket) => void;
    onCancel: (ticket: Ticket) => void;
}

export function TicketCard({ ticket, onClick, onDeposit, onCancel }: TicketCardProps) {
    const isWaiting = ticket.actions ? ticket.actions.canDeposit : ticket.status === "PAYMENT_WAITING";
    const isUnderReview = ticket.status === "UNDER_REVIEW";

    // D-Day 뱃지 표시
    const dDayLabel = ticket.dDay;
    const isDDay = dDayLabel === "D-Day";
    const dDayColor = isDDay ? "var(--foundation-pink-500)" : "var(--foundation-primary-500)";

    const canCancel = !isDDay && (ticket.actions ? ticket.actions.canCancel : ticket.status === "RESERVED");

    // 클릭 가능 여부 (입금 대기 상태는 클릭 불가)
    const isClickable = !isWaiting;

    return (
        <div
            className={`bg-white rounded-xl p-6 border border-[#E8E8E8] flex flex-col transition-all ${isClickable ? "hover:border-[var(--foundation-primary-500)] hover:shadow-sm cursor-pointer" : ""}`}
            onClick={isClickable ? () => onClick(ticket) : undefined}
        >
            {/* 상단: 뱃지들 & 우측 버튼 */}
            <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                    {/* D-Day 뱃지 */}
                    <div
                        className="px-[10px] py-[3px] rounded-[100px] border text-[13px] font-bold"
                        style={{ color: dDayColor, borderColor: dDayColor, backgroundColor: "#ffffff" }}
                    >
                        {dDayLabel}
                    </div>
                    {/* 입금 대기 뱃지 */}
                    {isWaiting && (
                        <div className="px-[10px] py-[4px] rounded-[100px] text-white text-[13px] font-bold bg-[var(--foundation-primary-500)]">
                            {ticket.statusLabel ?? "입금 대기"}
                        </div>
                    )}
                    {/* 정밀 확인 중 뱃지 */}
                    {isUnderReview && (
                        <div className="px-[10px] py-[4px] rounded-[100px] text-white text-[13px] font-bold bg-[var(--foundation-orange-500)]">
                            {ticket.statusLabel ?? "정밀 확인 중"}
                        </div>
                    )}
                </div>

                {/* 우측 상단 액션 버튼 */}
                <div>
                    {isWaiting ? (
                        <button
                            className="flex items-center text-[15px] font-bold text-[var(--foundation-primary-500)] hover:underline"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeposit(ticket);
                            }}
                        >
                            입금하기 <ChevronRight size={18} className="ml-0.5" />
                        </button>
                    ) : canCancel ? (
                        <button
                            className="flex items-center text-[15px] font-bold text-[#333333] hover:underline"
                            onClick={(e) => {
                                e.stopPropagation();
                                onCancel(ticket);
                            }}
                        >
                            취소하기 <ChevronRight size={18} className="ml-0.5" />
                        </button>
                    ) : isUnderReview ? (
                        <button
                            className="flex items-center text-[15px] font-bold text-[#333333] hover:underline"
                            onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = "/my/support";
                            }}
                        >
                            문의하기 <ChevronRight size={18} className="ml-0.5" />
                        </button>
                    ) : ticket.status === "RESERVED" ? (
                        <span className="text-[13px] font-medium text-[#999999]">
                            당일 경기는 취소가 불가능합니다.
                        </span>
                    ) : null}
                </div>
            </div>

            {/* 하단: 정보 영역 */}
            <div className="flex flex-col gap-[6px]">
                <div className="text-[14px] text-[#666666] font-medium leading-[14px] mb-1">매수 : {ticket.count}</div>
                <div className="text-[17px] font-bold text-[#1A1A1A] leading-[17px] mb-0.5">{ticket.matchTitle}</div>
                <div className="text-[14px] text-[#999999] font-medium leading-[14px]">{ticket.dateStr}</div>
            </div>
        </div>
    );
}
