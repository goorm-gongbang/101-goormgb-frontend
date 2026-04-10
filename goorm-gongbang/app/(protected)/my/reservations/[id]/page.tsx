"use client";

import { useRouter } from "next/navigation";
import { Copy, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, use } from "react";
import { CancelTicketModal } from "@/components/my/CancelTicketModal";
import { TicketInfo } from "@/components/my/TicketDetailModal";
import { RESERVATION_STATUS_MAP } from "../page";
import { getTicketDetail } from "@/lib/services";
import { parseFeeRate } from "@/lib/utils";
import type { TicketDetail } from "@/lib/types";

function formatDate(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}. ${pad(d.getMonth() + 1)}. ${pad(d.getDate())} (${pad(d.getHours())}:${pad(d.getMinutes())})`;
}

const CANCEL_STATUSES = [
    "CANCEL_REQUESTED",
    "CANCEL_PROCESSING",
    "CANCELLED",
    "REFUND_PROCESSING",
    "CANCEL_COMPLETED",
    "REFUND_COMPLETED",
];

export default function ReservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);

    const [detail, setDetail] = useState<TicketDetail | null>(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    useEffect(() => {
        setDetail(null);
        getTicketDetail(Number(resolvedParams.id)).then(setDetail);
    }, [resolvedParams.id]);

    if (!detail) {
        return (
            <div className="flex h-screen items-center justify-center font-bold text-lg text-[#666]">
                불러오는 중...
            </div>
        );
    }

    const isCancelled = CANCEL_STATUSES.includes(detail.status);
    const isPastMatch = new Date(detail.match.matchAt) < new Date();
    const statusLabel = RESERVATION_STATUS_MAP[detail.status] ?? detail.status;

    const matchDateStr = formatDate(detail.match.matchAt);
    const matchTitle = `${detail.match.homeClub.koName} vs ${detail.match.awayClub.koName}`;
    const seatLabels = detail.seats.map(
        (s) => `${s.sectionName} ${s.blockCode}블럭 ${s.rowNo}열 ${s.seatNo}번`
    );

    const handleCopyAddress = () => {
        navigator.clipboard.writeText(detail.match.stadium.address).then(() => {
            toast.success("주소가 복사되었습니다.");
        });
    };

    const handleCancelSuccess = () => {
        toast.success("예매가 취소되었습니다.");
        router.back();
    };

    const cancelTicketInfo: TicketInfo = {
        matchTitle,
        count: detail.seats.length,
        type: detail.seats[0]?.sectionName ?? "",
        zone: detail.seats[0]?.blockCode ?? "",
        seat: detail.seats.map((s) => `${s.rowNo}열 ${s.seatNo}번`).join(", "),
        date: matchDateStr.split(" (")[0],
        time: matchDateStr.match(/\((.*?)\)/)?.[1] ?? "",
        location: detail.match.stadium.koName,
        dateStr: matchDateStr,
    };

    const cancelFeeAmount = (() => {
        if (!detail.cancellationPolicy) return 0;
        const r = parseFeeRate(detail.cancellationPolicy.feeRate);
        return r > 0 ? Math.round((detail.payment?.totalAmount ?? 0) * r) + 2000 : 0;
    })();

    return (
        <div className="min-h-screen bg-[#F5F5F5] font-pretendard pb-20">
            {/* 상단 헤더 */}
            <div className="sticky top-12 z-10 bg-white border-b border-[#F0F0F0]">
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

            <div className="max-w-[1200px] mx-auto px-4 py-12 flex justify-center min-h-[calc(100vh-48px)]">
                <div className="w-full max-w-[800px] flex flex-col gap-10">

                    {/* 제목 */}
                    <div className="flex items-center gap-1 -ml-2">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="p-1.5 hover:bg-[#E8E8E8] rounded-full transition-colors flex items-center justify-center"
                        >
                            <ChevronLeft size={26} className="text-[#1A1A1A]" />
                        </button>
                        <h1 className="text-[22px] font-bold text-[#1A1A1A] mb-[1px]">
                            {isCancelled ? "취소/환불 상세 내역" : "예매 상세 내역"}
                        </h1>
                    </div>

                    {/* 취소/환불 상태 안내 배너 */}
                    {isCancelled && (
                        <div className="flex flex-col items-center justify-center -mt-2 mb-2 text-center w-full">
                            <h2 className="text-[20px] font-bold text-[var(--foundation-primary-500)]">
                                현재 진행 상황: {statusLabel}
                            </h2>
                        </div>
                    )}

                    {/* 입금 대기 안내 */}
                    {detail.status === "PAYMENT_PENDING" && (
                        <div className="flex flex-col items-center justify-center -mt-2 gap-2 text-center">
                            <h2 className="text-[20px] font-bold text-[var(--foundation-primary-500)]">예약된 티켓 확정을 위해 기한 내 결제를 완료해주세요.</h2>
                            <p className="text-[14px] font-medium text-[#888]">입금 기한 내 입금이 완료되지 않을 시, 예매된 티켓이 취소됩니다.</p>
                        </div>
                    )}

                    {/* 입금 안내 정보 */}
                    {detail.status === "PAYMENT_PENDING" && detail.virtualAccount && (
                        <section className="flex flex-col gap-4">
                            <h2 className="text-[18px] font-bold text-[#1A1A1A]">입금 안내 정보</h2>
                            <div className="bg-white border border-[var(--foundation-primary-500)] rounded-2xl p-6 flex flex-col gap-5">
                                <div className="grid grid-cols-[100px_1fr] items-center">
                                    <span className="text-[14px] text-[#999] font-medium mt-[1px]">입금 기한</span>
                                    <span className="text-[15px] font-bold text-[#1A1A1A]">{formatDate(detail.virtualAccount.depositDeadline)}</span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] items-center">
                                    <span className="text-[14px] text-[#999] font-medium mt-[1px]">입금 계좌</span>
                                    <span className="text-[15px] font-bold text-[#1A1A1A]">{detail.virtualAccount.bank} {detail.virtualAccount.accountNumber}</span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] items-center">
                                    <span className="text-[14px] text-[#999] font-medium mt-[1px]">예금주</span>
                                    <span className="text-[15px] font-bold text-[#1A1A1A]">{detail.virtualAccount.holder}</span>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* 경기 정보 */}
                    <section className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-[18px] font-bold text-[#1A1A1A]">경기 정보</h2>
                            <h3 className="text-[18px] font-bold text-[var(--foundation-primary-500)]">
                                {matchDateStr} | {matchTitle}
                            </h3>
                        </div>
                        <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
                            <div className="grid grid-cols-[100px_1fr] items-start pb-5 border-b border-[#F0F0F0]">
                                <span className="text-[14px] text-[#999] font-medium mt-[1px]">경기 장소</span>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[15px] font-medium text-[#1A1A1A]">{detail.match.stadium.koName}</span>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className="text-[12px] text-[#999]">{detail.match.stadium.address}</span>
                                        <button onClick={handleCopyAddress} className="text-[#999] hover:text-[#666] transition-colors" aria-label="주소 복사">
                                            <Copy size={13} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-[100px_1fr] items-center py-5 border-b border-[#F0F0F0]">
                                <span className="text-[14px] text-[#999] font-medium">경기 시간</span>
                                <span className="text-[15px] font-medium text-[#1A1A1A]">{matchDateStr}</span>
                            </div>
                            <div className="grid grid-cols-[100px_1fr] items-start pt-5">
                                <span className="text-[14px] text-[#999] font-medium mt-[1px]">선택 좌석</span>
                                <div className="flex flex-col gap-1.5">
                                    {seatLabels.map((seat, i) => (
                                        <span key={i} className={`text-[15px] font-bold ${isCancelled ? "text-[#A3A3A3]" : "text-[var(--foundation-primary-500)]"}`}>
                                            {seat}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 취소/환불 정보 */}
                    {isCancelled && (
                        <section className="flex flex-col gap-4">
                            <h2 className="text-[18px] font-bold text-[#1A1A1A]">취소/환불 정보</h2>
                            <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 flex flex-col gap-0">
                                <div className="grid grid-cols-[120px_1fr] items-center pb-5 border-b border-[#F0F0F0]">
                                    <span className="text-[14px] text-[#999] font-medium">진행 상태</span>
                                    <span className="text-[15px] font-bold text-[#A3A3A3]">{statusLabel}</span>
                                </div>
                                {detail.payment && (
                                    <>
                                        <div className="grid grid-cols-[120px_1fr] items-center py-5 border-b border-[#F0F0F0]">
                                            <span className="text-[14px] text-[#999] font-medium">결제 일시</span>
                                            <span className="text-[15px] font-medium text-[#1A1A1A]">{formatDate(detail.payment.paidAt)}</span>
                                        </div>
                                        <div className="grid grid-cols-[120px_1fr] items-center py-5 border-b border-[#F0F0F0]">
                                            <span className="text-[14px] text-[#999] font-medium">결제 수단</span>
                                            <span className="text-[15px] font-medium text-[#1A1A1A]">{detail.payment.paymentMethod}</span>
                                        </div>
                                    </>
                                )}
                                {detail.cancellation && (
                                    <div className="grid grid-cols-[120px_1fr] items-center pt-5">
                                        <span className="text-[14px] text-[#999] font-medium">취소 접수 일시</span>
                                        <span className="text-[15px] font-medium text-[#1A1A1A]">{formatDate(detail.cancellation.cancelledAt)}</span>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* 환불 금액 */}
                    {isCancelled && (detail.cancellation || detail.payment) && (
                        <section className="flex flex-col gap-4">
                            <h2 className="text-[18px] font-bold text-[#1A1A1A]">환불 금액</h2>
                            <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
                                <div className="flex justify-between items-center pb-4 border-b border-[#E8E8E8]">
                                    <span className="text-[18px] font-bold text-[#1A1A1A]">환불 금액</span>
                                    <span className="text-[20px] font-bold text-[var(--foundation-red-500)]">
                                        {detail.cancellation
                                            ? detail.cancellation.refundedAmount.toLocaleString()
                                            : (detail.payment?.totalAmount ?? 0).toLocaleString()
                                        } 원
                                    </span>
                                </div>
                                <div className="flex flex-col gap-2.5 py-5 border-b border-[#E8E8E8]">
                                    {detail.payment && (
                                        <div className="flex justify-between items-center text-[14px]">
                                            <span className="text-[#333] font-medium">총 결제 금액</span>
                                            <span className="text-[#1A1A1A] font-medium">{detail.payment.totalAmount.toLocaleString()} 원</span>
                                        </div>
                                    )}
                                    {detail.cancellation && (
                                        <div className="flex justify-between items-center text-[14px]">
                                            <span className="text-[#333] font-medium">취소 수수료</span>
                                            <span className="text-[#3B82F6] font-medium">({detail.cancellation.cancellationFee.toLocaleString()} 원)</span>
                                        </div>
                                    )}
                                </div>
                                {detail.cancellationPolicy && (
                                    <>
                                        <div className="grid grid-cols-[120px_1fr] items-center py-5 border-b border-[#F0F0F0]">
                                            <span className="text-[14px] text-[#999] font-medium">취소 기한</span>
                                            <span className="text-[14px] text-[#333] font-medium">{formatDate(detail.cancellationPolicy.deadline)}</span>
                                        </div>
                                        <div className="grid grid-cols-[120px_1fr] items-center pt-5">
                                            <span className="text-[14px] text-[#999] font-medium">취소 수수료율</span>
                                            <span className="text-[14px] text-[#333] font-medium">{detail.cancellationPolicy.feeRate}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>
                    )}

                    {/* 결제 정보 (일반 예매) */}
                    {!isCancelled && detail.status !== "PAYMENT_PENDING" && detail.payment && (
                        <section className="flex flex-col gap-4">
                            <h2 className="text-[18px] font-bold text-[#1A1A1A]">결제 정보</h2>
                            <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 flex flex-col gap-5">
                                <div className="grid grid-cols-[100px_1fr] items-center">
                                    <span className="text-[14px] text-[#999] font-medium">결제 일시</span>
                                    <span className="text-[15px] font-medium text-[#1A1A1A]">
                                        {detail.status === "PAYMENT_PENDING"
                                            ? (detail.createdAt ? formatDate(detail.createdAt) : "-")
                                            : (detail.payment ? formatDate(detail.payment.paidAt) : "-")}
                                    </span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] items-center">
                                    <span className="text-[14px] text-[#999] font-medium">결제 수단</span>
                                    <span className="text-[15px] font-medium text-[#1A1A1A]">
                                        {detail.status === "PAYMENT_PENDING"
                                            ? (detail.virtualAccount ? `무통장입금 (${detail.virtualAccount.bank})` : "-")
                                            : (detail.payment ? detail.payment.paymentMethod : "-")}
                                    </span>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* 결제 금액 (일반 예매) */}
                    {!isCancelled && (detail.payment || detail.status === "PAYMENT_PENDING") && (
                        <section className="flex flex-col gap-4">
                            <h2 className="text-[18px] font-bold text-[#1A1A1A]">결제 금액</h2>
                            <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
                                {(() => {
                                    const totalAmount = detail.payment?.totalAmount ?? 0;
                                    const serviceFee = detail.payment?.serviceFee ?? 0;
                                    return (
                                        <>
                                            <div className="flex justify-between items-center pb-4 border-b border-[#E8E8E8]">
                                                <span className="text-[18px] font-bold text-[var(--foundation-primary-500)]">총 결제 금액</span>
                                                <span className="text-[20px] font-bold text-[var(--foundation-primary-500)]">{totalAmount.toLocaleString()} 원</span>
                                            </div>
                                            <div className="flex flex-col gap-2.5 py-5 border-b border-[#E8E8E8]">
                                                {seatLabels.map((label, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-[14px]">
                                                        <span className="text-[#333] font-medium">{label}</span>
                                                        <span className="text-[#1A1A1A] font-medium">{(totalAmount - serviceFee).toLocaleString()} 원</span>
                                                    </div>
                                                ))}
                                                <div className="flex justify-between items-center text-[14px]">
                                                    <span className="text-[#333] font-medium">수수료</span>
                                                    <span className="text-[#1A1A1A] font-medium">{serviceFee.toLocaleString()} 원</span>
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}

                                {detail.cancellationPolicy && (
                                    <>
                                        <div className="grid grid-cols-[100px_1fr] items-center py-5 border-b border-[#F0F0F0]">
                                            <span className="text-[14px] text-[#999] font-medium">취소 기한</span>
                                            <span className="text-[14px] text-[#333] font-medium">{formatDate(detail.cancellationPolicy.deadline)}</span>
                                        </div>
                                        <div className="grid grid-cols-[100px_1fr] items-center pt-5">
                                            <span className="text-[14px] text-[#999] font-medium">취소 수수료</span>
                                            <span className="text-[14px] text-[#333] font-medium">{detail.cancellationPolicy.feeRate}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>
                    )}

                    {/* 증빙 서류 발급 */}
                    {!isCancelled && detail.payment?.cashReceipt && (
                        <section className="flex flex-col gap-4">
                            <h2 className="text-[18px] font-bold text-[#1A1A1A]">증빙 서류 발급</h2>
                            <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6">
                                <div className="grid grid-cols-[100px_1fr] items-start pb-5 border-b border-[#F0F0F0] gap-y-4">
                                    <span className="text-[14px] text-[#999] font-medium mt-1">현금영수증</span>
                                    <div className="flex flex-col gap-3">
                                        <span className="text-[15px] font-medium text-[#1A1A1A]">발급</span>
                                        <div className="flex justify-between items-center bg-white rounded-[12px] border border-[#E8E8E8] px-5 py-4">
                                            <span className="text-[14px] text-[#1A1A1A] font-medium">{detail.payment.cashReceipt.type}</span>
                                            <span className="text-[14px] text-[#666]">({detail.payment.cashReceipt.number})</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-[100px_1fr_auto] items-center pt-5">
                                    <span className="text-[14px] text-[#999] font-medium">입금증</span>
                                    <span className="text-[15px] font-medium text-[#1A1A1A]">총 발행 금액: {detail.payment.cashReceipt.totalAmount.toLocaleString()} 원</span>
                                    <button className="px-4 py-2 rounded-full border border-[var(--foundation-primary-500)] text-[var(--foundation-primary-500)] text-[13px] font-bold hover:bg-[var(--foundation-primary-50)] transition-colors">인쇄하기</button>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* 버튼 */}
                    <div className="flex items-center gap-3 mt-4">
                        {!isCancelled && detail.actions.canCancel && !isPastMatch ? (
                            <button
                                onClick={() => setIsCancelModalOpen(true)}
                                className="flex-1 py-4 rounded-2xl bg-[var(--foundation-red-500)] text-white text-[16px] font-bold hover:bg-[#E63946] transition-colors active:scale-[0.99]"
                            >
                                취소 진행하기
                            </button>
                        ) : (
                            <button
                                onClick={() => router.back()}
                                className="flex-1 py-4 bg-[#E8E8E8] text-[#1A1A1A] rounded-2xl font-bold text-[16px] hover:bg-[#D4D4D4] transition-colors"
                            >
                                목록으로 돌아가기
                            </button>
                        )}
                    </div>

                </div>
            </div>

            {/* 취소 모달 */}
            <CancelTicketModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                ticketInfo={cancelTicketInfo}
                ticketId={Number(resolvedParams.id)}
                paymentAmount={detail.payment?.totalAmount ?? 0}
                cancelFee={cancelFeeAmount}
                onCancelSuccess={handleCancelSuccess}
            />
        </div>
    );
}
