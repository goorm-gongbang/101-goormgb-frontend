import { ChevronRight } from "lucide-react";
import { Reservation, ReservationStatus, RESERVATION_STATUS_MAP } from "@/app/(protected)/my/reservations/page";
import { useRouter } from "next/navigation";

interface ReservationItemProps {
    item: Reservation;
    index: number;
    isLast: boolean;
    onActionClick: (e: React.MouseEvent, item: Reservation) => void;
}

export function ReservationItem({ item, index, isLast, onActionClick }: ReservationItemProps) {
    const router = useRouter();

    // 오늘 이전 날짜 판별
    const matchDateStr = item.date.split(" (")[0].replace(/\./g, "-");
    const matchDate = new Date(matchDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPastMatch = matchDate.getTime() < today.getTime();

    const showActionBtn = (item.status === "PAYMENT_WAITING" || item.status === "RESERVED") && !isPastMatch;

    // 진행 상태별 뱃지 배경색 렌더링 도우미 함수 
    const getBadgeColor = (status: ReservationStatus) => {
        switch (status) {
            case "PAYMENT_WAITING":
                return "bg-[var(--foundation-primary-500)]"; // 초록색 테마
            case "RESERVED":
                return "bg-[#3B82F6]"; // 파란색
            case "CANCEL_PROCESSING":
            case "REFUND_PROCESSING":
            case "CANCEL_COMPLETED":
            case "REFUND_COMPLETED":
                return "bg-[#A3A3A3]"; // 회색
            default:
                return "bg-[#E8E8E8]";
        }
    };

    return (
        <div
            onClick={() => {
                router.push(`/my/reservations/${item.id}`);
            }}
            className={`grid grid-cols-[minmax(180px,1fr)_minmax(200px,1fr)_100px_80px_minmax(280px,2fr)_minmax(200px,1fr)] items-center px-6 py-[18px] text-[14px] text-[#1A1A1A] font-medium transition-colors hover:bg-gray-50 cursor-pointer
                ${!isLast ? 'border-b border-[#F0F0F0]' : ''}
            `}
        >
            <div className="tracking-tight">{item.date}</div>
            <div>{item.matchTitle}</div>
            <div className="text-[#666]">{item.location}</div>
            <div className="text-[#666]">{item.count}</div>
            <div className="truncate pr-4">{item.seat}</div>

            {/* 진행 상황 및 액션 영역 */}
            <div className="flex items-center justify-between pl-4">
                <div className={`px-[12px] py-[3px] rounded-full text-white text-[12px] font-bold ${getBadgeColor(item.status)}`}>
                    {RESERVATION_STATUS_MAP[item.status]}
                </div>

                {/* 버튼 렌더링 */}
                {showActionBtn && (
                    <button
                        className="flex items-center text-[13px] font-bold text-[#666] hover:text-[#1A1A1A] transition-colors"
                        onClick={(e) => onActionClick(e, item)}
                    >
                        {item.status === "PAYMENT_WAITING" ? "입금하기" : "취소하기"}
                        <ChevronRight size={14} className="ml-0.5" />
                    </button>
                )}
            </div>
        </div>
    );
}
