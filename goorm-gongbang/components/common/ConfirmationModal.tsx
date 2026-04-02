/* ===========================
   변경 사항 미저장 경고 모달
   - 디자인 시안에 맞춘 커스텀 모달
   - dimmed 배경 및 중앙 배치
=========================== */

"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    cancelLabel?: string;
    confirmLabel?: string;
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    cancelLabel = "나가기",
    confirmLabel = "이어서 수정하기",
}: ConfirmationModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Dimmed Background */}
            <div
                className="absolute inset-0 bg-black/40 animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Body */}
            <div className="relative w-full max-w-[340px] bg-white rounded-xl px-6 py-8 shadow-xl animate-in zoom-in-95 fade-in duration-200">
                <div className="flex flex-col items-center text-center gap-2 mb-8">
                    <h3 className="text-[20px] font-bold text-[#1A1A1A]">
                        {title}
                    </h3>
                    <p className="text-[14px] font-medium text-[#666] leading-relaxed break-keep">
                        {description}
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onConfirm} // "나가기" (실제 액션 수행)
                        className="flex-1 py-3.5 rounded-[12px] border border-[var(--foundation-primary-500)] text-[var(--foundation-primary-500)] text-sm font-bold bg-white hover:bg-[#F0FFFA] transition-colors"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onClose} // "이어서 수정하기" (단순 닫기)
                        className="flex-1 py-3.5 rounded-[12px] bg-[var(--foundation-primary-500)] text-white text-sm font-bold hover:bg-[var(--foundation-primary-600)] transition-colors"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
