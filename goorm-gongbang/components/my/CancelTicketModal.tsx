"use client";

import { useEffect, useState } from "react";
import { TicketInfo } from "./TicketDetailModal";

interface CancelTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticketInfo: TicketInfo | null;
    paymentAmount: number;
    cancelFee: number;
    onCancelSuccess?: () => void;
}

type ModalStep = "CONFIRM" | "COMPLETE";

export function CancelTicketModal({ isOpen, onClose, ticketInfo, paymentAmount, cancelFee, onCancelSuccess }: CancelTicketModalProps) {
    const [mounted, setMounted] = useState(false);
    const [step, setStep] = useState<ModalStep>("CONFIRM");

    useEffect(() => {
        setMounted(true);
    }, []);

    // 모달이 닫히면 다시 첫 단계로 리셋
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => setStep("CONFIRM"), 300); // 애니메이션 후 리셋
        }
    }, [isOpen]);

    if (!mounted || !isOpen || !ticketInfo) return null;

    const estimatedRefund = paymentAmount - cancelFee;

    const handleCancelProceed = async () => {
        /*
          TODO: [API 연동 가이드] - 티켓 예매 취소 처리
          1. 버튼이 클릭되면 (isSubmitting = true) 로딩 상태를 주어 중복 클릭을 방지합니다.
          2. 백엔드 취소 API (예: POST /api/v1/tickets/${ticketInfo.id}/cancel) 를 호출합니다.
          3. 취소 수수료 등의 민감한 정보는 클라이언트 연산(paymentAmount - cancelFee)이 아닌, 
             서버 API가 검증/계산하여 내려준 최종 응답(response)을 사용하는 것이 권장됩니다.
        */
        try {
            // ex) await handleCancelApi(ticketInfo.id);

            // API 호출이 정상적으로 완료되었다고 가정하고 다음 UI 스텝으로 이동합니다.
            setStep("COMPLETE");

            // onCancelSuccess 콜백이 있다면 실행하여, 부모(page.tsx)의 목록 상태를 업데이트합니다.
            if (onCancelSuccess) {
                onCancelSuccess();
            }
        } catch (error) {
            /* 
              TODO: [API 연동 가이드] - 에러 핸들링
              취소 과정에서 발생한 에러(ex: 이미 취소된 티켓, 네트워크 오류 등)를 catch 하면
              toast 등을 띄워 사용자에게 알맞게 공지하거나 이전 상태로 롤백해야 합니다.
            */
            console.error("티켓 취소 실패:", error);
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
                            className="flex-1 py-4 rounded-[12px] bg-[var(--foundation-red-500)] text-white text-[16px] font-bold hover:bg-[#E63946] transition-colors active:scale-[0.99]"
                        >
                            취소 진행하기
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
