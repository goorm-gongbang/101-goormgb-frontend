"use client";

import { useRouter } from "next/navigation";
import { Copy, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useState, use } from "react";
import { CancelTicketModal } from "@/components/my/CancelTicketModal";
import { TicketInfo } from "@/components/my/TicketDetailModal";
import { MOCK_RESERVATIONS, Reservation, RESERVATION_STATUS_MAP } from "../page";

/* ===========================
   [API 연동 가이드]
   1. 데이터 Fetching:
      - 진입 시 `GET /api/v1/my/reservations/{id}` 형식의 상세 조회 API를 호출하세요.
      - Next.js 15 환경이므로 상단의 `resolvedParams.id` 값을 파라미터로 넘겨 사용해야 합니다.
   
   2. 상태값(status) 분기:
      - 백엔드 응답의 status 필드가 "PAYMENT_WAITING"(입금 대기) 혹은 "RESERVED"(결제 완료) 등에 따라
        본문의 UI 컴포넌트(`입금 안내 정보`, `증빙 서류 발급`, `결제 정보` 등)가 조건부 렌더링되게 구성되어 있습니다.
      - 해당 상수값들을 백엔드 DTO(Enum)에 맞추어 변경해주세요.

   3. 주요 연동 포인트:
      - (1) 입금 대기 상태(`depositInfo` 객체): 계좌, 예금주, 기한일시 바인딩
      - (2) 결제 완료 상태(`paymentInfo`, `document` 객체): 가격 테이블 및 증빙 자료 바인딩
      - (3) 하단 [취소하기] 버튼 액션: `CancelTicketModal`로 데이터 전달 및 취소 요청 결과 콜백 처리
=========================== */
export default function ReservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);

    /* ===========================
       [TODO: 실제 API 연동 시나리오]
       const { data: detail, isLoading } = useQuery(['reservationDetail', resolvedParams.id], () => fetchDetail(resolvedParams.id));
       if (isLoading) return <Skeleton... />
    =========================== */

    // MVP: 리스트 페이지의 MOCK에서 데이터를 찾아와 동적 객체를 만들어 줍니다.
    const reservation = MOCK_RESERVATIONS.find(r => r.id === resolvedParams.id);

    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    if (!reservation) {
        return (
            <div className="flex h-screen items-center justify-center font-bold text-lg text-[#666]">
                존재하지 않는 예매 내역입니다.
            </div>
        );
    }

    // 좌석 데이터 파싱 
    // e.g "오렌지석 206블럭 F열 23번, 24번" -> ["오렌지석 206블럭 F열 23번", "오렌지석 206블럭 F열 24번"]
    const seatParts = reservation.seat.split(', ');
    const prefixResult = seatParts[0].split(' ').slice(0, -1).join(' '); // "오렌지석 206블럭 F열"
    const parsedSeats = seatParts.map((s, idx) => idx === 0 ? s : `${prefixResult} ${s}`);

    // 일시 데이터 파싱 (MVP용) "2026. 03. 28 (14:00)" -> "2026. 03. 28 (14:00)"
    const totalAmount = parsedSeats.length * 20000 + 2000;

    const detail = {
        id: reservation.id,
        status: reservation.status,
        depositInfo: reservation.status === "PAYMENT_WAITING" ? {
            deadline: "2026년 3월 24일 (화) 23:59",
            bank: "국민",
            account: "000-0000-0000-00",
            holder: "윤정빈"
        } : undefined,
        matchInfo: {
            dateStr: reservation.date,
            matchTitle: reservation.matchTitle,
            stadium: "잠실종합운동장 잠실야구장", // 경기 정보에서 넘어온 장소가 "잠실" 정도로만 되어있어 임의 매핑
            address: "서울 송파구 올림픽로 19-2 서울종합운동장",
            seats: parsedSeats
        },
        paymentInfo: {
            paymentDate: reservation.status === "PAYMENT_WAITING" ? "-" : "2026년 3월 22일 (일) 14:39",
            method: reservation.status === "PAYMENT_WAITING" ? "-" : (reservation.id === "12" ? "무통장 입금" : "토스 페이 사용"),
            totalAmount: totalAmount,
            seatPrices: parsedSeats.map(s => ({ label: s, price: 20000 })),
            fee: 2000,
            cancelDeadline: "2026년 2월 11일 (수) 23:59",
            cancelFeeRule: "티켓 금액의 0~10%"
        },
        document: {
            cashReceipt: reservation.status === "PAYMENT_WAITING" ? "미발급" : "발급",
            cashReceiptInfo: reservation.status === "PAYMENT_WAITING" ? "-" : "개인소득공제용",
            cashReceiptPhone: reservation.status === "PAYMENT_WAITING" ? "-" : "(010-0000-0000)",
            depositReceiptAmount: reservation.status === "PAYMENT_WAITING" ? 0 : totalAmount
        },
        cancelInfo: ["CANCEL_PROCESSING", "REFUND_PROCESSING", "CANCEL_COMPLETED", "REFUND_COMPLETED"].includes(reservation.status) ? {
            cancelStatus: ["REFUND_PROCESSING", "REFUND_COMPLETED"].includes(reservation.status) ? (reservation.status === "REFUND_COMPLETED" ? "환불 완료" : "환불 처리 중") : `${RESERVATION_STATUS_MAP[reservation.status]}(환불 예정)`,
            cancelDate: "2026년 3월 25일 (수) 14:39"
        } : undefined
    };

    const isCancelled = ["CANCEL_PROCESSING", "REFUND_PROCESSING", "CANCEL_COMPLETED", "REFUND_COMPLETED"].includes(detail.status);
    const isRefunded = ["REFUND_PROCESSING", "REFUND_COMPLETED"].includes(detail.status);
    const isProcessing = ["CANCEL_PROCESSING", "REFUND_PROCESSING"].includes(detail.status);
    const isCompleted = ["CANCEL_COMPLETED", "REFUND_COMPLETED"].includes(detail.status);

    // [TODO] 클립보드 복사 유틸. 추후 범용 훅이나 모듈로 분리할 수 있습니다.
    const handleCopyAddress = () => {
        navigator.clipboard.writeText(detail.matchInfo.address).then(() => {
            toast.success("주소가 복사되었습니다.");
        });
    };

    const handleOpenCancelModal = () => {
        setIsCancelModalOpen(true);
    };

    // [API 연동 가이드] 취소 완료 후 처리 콜백
    // 백엔드 상태가 취소 됨("CANCEL_PROCESSING" 등)으로 갱신된 다음,
    // toast 알림과 함께 리스트로 돌아가거나(router.back) 상태 변경 API를 리프레시하세요.
    const handleCancelSuccess = () => {
        toast.success("예매가 취소되었습니다.");
        router.back();
    };

    /* ===========================
       [TODO] 취소 모달용 데이터 재가공
       - 하단 <CancelTicketModal />로 넘길 때는 모달 뷰 스펙(TicketInfo 타입)에 맞게 
         응답 string을 분리/파싱해 넘기게 되어있습니다.
       - 백엔드에 아예 type, zone, block, row, number 등을 개별 필드로 받아온다면 
         아래와 같이 파싱할 필요 없이 직접 바인딩하세요.
    =========================== */
    const seatNumbers = detail.matchInfo.seats.map(s => s.split(' ').slice(2).join(' ')).join(', ');

    // 오늘 이전 날짜 판별 (과거 경기 체크)
    const matchDateStr = detail.matchInfo.dateStr.split(" (")[0].replace(/\./g, "-");
    const matchDate = new Date(matchDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPastMatch = matchDate.getTime() < today.getTime();

    const cancelTicketInfo: TicketInfo = {
        matchTitle: detail.matchInfo.matchTitle,
        count: detail.matchInfo.seats.length,
        type: detail.matchInfo.seats[0]?.split(' ')[0] || "",
        zone: detail.matchInfo.seats[0]?.split(' ')[1] || "",
        seat: seatNumbers,
        date: detail.matchInfo.dateStr.split(' (')[0] || "",
        time: detail.matchInfo.dateStr.match(/\((.*?)\)/)?.[1] || "",
        location: detail.matchInfo.stadium,
        dateStr: detail.matchInfo.dateStr
    };

    return (
        <div className="min-h-screen bg-[#F5F5F5] font-pretendard pb-20">
            {/* ─── 상단 헤더 (breadcrumb) ─── */}
            <div className="sticky top-0 z-10 bg-white border-b border-[#F0F0F0]">
                <div className="max-w-[1200px] mx-auto px-4 h-12 flex items-center justify-end">
                    <nav className="flex items-center gap-1.5 text-[13px] text-[#9E9E9E]">
                        <button type="button" onClick={() => router.push("/my")} className="hover:text-[#1A1A1A] transition-colors">마이페이지</button>
                        <span>&gt;</span>
                        <button type="button" onClick={() => router.push("/my/reservations")} className="hover:text-[#1A1A1A] transition-colors">예매 내역</button>
                        <span>&gt;</span>
                        <span className="text-[#1A1A1A] font-medium">예매 상세 내역</span>
                    </nav>
                </div>
            </div>

            {/* ─── 본문 ─── */}
            <div className="max-w-[1200px] mx-auto px-4 py-12 flex justify-center min-h-[calc(100vh-48px)]">

                {/* 메인 폼 영역 */}
                <div className="w-full max-w-[800px] flex flex-col gap-10">

                    <div className="flex items-center gap-1 -ml-2">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="p-1.5 hover:bg-[#E8E8E8] rounded-full transition-colors flex items-center justify-center"
                        >
                            <ChevronLeft size={26} className="text-[#1A1A1A]" />
                        </button>
                        <h1 className="text-[22px] font-bold text-[#1A1A1A] mb-[1px]">
                            {isProcessing ? "취소/환불 처리 상세 내역" : (isRefunded ? "환불 상세 내역" : (isCancelled ? "취소 상세 내역" : "예매 상세 내역"))}
                        </h1>
                    </div>

                    {/* 취소된 상태 안내 메시지 */}
                    {isCancelled && (
                        <div className="flex flex-col items-center justify-center -mt-2 mb-2 text-center w-full">
                            <h2 className="text-[20px] font-bold text-[var(--foundation-primary-500)]">
                                {isProcessing
                                    ? "본 예매 내역은 취소/환불 처리 중인 예매 내역입니다."
                                    : (isRefunded ? "본 예매 내역은 환불 완료된 예매 내역입니다." : "본 예매 내역은 취소된 예매 내역입니다.")}
                            </h2>
                        </div>
                    )}

                    {/* 입금 대기 상태 안내 메시지 */}
                    {detail.status === "PAYMENT_WAITING" && (
                        <div className="flex flex-col items-center justify-center -mt-2 gap-2 text-center">
                            <h2 className="text-[20px] font-bold text-[var(--foundation-primary-500)]">예약된 티켓 확정을 위해 기한 내 결제를 완료해주세요.</h2>
                            <p className="text-[14px] font-medium text-[#888]">입금 기한 내 입금이 완료되지 않을 시, 예매된 티켓이 취소됩니다.</p>
                        </div>
                    )}

                    {/* 입금 안내 정보 */}
                    {detail.status === "PAYMENT_WAITING" && detail.depositInfo && (
                        <section className="flex flex-col gap-4">
                            <h2 className="text-[18px] font-bold text-[#1A1A1A]">입금 안내 정보</h2>
                            <div className="bg-white border border-[var(--foundation-primary-500)] rounded-2xl p-6 flex flex-col gap-5">
                                <div className="grid grid-cols-[100px_1fr] items-center">
                                    <span className="text-[14px] text-[#999] font-medium mt-[1px]">입금 기한</span>
                                    <span className="text-[15px] font-bold text-[#1A1A1A]">{detail.depositInfo.deadline}</span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] items-center">
                                    <span className="text-[14px] text-[#999] font-medium mt-[1px]">입금 계좌</span>
                                    <span className="text-[15px] font-bold text-[#1A1A1A]">{detail.depositInfo.bank} {detail.depositInfo.account}</span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] items-center">
                                    <span className="text-[14px] text-[#999] font-medium mt-[1px]">예금주</span>
                                    <span className="text-[15px] font-bold text-[#1A1A1A]">{detail.depositInfo.holder}</span>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* 경기 정보 */}
                    <section className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-[18px] font-bold text-[#1A1A1A]">경기 정보</h2>
                            <h3 className="text-[18px] font-bold text-[var(--foundation-primary-500)]">
                                {detail.matchInfo.dateStr} | {detail.matchInfo.matchTitle}
                            </h3>
                        </div>

                        <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
                            {/* 경기 장소 */}
                            <div className="grid grid-cols-[100px_1fr] items-start pb-5 border-b border-[#F0F0F0]">
                                <span className="text-[14px] text-[#999] font-medium mt-[1px]">경기 장소</span>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[15px] font-medium text-[#1A1A1A]">{detail.matchInfo.stadium}</span>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className="text-[12px] text-[#999]">{detail.matchInfo.address}</span>
                                        <button onClick={handleCopyAddress} className="text-[#999] hover:text-[#666] transition-colors" aria-label="주소 복사">
                                            <Copy size={13} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* 경기 시간 */}
                            <div className="grid grid-cols-[100px_1fr] items-center py-5 border-b border-[#F0F0F0]">
                                <span className="text-[14px] text-[#999] font-medium">경기 시간</span>
                                <span className="text-[15px] font-medium text-[#1A1A1A]">{detail.matchInfo.dateStr}</span>
                            </div>
                            {/* 선택 좌석 */}
                            <div className="grid grid-cols-[100px_1fr] items-start pt-5">
                                <span className="text-[14px] text-[#999] font-medium mt-[1px]">선택 좌석</span>
                                <div className="flex flex-col gap-1.5">
                                    {detail.matchInfo.seats.map((seat, i) => (
                                        <span key={i} className={`text-[15px] font-bold ${isCancelled ? (isProcessing ? 'text-[#999999]' : 'text-[#3B82F6]') : 'text-[var(--foundation-primary-500)]'}`}>
                                            {seat}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 결제 및 취소 정보 (취소 상태일 때 표시) */}
                    {isCancelled && detail.cancelInfo && (
                        <section className="flex flex-col gap-4">
                            <h2 className="text-[18px] font-bold text-[#1A1A1A]">{isProcessing ? "취소/환불 진행 정보" : "결제 및 취소 정보"}</h2>
                            <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
                                <div className="grid grid-cols-[100px_1fr] items-center pb-5 border-b border-[#F0F0F0]">
                                    <span className="text-[14px] text-[#999] font-medium">결제 상태</span>
                                    <span className={`text-[15px] font-bold ${isProcessing ? 'text-[#999]' : 'text-[#3B82F6]'}`}>{detail.cancelInfo.cancelStatus}</span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] items-center py-5 border-b border-[#F0F0F0]">
                                    <span className="text-[14px] text-[#999] font-medium">결제 일시</span>
                                    <span className="text-[15px] font-medium text-[#1A1A1A]">{detail.paymentInfo.paymentDate}</span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] items-center py-5 border-b border-[#F0F0F0]">
                                    <span className="text-[14px] text-[#999] font-medium">결제 수단</span>
                                    <span className="text-[15px] font-medium text-[#1A1A1A]">{detail.paymentInfo.method}</span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] items-center pt-5">
                                    <span className="text-[14px] text-[#999] font-medium">{isProcessing ? "취소/환불 접수일시" : "취소 일시"}</span>
                                    <span className="text-[15px] font-medium text-[#1A1A1A]">{detail.cancelInfo.cancelDate}</span>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* 환불 예정 금액 (취소 혹은 환불 상태일 때 표시) */}
                    {isCancelled && detail.cancelInfo && (
                        <section className="flex flex-col gap-4">
                            <h2 className="text-[18px] font-bold text-[#1A1A1A]">{isProcessing ? "환불 예정 금액" : "환불 금액"}</h2>
                            <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
                                {/* 헤더 */}
                                <div className="flex justify-between items-center pb-4 border-b border-[#E8E8E8]">
                                    <span className="text-[18px] font-bold text-[#1A1A1A]">{isProcessing ? "예상 환불 금액" : "총 환불 금액"}</span>
                                    <span className={`text-[20px] font-bold ${isProcessing ? 'text-[var(--foundation-primary-500)]' : 'text-[var(--foundation-red-500)]'}`}>
                                        {(detail.paymentInfo.totalAmount - detail.paymentInfo.fee).toLocaleString()} 원
                                    </span>
                                </div>
                                {/* 디테일 */}
                                <div className="flex flex-col gap-2.5 py-5 border-b border-[#E8E8E8]">
                                    <div className="flex justify-between items-center text-[14px]">
                                        <span className="text-[#333] font-medium">총 결제 금액</span>
                                        <span className="text-[#1A1A1A] font-medium">{detail.paymentInfo.totalAmount.toLocaleString()} 원</span>
                                    </div>
                                    {detail.paymentInfo.seatPrices.map((seat, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-[13px] text-[#666] ml-2">
                                            <span>{seat.label}</span>
                                            <span>{seat.price.toLocaleString()} 원</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center text-[14px]">
                                        <span className="text-[#333] font-medium">취소 수수료</span>
                                        <span className="text-[#3B82F6] font-medium">({detail.paymentInfo.fee.toLocaleString()} 원)</span>
                                    </div>
                                </div>
                                {/* 취소 기한/수수료 */}
                                <div className="grid grid-cols-[100px_1fr] items-center py-5 border-b border-[#F0F0F0]">
                                    <span className="text-[14px] text-[#999] font-medium">취소 기한</span>
                                    <span className="text-[14px] text-[#333] font-medium">{detail.paymentInfo.cancelDeadline}</span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr_auto] items-center pt-5">
                                    <span className="text-[14px] text-[#999] font-medium">취소 수수료</span>
                                    <span className="text-[14px] text-[#333] font-medium">{detail.paymentInfo.cancelFeeRule}</span>
                                    <button className="px-3 py-1.5 rounded-full border border-[var(--foundation-primary-500)] text-[var(--foundation-primary-500)] text-[12px] font-bold hover:bg-[var(--foundation-primary-50)] transition-colors">자세히보기</button>
                                </div>
                                {isRefunded && detail.paymentInfo.method === "무통장 입금" && (
                                    <div className="grid grid-cols-[100px_1fr] items-center pt-5 mt-5 border-t border-[#F0F0F0]">
                                        <span className="text-[14px] text-[#999] font-medium">환불 계좌</span>
                                        <span className="text-[14px] font-medium text-[#1A1A1A]">국민 000-000***-00-00 (윤정빈)</span>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* 결제 정보 (결제 완료 상태일 때만 표시, 취소 아닐 때) */}
                    {detail.status === "RESERVED" && !isCancelled && (
                        <section className="flex flex-col gap-4">
                            <h2 className="text-[18px] font-bold text-[#1A1A1A]">결제 정보</h2>
                            <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
                                <div className="grid grid-cols-[100px_1fr] items-center pb-5 border-b border-[#F0F0F0]">
                                    <span className="text-[14px] text-[#999] font-medium">결제 일시</span>
                                    <span className="text-[15px] font-medium text-[#1A1A1A]">{detail.paymentInfo.paymentDate}</span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] items-center pt-5">
                                    <span className="text-[14px] text-[#999] font-medium">결제 수단</span>
                                    <span className="text-[15px] font-medium text-[#1A1A1A]">{detail.paymentInfo.method}</span>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* 결제 금액 */}
                    <section className="flex flex-col gap-4">
                        <h2 className="text-[18px] font-bold text-[#1A1A1A]">결제 금액</h2>
                        <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6">

                            {/* 총 결제 금액 Header */}
                            <div className="flex justify-between items-center pb-4 border-b border-[#E8E8E8]">
                                <span className="text-[18px] font-bold text-[var(--foundation-primary-500)]">총 결제 금액</span>
                                <span className="text-[20px] font-bold text-[var(--foundation-primary-500)]">{detail.paymentInfo.totalAmount.toLocaleString()} 원</span>
                            </div>

                            {/* Breakdown List */}
                            <div className="flex flex-col gap-2.5 py-5 border-b border-[#E8E8E8]">
                                {detail.paymentInfo.seatPrices.map((seat, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-[14px]">
                                        <span className="text-[#333] font-medium">{seat.label}</span>
                                        <span className="text-[#1A1A1A] font-medium">{seat.price.toLocaleString()} 원</span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center text-[14px]">
                                    <span className="text-[#333] font-medium">수수료</span>
                                    <span className="text-[#1A1A1A] font-medium">{detail.paymentInfo.fee.toLocaleString()} 원</span>
                                </div>
                            </div>

                            {/* Cancellation rules */}
                            <div className="grid grid-cols-[100px_1fr] items-center py-5 border-b border-[#F0F0F0]">
                                <span className="text-[14px] text-[#999] font-medium">취소 기한</span>
                                <span className="text-[14px] text-[#333] font-medium">{detail.paymentInfo.cancelDeadline}</span>
                            </div>
                            <div className="grid grid-cols-[100px_1fr_auto] items-center pt-5">
                                <span className="text-[14px] text-[#999] font-medium">취소 수수료</span>
                                <span className="text-[14px] text-[#333] font-medium">{detail.paymentInfo.cancelFeeRule}</span>
                                <button className="px-3 py-1.5 rounded-full border border-[var(--foundation-primary-500)] text-[var(--foundation-primary-500)] text-[12px] font-bold hover:bg-[var(--foundation-primary-50)] transition-colors">자세히보기</button>
                            </div>
                        </div>
                    </section>

                    {/* 증빙 서류 발급 (취소 아닐 때 결제 완료시에만 표시) */}
                    {detail.status === "RESERVED" && !isCancelled && (
                        <section className="flex flex-col gap-4">
                            <h2 className="text-[18px] font-bold text-[#1A1A1A]">증빙 서류 발급</h2>
                            <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
                                <div className="grid grid-cols-[100px_1fr] items-start pb-5 border-b border-[#F0F0F0] gap-y-4">
                                    <span className="text-[14px] text-[#999] font-medium mt-1">현금영수증</span>
                                    <div className="flex flex-col gap-3">
                                        <span className="text-[15px] font-medium text-[#1A1A1A]">{detail.document.cashReceipt}</span>
                                        <div className="flex justify-between items-center bg-white rounded-[12px] border border-[#E8E8E8] px-5 py-4">
                                            <span className="text-[14px] text-[#1A1A1A] font-medium">{detail.document.cashReceiptInfo}</span>
                                            <span className="text-[14px] text-[#666]">{detail.document.cashReceiptPhone}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-[100px_1fr_auto] items-center pt-5">
                                    <span className="text-[14px] text-[#999] font-medium">입금증</span>
                                    <span className="text-[15px] font-medium text-[#1A1A1A]">총 발행 금액: {detail.document.depositReceiptAmount.toLocaleString()} 원</span>
                                    <button className="px-4 py-2 rounded-full border border-[var(--foundation-primary-500)] text-[var(--foundation-primary-500)] text-[13px] font-bold hover:bg-[var(--foundation-primary-50)] transition-colors">인쇄하기</button>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Buttons */}
                    {!isCancelled && (
                        <div className="flex items-center gap-3 mt-4">
                            {detail.status === "RESERVED" ? (
                                !isPastMatch ? (
                                    <button
                                        onClick={handleOpenCancelModal}
                                        className="flex-1 py-4 rounded-2xl bg-[var(--foundation-red-500)] text-white text-[16px] font-bold hover:bg-[#E63946] transition-colors active:scale-[0.99]"
                                    >
                                        취소 진행하기
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => router.back()}
                                        className="flex-1 py-4 bg-[#E8E8E8] text-[#1A1A1A] rounded-2xl font-bold text-[16px] hover:bg-[#D4D4D4] transition-colors"
                                    >
                                        돌아가기
                                    </button>
                                )
                            ) : (
                                <button
                                    onClick={() => router.back()}
                                    className="flex-1 py-4 bg-[#E8E8E8] text-[#1A1A1A] rounded-2xl font-bold text-[16px] hover:bg-[#D4D4D4] transition-colors"
                                >
                                    목록으로 돌아가기
                                </button>
                            )}
                        </div>
                    )}

                    {/* 취소 완료나 처리 중 상태에서는 하단에 별도 버튼 없음 (MVP 기획 대응) */}
                    {isCancelled && (
                        <div className="flex items-center gap-3 mt-4">
                            <button
                                onClick={() => router.back()}
                                className="flex-1 py-4 bg-[#E8E8E8] text-[#1A1A1A] rounded-2xl font-bold text-[16px] hover:bg-[#D4D4D4] transition-colors"
                            >
                                목록으로 돌아가기
                            </button>
                        </div>
                    )}

                </div>
            </div>

            {/* 취소 모달 */}
            <CancelTicketModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                ticketInfo={cancelTicketInfo}
                paymentAmount={detail.paymentInfo.totalAmount}
                cancelFee={detail.paymentInfo.fee}
                onCancelSuccess={handleCancelSuccess}
            />

        </div >
    );
}
