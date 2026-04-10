"use client";

/* ===========================
   결제 수단 관리 페이지 (목업)
   Route: /my/payments
   - 등록된 결제 수단 목록 표시
   - 결제 수단 추가 / 삭제 (목업, 실제 API 미연동)
   - 지원 수단: 카카오페이, 토스페이, 무통장입금(가상계좌)

   [TODO] API 연동 시
   - MOCK_PAYMENT_METHODS → GET /api/users/me/payment-methods
   - 결제 수단 삭제 → DELETE /api/users/me/payment-methods/:id
   - 결제 수단 추가 → 카카오페이/토스페이 OAuth 연동 또는 계좌 인증 플로우
=========================== */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Trash2, CreditCard, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ===========================
   타입
=========================== */
type PaymentMethodType = "kakaopay" | "tosspay" | "bank";

type PaymentMethod = {
    id: string;
    type: PaymentMethodType;
    label: string;
    description: string;
    isDefault: boolean;
};

/* ===========================
   목업 데이터
=========================== */
const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
    {
        id: "pm_001",
        type: "kakaopay",
        label: "카카오페이",
        description: "",
        isDefault: true,
    },
    {
        id: "pm_002",
        type: "tosspay",
        label: "토스페이",
        description: "",
        isDefault: false,
    },
];

/* ===========================
   결제 수단 아이콘
=========================== */
function PaymentIcon({ type, size = 36 }: { type: PaymentMethodType; size?: number }) {
    const base = `rounded-xl flex items-center justify-center flex-shrink-0 font-extrabold text-white`;

    if (type === "kakaopay") {
        return (
            <div
                className="rounded-xl flex-shrink-0 overflow-hidden bg-[#FEE500] flex items-center justify-center"
                style={{ width: size, height: size }}
            >
                <img src="/pay/kakao.png" alt="카카오페이" style={{ width: size * 0.75, height: size * 0.75, objectFit: "contain" }} />
            </div>
        );
    }
    if (type === "tosspay") {
        return (
            <img
                src="/pay/toss.png"
                alt="토스페이"
                className="rounded-xl flex-shrink-0"
                style={{ width: size, height: size, objectFit: "cover" }}
            />
        );
    }

    // bank
    return (
        <div
            className={base}
            style={{ width: size, height: size, background: "#6B7280" }}
        >
            <CreditCard size={size * 0.5} color="#fff" />
        </div>
    );
}

/* ===========================
   결제 수단 추가 모달
=========================== */
type AddModalProps = {
    onClose: () => void;
    onAdd: (type: PaymentMethodType) => void;
    existingTypes: PaymentMethodType[];
};

function AddPaymentModal({ onClose, onAdd, existingTypes }: AddModalProps) {
    const OPTIONS: { type: PaymentMethodType; label: string; desc: string }[] = [
        { type: "kakaopay", label: "카카오페이", desc: "카카오 계정으로 간편 결제" },
        { type: "tosspay", label: "토스페이", desc: "토스 앱으로 간편 결제" },
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-[17px] font-bold text-[#1A1A1A] mb-1">결제 수단 추가</h2>
                <p className="text-xs text-[#9E9E9E] mb-5">추가할 결제 수단을 선택하세요</p>

                <ul className="flex flex-col gap-2">
                    {OPTIONS.map((opt) => {
                        const alreadyAdded = existingTypes.includes(opt.type);
                        return (
                            <li key={opt.type}>
                                <button
                                    type="button"
                                    disabled={alreadyAdded}
                                    onClick={() => { onAdd(opt.type); onClose(); }}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-colors text-left",
                                        alreadyAdded
                                            ? "border-[#F0F0F0] bg-[#FAFAFA] opacity-50 cursor-not-allowed"
                                            : "border-[#E8E8E8] hover:border-[var(--foundation-primary-400)] hover:bg-[var(--foundation-primary-50)]"
                                    )}
                                >
                                    <PaymentIcon type={opt.type} size={38} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[14px] font-semibold text-[#1A1A1A]">{opt.label}</p>
                                        <p className="text-[12px] text-[#9E9E9E]">{opt.desc}</p>
                                    </div>
                                    {alreadyAdded && (
                                        <span className="text-[11px] text-[#ADADAD] font-medium whitespace-nowrap">등록됨</span>
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>

                <button
                    type="button"
                    onClick={onClose}
                    className="mt-4 w-full py-3 rounded-xl bg-[#F5F5F5] text-sm font-semibold text-[#5A5A5A] hover:bg-[#EBEBEB] transition-colors"
                >
                    취소
                </button>
            </div>
        </div>
    );
}

/* ===========================
   삭제 확인 모달
=========================== */
type DeleteModalProps = {
    method: PaymentMethod;
    onClose: () => void;
    onConfirm: () => void;
};

function DeleteConfirmModal({ method, onClose, onConfirm }: DeleteModalProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-[17px] font-bold text-[#1A1A1A] mb-2">결제 수단 삭제</h2>
                <p className="text-[14px] text-[#5A5A5A] leading-relaxed mb-6">
                    <span className="font-semibold text-[#1A1A1A]">{method.label}</span>을(를) 삭제하시겠어요?<br />
                    삭제 후에는 해당 결제 수단으로 결제가 불가합니다.
                </p>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl bg-[#F5F5F5] text-sm font-semibold text-[#5A5A5A] hover:bg-[#EBEBEB] transition-colors"
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="flex-1 py-3 rounded-xl bg-[var(--foundation-red-500)] text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                    >
                        삭제
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ===========================
   메인 페이지
=========================== */
export default function PaymentsPage() {
    const router = useRouter();

    const [methods, setMethods] = useState<PaymentMethod[]>(MOCK_PAYMENT_METHODS);
    const [showAddModal, setShowAddModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null);

    const existingTypes = methods.map((m) => m.type);

    const handleAdd = (type: PaymentMethodType) => {
        const labels: Record<PaymentMethodType, string> = {
            kakaopay: "카카오페이",
            tosspay: "토스페이",
            bank: "무통장입금",
        };
        const descriptions: Record<PaymentMethodType, string> = {
            kakaopay: "카카오 계정 연결됨",
            tosspay: "토스 계정 연결됨",
            bank: "가상계좌 발급 가능",
        };
        const newMethod: PaymentMethod = {
            id: `pm_${Date.now()}`,
            type,
            label: labels[type],
            description: descriptions[type],
            isDefault: methods.length === 0,
        };
        setMethods((prev) => [...prev, newMethod]);
    };

    const handleDelete = (id: string) => {
        setMethods((prev) => {
            const next = prev.filter((m) => m.id !== id);
            // 삭제된 게 기본 결제 수단이면 첫 번째를 기본으로 변경
            const wasDefault = prev.find((m) => m.id === id)?.isDefault;
            if (wasDefault && next.length > 0) {
                next[0] = { ...next[0], isDefault: true };
            }
            return next;
        });
        setDeleteTarget(null);
    };

    const handleSetDefault = (id: string) => {
        setMethods((prev) =>
            prev.map((m) => ({ ...m, isDefault: m.id === id }))
        );
    };

    return (
        <div className="min-h-screen bg-[#F5F5F5]">
            {/* ─── 상단 헤더 (breadcrumb) ─── */}
            <div className="sticky top-0 z-10 bg-white border-b border-[#F0F0F0]">
                <div className="max-w-[1200px] mx-auto px-4 h-12 flex items-center justify-end">
                    <nav className="flex items-center gap-1.5 text-xs text-[#9E9E9E]">
                        <button
                            type="button"
                            onClick={() => router.push("/my")}
                            className="hover:text-[#1A1A1A] transition-colors"
                        >
                            마이페이지
                        </button>
                        <span>&gt;</span>
                        <span className="text-[#1A1A1A] font-medium">결제 수단 관리</span>
                    </nav>
                </div>
            </div>

            {/* ─── 본문 ─── */}
            <div className="max-w-[1200px] mx-auto px-4 py-8">
                {/* 이전으로 돌아가기 */}
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="mb-8 text-[13px] font-medium text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors flex items-center gap-1"
                >
                    <ChevronLeft className="w-4 h-4" />
                    이전으로 돌아가기
                </button>

                {/* 페이지 타이틀 */}
                <div className="mb-6 ml-2">
                    <h1 className="flex items-baseline gap-3">
                        <span className="text-[32px] font-black tracking-tight text-[#1A1A1A]">결제 수단 관리</span>
                        <span className="text-[15px] font-medium text-[#9E9E9E]">총 {methods.length}개</span>
                    </h1>
                    <p className="mt-1 text-[13px] text-[#9E9E9E]">결제 시 사용할 수단을 관리하세요</p>
                </div>

                {/* 결제 수단 목록 */}
                <div className="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden mb-4">
                    {methods.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                            <div className="w-14 h-14 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-4">
                                <CreditCard className="w-7 h-7 text-[#ADADAD]" />
                            </div>
                            <p className="text-[15px] font-semibold text-[#5A5A5A] mb-1">등록된 결제 수단이 없어요</p>
                            <p className="text-[13px] text-[#ADADAD]">아래 버튼을 눌러 결제 수단을 추가해보세요</p>
                        </div>
                    ) : (
                        <ul>
                            {methods.map((method, idx) => (
                                <li
                                    key={method.id}
                                    className={cn(
                                        "flex items-center gap-4 px-5 py-4",
                                        idx !== 0 && "border-t border-[#F0F0F0]"
                                    )}
                                >
                                    {/* 아이콘 */}
                                    <PaymentIcon type={method.type} size={44} />

                                    {/* 텍스트 */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-[15px] font-bold text-[#1A1A1A]">
                                                {method.label}
                                            </span>
                                            {method.isDefault && (
                                                <span className="inline-flex items-center gap-1 bg-[var(--foundation-primary-50)] text-[var(--foundation-primary-600)] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[var(--foundation-primary-200)]">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    기본
                                                </span>
                                            )}
                                        </div>
                                        {method.description && <p className="text-[13px] text-[#9E9E9E]">{method.description}</p>}
                                    </div>

                                    {/* 액션 */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {!method.isDefault && (
                                            <button
                                                type="button"
                                                onClick={() => handleSetDefault(method.id)}
                                                className="text-[12px] font-medium text-[#7A7A7A] hover:text-[var(--foundation-primary-600)] transition-colors px-3 py-1.5 rounded-lg border border-[#E8E8E8] hover:border-[var(--foundation-primary-300)] whitespace-nowrap"
                                            >
                                                기본으로 설정
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setDeleteTarget(method)}
                                            className="p-2 rounded-lg text-[#ADADAD] hover:text-[var(--foundation-red-500)] hover:bg-[var(--foundation-red-50)] transition-colors"
                                            aria-label="삭제"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* 결제 수단 추가 버튼 */}
                <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed border-[#D6D6D6] text-[#9E9E9E] hover:border-[var(--foundation-primary-400)] hover:text-[var(--foundation-primary-600)] hover:bg-[var(--foundation-primary-50)] transition-colors font-semibold text-sm"
                >
                    <Plus className="w-4 h-4" />
                    결제 수단 추가
                </button>

                {/* 안내 */}
                <div className="mt-6 bg-[#FAFAFA] rounded-xl border border-[#F0F0F0] px-5 py-4">
                    <p className="text-[12px] font-bold text-[#5A5A5A] mb-2">결제 수단 안내</p>
                    <ul className="space-y-1">
                        {[
                            "기본 결제 수단은 예매 시 자동으로 선택됩니다.",
                            "카카오페이, 토스페이는 승인 즉시 결제가 완료됩니다.",
                            "무통장입금은 가상계좌 발급 후 지정 기한 내 입금해야 예매가 확정됩니다.",
                            "결제 수단은 최대 3개까지 등록 가능합니다.",
                        ].map((text) => (
                            <li key={text} className="flex items-start gap-1.5 text-[12px] text-[#9E9E9E]">
                                <span className="mt-[5px] w-1 h-1 rounded-full bg-[#ADADAD] flex-shrink-0" />
                                {text}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* 모달 */}
            {showAddModal && (
                <AddPaymentModal
                    onClose={() => setShowAddModal(false)}
                    onAdd={handleAdd}
                    existingTypes={existingTypes}
                />
            )}
            {deleteTarget && (
                <DeleteConfirmModal
                    method={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={() => handleDelete(deleteTarget.id)}
                />
            )}
        </div>
    );
}
