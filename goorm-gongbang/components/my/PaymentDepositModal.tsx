"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy } from "lucide-react";

interface PaymentDepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    depositInfo: {
        bankName: string;
        accountNumber: string;
        accountHolder: string;
        amount: number;
        deadline: string;
    };
}

export function PaymentDepositModal({ isOpen, onClose, depositInfo }: PaymentDepositModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isOpen) return null;

    const handleCopy = () => {
        const textToCopy = `${depositInfo.bankName} ${depositInfo.accountNumber}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            toast.success("계좌번호가 복사되었습니다.");
        });
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Dimmed Background */}
            <div
                className="absolute inset-0 bg-black/40 animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Body */}
            <div className="relative w-full max-w-[440px] bg-white rounded-[24px] px-8 py-10 shadow-xl animate-in zoom-in-95 fade-in duration-200">

                {/* Header */}
                <div className="flex flex-col items-center text-center gap-1 mb-8">
                    <h3 className="text-[20px] font-bold text-[#1A1A1A] mb-3">
                        입금을 완료해 주세요
                    </h3>
                    <p className="text-[14px] font-medium text-[#333] leading-relaxed break-keep">
                        입금 마감 시간까지 결제가 확인되지 않으면<br />
                        좌석은 <span className="text-[var(--foundation-red-500)] font-bold">자동으로 취소</span>됩니다.
                    </p>
                </div>

                {/* Info List */}
                <div className="flex flex-col gap-4 mb-8">
                    <div className="flex items-center">
                        <span className="w-[80px] text-[15px] font-bold text-[#999999]">입금 계좌</span>
                        <div className="flex-1 flex items-center gap-1">
                            <span className="text-[15px] font-bold text-[#333333]">
                                {depositInfo.bankName} {depositInfo.accountNumber}
                            </span>
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-0.5 ml-1 text-[11px] text-[#999999] hover:text-[#666] transition-colors"
                            >
                                <span className="underline underline-offset-2">복사하기</span>
                                <Copy size={12} className="mt-0.5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <span className="w-[80px] text-[15px] font-bold text-[#999999]">예금주</span>
                        <span className="flex-1 text-[15px] font-bold text-[#333333]">{depositInfo.accountHolder}</span>
                    </div>

                    <div className="flex items-center">
                        <span className="w-[80px] text-[15px] font-bold text-[#999999]">입금 금액</span>
                        <span className="flex-1 text-[16px] font-bold text-[#333333]">{depositInfo.amount.toLocaleString()}원</span>
                    </div>

                    <div className="flex items-center">
                        <span className="w-[80px] text-[15px] font-bold text-[#999999]">입금 기한</span>
                        <span className="flex-1 text-[15px] font-bold text-[#333333]">{depositInfo.deadline}</span>
                    </div>
                </div>

                {/* Confirm Button */}
                <button
                    onClick={onClose}
                    className="w-full py-3.5 rounded-2xl bg-[var(--foundation-primary-500)] text-white text-[15px] font-bold hover:bg-[var(--foundation-primary-600)] transition-colors active:scale-[0.99]"
                >
                    확인
                </button>
            </div>
        </div>
    );
}
