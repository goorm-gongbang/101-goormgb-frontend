"use client";

import { useEffect, useState } from "react";
import { cancelTicket } from "@/lib/services";
import type { TicketCancelResult } from "@/lib/types";
import { TicketInfo } from "./TicketDetailModal";

interface CancelTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticketInfo: TicketInfo | null;
    ticketId?: number;
    paymentAmount: number;
    cancelFee: number;
    onCancelSuccess?: () => void;
}

type ModalStep = "CONFIRM" | "COMPLETE";

export function CancelTicketModal({ isOpen, onClose, ticketInfo, ticketId, paymentAmount, cancelFee, onCancelSuccess }: CancelTicketModalProps) {
    const [mounted, setMounted] = useState(false);
    const [step, setStep] = useState<ModalStep>("CONFIRM");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cancelResult, setCancelResult] = useState<TicketCancelResult | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // 모달이 닫히면 다시 첫 단계로 리셋
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setStep("CONFIRM");
                setCancelResult(null);
            }, 300); // 애니메이션 후 리셋
        }
    }, [isOpen]);

    if (!mounted || !isOpen || !ticketInfo) return null;

    const estimatedRefund = paymentAmount - cancelFee;

    const handleCancelProceed = async () => {
        if (!ticketId || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const result = await cancelTicket(ticketId);
            setCancelResult(result);
            setStep("COMPLETE");
            if (onCancelSuccess) {
                onCancelSuccess();
            }
        } catch {
            // toast는 서비스 레이어에서 처리됨
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Dimmed Background */}
            <div
                className="absolute inset-0 bg-black/40 animate-in fade-in duration-200"
                onClick={handleClose}
            />

            {/* Modal Body */}
            {step === "CONFIRM" ? (
                <div className="relative w-full max-w-[600px] bg-white rounded-xl px-8 py-10 shadow-xl animate-in zoom-in-95 fade-in duration-200">
                    <h3 className="text-[20px] font-bold text-[#1A1A1A] mb-6 leading-tight break-keep">
                        {ticketInfo.matchTitle} ({ticketInfo.dateStr || `${ticketInfo.date} ${ticketInfo.time}`}) 경기를 취소하시겠어요?
                    </h3>

                    <div className="mb-8">
                        <p className="text-[15px] text-[#333] font-medium mb-3">
                            취소하면 해당 좌석은 <span className="text-[var(--foundation-red-500)] font-bold">즉시 판매 가능 상태</span>로 변경됩니다.
                        </p>
                        <ul className="text-[14px] text-[#666] flex flex-col gap-1.5 list-disc pl-5">
                            <li>부분 취소는 지원되지 않습니다.</li>
                            <li>취소 수수료가 발생할 수 있습니다.</li>
                            <li>환불 금액은 취소 시점 기준으로 영업일 기준 3~5일이 소요될 수 있습니다.</li>
                            <li>환불 금액은 결제했던 수단으로 환불이 진행됩니다.</li>
                        </ul>
                    </div>

                    <div className="border border-[#E8E8E8] rounded-[8px] mb-8 overflow-hidden">
                        <div className="flex justify-between items-center py-4 px-5 border-b border-[#E8E8E8] bg-[#FAFAFA]">
                            <span className="text-[15px] font-bold text-[#666]">총 결제 금액</span>
                            <span className="text-[16px] font-bold text-[#1A1A1A]">{paymentAmount.toLocaleString()} 원</span>
                        </div>
                        <div className="flex justify-between items-center py-4 px-5 border-b border-[#E8E8E8]">
                            <span className="text-[15px] font-bold text-[#666]">취소 수수료</span>
                            <span className="text-[16px] font-bold text-[#666]">({cancelFee.toLocaleString()} 원)</span>
                        </div>
                        <div className="flex justify-between items-center py-4 px-5 bg-[#FAFAFA]">
                            <span className="text-[15px] font-bold text-[#1A1A1A]">예상 환불 금액</span>
                            <span className="text-[16px] font-bold text-[var(--foundation-red-500)]">{estimatedRefund.toLocaleString()} 원</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleClose}
                            className="flex-1 py-4 rounded-[12px] bg-[#E8E8E8] text-[#1A1A1A] text-[16px] font-bold hover:bg-[#D4D4D4] transition-colors active:scale-[0.99]"
                        >
                            예매 유지하기
                        </button>
                        <button
                            onClick={handleCancelProceed}
                            disabled={isSubmitting}
                            className="flex-1 py-4 rounded-[12px] bg-[var(--foundation-red-500)] text-white text-[16px] font-bold hover:bg-[#E63946] transition-colors active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "취소 처리 중..." : "취소 진행하기"}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="relative w-full max-w-[480px] bg-white rounded-xl px-8 py-10 shadow-xl animate-in zoom-in-95 fade-in duration-200">
                    <h3 className="text-[20px] font-bold text-[#1A1A1A] mb-5">
                        예매가 취소되었습니다
                    </h3>

                    <div className="mb-8 overflow-hidden">
                        <p className="text-[15px] text-[#333] font-medium mb-3">
                            예매가 정상적으로 취소되었습니다.
                        </p>
                        {cancelResult && (
                            <div className="border border-[#E8E8E8] rounded-[8px] mb-5 overflow-hidden">
                                <div className="flex justify-between items-center py-3 px-5 border-b border-[#E8E8E8] bg-[#FAFAFA]">
                                    <span className="text-[14px] font-bold text-[#666]">총 결제 금액</span>
                                    <span className="text-[15px] font-bold text-[#1A1A1A]">{cancelResult.totalAmount.toLocaleString()} 원</span>
                                </div>
                                <div className="flex justify-between items-center py-3 px-5 border-b border-[#E8E8E8]">
                                    <span className="text-[14px] font-bold text-[#666]">취소 수수료</span>
                                    <span className="text-[15px] font-bold text-[#666]">({cancelResult.cancellationFee.toLocaleString()} 원)</span>
                                </div>
                                <div className="flex justify-between items-center py-3 px-5 bg-[#FAFAFA]">
                                    <span className="text-[14px] font-bold text-[#1A1A1A]">환불 금액</span>
                                    <span className="text-[15px] font-bold text-[var(--foundation-red-500)]">{cancelResult.refundedAmount.toLocaleString()} 원</span>
                                </div>
                            </div>
                        )}
                        <ul className="text-[14px] text-[#666] flex flex-col gap-1.5 list-disc pl-5">
                            <li>환불 진행 상황은 예매 내역에서 확인하실 수 있습니다.</li>
                            <li>환불 처리까지 영업일 기준 3~5일이 소요될 수 있습니다.</li>
                        </ul>
                    </div>

                    <button
                        onClick={handleClose}
                        className="w-full py-4 rounded-[12px] bg-[var(--foundation-primary-500)] text-white text-[16px] font-bold hover:bg-[var(--foundation-primary-600)] transition-colors active:scale-[0.99]"
                    >
                        확인
                    </button>
                </div>
            )}
        </div>
    );
}
