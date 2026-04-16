"use client";

import { useState } from "react";
import { toast } from "sonner";
import { deleteAccount } from "@/lib/services";
import { Checkbox } from "@/components/ui/checkbox";

interface DeleteAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDeleteSuccess: () => void;
}

export function DeleteAccountModal({ isOpen, onClose, onDeleteSuccess }: DeleteAccountModalProps) {
    const [checked1, setChecked1] = useState(false);
    const [checked2, setChecked2] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const canDelete = checked1 && checked2;

    const handleClose = () => {
        setChecked1(false);
        setChecked2(false);
        onClose();
    };

    const handleDelete = async () => {
        if (!canDelete || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await deleteAccount();
            onDeleteSuccess();
        } catch (error: any) {
            toast.error(error?.message || "회원 탈퇴 처리 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Dimmed Background */}
            <div
                className="absolute inset-0 bg-black/40 animate-in fade-in duration-200"
                onClick={handleClose}
            />

            {/* Modal Body */}
            <div className="relative w-full max-w-[600px] bg-white rounded-xl px-8 py-10 shadow-xl animate-in zoom-in-95 fade-in duration-200">
                <h3 className="text-[22px] font-bold text-[#1A1A1A] mb-6">
                    계정을 삭제하시겠어요?
                </h3>

                {/* 안내 박스 */}
                <div className="bg-[#F5F5F5] rounded-xl px-6 py-5 mb-6 text-[14px] text-[#3D3D3D] leading-relaxed flex flex-col gap-1">
                    <p>회원 탈퇴 시 모든 계정 정보와 이용 기록이 삭제되며 복구할 수 없습니다.</p>
                    <p>작성한 데이터, 저장된 일정 및 맞춤 정보도 함께 삭제됩니다.</p>
                    <p>탈퇴 후 동일한 계정으로 재가입은 가능하지만, 이전 정보는 복원되지 않습니다.</p>
                    <p className="font-bold">탈퇴 후 30일 이내 재가입이 제한됩니다.</p>
                    <p className="font-bold">결제한 티켓은 환불되지 않습니다.</p>
                </div>

                {/* 체크박스 */}
                <div className="flex flex-col gap-3 mb-8">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <Checkbox
                            id="check1"
                            checked={checked1}
                            onCheckedChange={(v) => setChecked1(!!v)}
                            className="mt-0.5 flex-shrink-0 data-[state=checked]:bg-[var(--foundation-primary-500)] data-[state=checked]:border-[var(--foundation-primary-500)]"
                        />
                        <span className="text-[14px] text-[#3D3D3D]">
                            회원 탈퇴 시 계정 및 모든 데이터가 삭제되며 복구할 수 없음을 확인했습니다.
                        </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                        <Checkbox
                            id="check2"
                            checked={checked2}
                            onCheckedChange={(v) => setChecked2(!!v)}
                            className="mt-0.5 flex-shrink-0 data-[state=checked]:bg-[var(--foundation-primary-500)] data-[state=checked]:border-[var(--foundation-primary-500)]"
                        />
                        <span className="text-[14px] text-[#3D3D3D]">
                            이용약관 및 개인정보 처리방침에 따른 탈퇴 정책을 확인했습니다.
                        </span>
                    </label>
                </div>

                {/* 버튼 */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 py-4 rounded-[12px] bg-[#E8E8E8] text-[#1A1A1A] text-[16px] font-bold hover:bg-[#D4D4D4] transition-colors active:scale-[0.99]"
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={!canDelete || isSubmitting}
                        className="flex-1 py-4 rounded-[12px] bg-[var(--foundation-red-500)] text-white text-[16px] font-bold hover:bg-[#E63946] transition-colors active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "탈퇴 처리 중..." : "계정 삭제하기"}
                    </button>
                </div>
            </div>
        </div>
    );
}
