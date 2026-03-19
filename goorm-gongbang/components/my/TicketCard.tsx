import { ChevronRight } from "lucide-react";
import { TicketInfo } from "@/components/my/TicketDetailModal";

export type TicketStatus = "PAYMENT_WAITING" | "RESERVED";

export interface Ticket extends TicketInfo {
    id: string;
    dDay: string; // Legacy/API string, will be dynamically calculated
    status: TicketStatus;
    dateStr: string;
}

interface TicketCardProps {
    ticket: Ticket;
    onClick: (ticket: Ticket) => void;
    onDeposit: (ticket: Ticket) => void;
    onCancel: (ticket: Ticket) => void;
}

export function TicketCard({ ticket, onClick, onDeposit, onCancel }: TicketCardProps) {
    // 오늘 이전 날짜 판별 (과거 경기 체크)
    const matchDateStr = ticket.dateStr.split(" (")[0].replace(/\./g, "-");
    const matchDate = new Date(matchDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const timeDiff = matchDate.getTime() - today.getTime();
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const isPastMatch = diffDays < 0;

    let calculatedDDay = "";
    if (diffDays === 0) {
        calculatedDDay = "D-Day";
    } else if (diffDays > 0) {
        calculatedDDay = `D-${diffDays}`;
    } else {
        calculatedDDay = `D+${Math.abs(diffDays)}`;
    }

    // Badge Styles
    const isDDay = calculatedDDay === "D-Day";
    const dDayColor = isDDay ? "var(--foundation-pink-500)" : "var(--foundation-primary-500)";

    // Card Styles
    const isWaiting = ticket.status === "PAYMENT_WAITING";

    return (
        <div
            className={`bg-white rounded-[20px] p-6 border border-[#E8E8E8] flex flex-col transition-all ${!isWaiting ? "hover:border-[var(--foundation-primary-500)] hover:shadow-sm cursor-pointer" : ""}`}
            onClick={!isWaiting ? () => onClick(ticket) : undefined}
        >
            {/* 상단: 뱃지들 & 우측 버튼 */}
            <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                    {/* D-Day 뱃지 */}
                    <div
                        className={`px-[10px] py-[3px] rounded-[100px] border text-[13px] font-bold`}
                        style={{ color: dDayColor, borderColor: dDayColor, backgroundColor: "#ffffff" }}
                    >
                        {calculatedDDay}
                    </div>
                    {/* 입금 대기 뱃지 */}
                    {isWaiting && (
                        <div
                            className="px-[10px] py-[4px] rounded-[100px] text-white text-[13px] font-bold bg-[var(--foundation-primary-500)]"
                        >
                            입금 대기
                        </div>
                    )}
                </div>

                {/* 우측 상단 액션 버튼 */}
                <div>
                    {!isPastMatch && (
                        isWaiting ? (
                            <button
                                className="flex items-center text-[15px] font-bold text-[var(--foundation-primary-500)] hover:underline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeposit(ticket);
                                }}
                            >
                                입금하기 <ChevronRight size={18} className="ml-0.5" />
                            </button>
                        ) : (
                            <button
                                className="flex items-center text-[15px] font-bold text-[#333333] hover:underline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCancel(ticket);
                                }}
                            >
                                취소하기 <ChevronRight size={18} className="ml-0.5" />
                            </button>
                        )
                    )}
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
