"use client";
import { useState } from "react";
import Link from "next/link";
import { Check, ExternalLink } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { RefundPolicyModal } from "@/components/common/RefundPolicyModal";
import { PrimaryButton, SecondaryButton } from "@/components/common/Button";

const paymentMethodLabel: Record<string, string> = {
    BANK_TRANSFER: "무통장 입금 사용",
    TOSS_PAY: "토스페이 사용",
    KAKAO_PAY: "카카오페이 사용",
};

export default function PaymentCompletePage() {
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

    const searchParams = useSearchParams();

    const paymentMethod = searchParams.get("paymentMethod") ?? "TOSS_PAY";
    const paymentStatus = searchParams.get("paymentStatus") ?? "";
    const paidAt = searchParams.get("paidAt") ?? "";

    const bank = searchParams.get("bank") ?? "";
    const accountNumber = searchParams.get("accountNumber") ?? "";
    const holder = searchParams.get("holder") ?? "";
    const depositDeadline = searchParams.get("depositDeadline") ?? "";

    const stadiumName = searchParams.get("stadiumName") ?? "";
    const stadiumAddress = searchParams.get("stadiumAddress") ?? "";
    const matchAt = searchParams.get("matchAt") ?? "";
    const totalAmount = Number(searchParams.get("totalAmount") ?? "0");
    const fee = Number(searchParams.get("fee") ?? "0");

    const seatRows = JSON.parse(searchParams.get("seatLabels") ?? "[]") as Array<{
        label: string;
        price: number;
    }>;

    const naverMapUrl = `https://map.naver.com/p/search/${encodeURIComponent(stadiumAddress)}`;

    const formatMatchAt = (value?: string) => {
        if (!value) return "-";
        const date = new Date(value);
        return new Intl.DateTimeFormat("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "short",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        }).format(date);
    };

    const formatCancelDeadline = (value?: string) => {
        if (!value) return "-";

        const matchDate = new Date(value);
        if (Number.isNaN(matchDate.getTime())) return "-";

        const cancelDeadline = new Date(matchDate);
        cancelDeadline.setDate(cancelDeadline.getDate() - 1);
        cancelDeadline.setHours(23, 59, 0, 0);

        return new Intl.DateTimeFormat("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "short",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Asia/Seoul",
        }).format(cancelDeadline);
    };

    const won = (n: number) => `${n.toLocaleString("ko-KR")} 원`;

    return (
        <div className="min-h-screen bg-[var(--foundation-neutral-980)] px-4 py-8 md:px-10">
            <div className="mx-auto w-full max-w-[1060px] rounded-[10px] bg-white px-6 py-8 md:px-12">
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col items-center gap-2 py-4 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-[var(--foundation-primary-500)] text-[var(--foundation-primary-500)]">
                                <Check className="h-5 w-5" strokeWidth={2.5} />
                            </div>
                        </div>

                        <div>
                            <div className="text-2xl font-semibold leading-8 text-[var(--foundation-primary-600)]">
                                티켓 결제가 완료되었어요!
                            </div>
                            <div className="text-sm font-semibold leading-5 text-[var(--foundation-neutral-600)]">
                                확정된 티켓을 내 티켓에서 확인해보세요!
                            </div>
                        </div>
                    </div>

                    <section>
                        <div className="px-3 pb-2 text-xl font-bold leading-7 text-[var(--foundation-neutral-240)]">
                            결제 정보
                        </div>
                        <div className="flex flex-col gap-4 rounded-[10px] border border-[var(--foundation-neutral-940)] p-6">
                            <div className="flex items-center gap-6">
                                <div className="w-20 text-base font-medium text-[var(--foundation-neutral-600)]">결제 일시</div>
                                <div className="flex-1 text-base font-medium text-[var(--foundation-neutral-240)]">
                                    {formatMatchAt(paidAt)}
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="w-20 text-base font-medium text-[var(--foundation-neutral-600)]">결제 수단</div>
                                <div className="flex-1 text-base font-medium text-[var(--foundation-neutral-240)]">
                                    {paymentMethodLabel[paymentMethod] ?? "토스페이 사용"}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="px-3 pb-2 text-xl font-bold leading-7 text-[var(--foundation-neutral-240)]">
                            경기 정보
                        </div>
                        <div className="flex flex-col gap-4 rounded-[10px] border border-[var(--foundation-neutral-940)] p-6">
                            <div className="flex flex-col gap-2 md:flex-row md:gap-6">
                                <div className="w-20 text-base font-medium text-[var(--foundation-neutral-600)]">경기 장소</div>
                                <div className="flex-1">
                                    <div className="text-base font-semibold text-[var(--foundation-neutral-240)]">
                                        {stadiumName || "-"}
                                    </div>
                                    <a
                                        href={naverMapUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-0.5 inline-flex items-center gap-1 text-xs text-[var(--foundation-neutral-600)]"
                                    >
                                        <span className="underline">{stadiumAddress || "-"}</span>
                                        <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="w-20 text-base font-medium text-[var(--foundation-neutral-600)]">경기 시간</div>
                                <div className="flex-1 text-base font-semibold text-[var(--foundation-neutral-240)]">
                                    {formatMatchAt(matchAt)}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 md:flex-row md:gap-6">
                                <div className="w-20 text-base font-medium text-[var(--foundation-neutral-600)]">선택 좌석</div>
                                <div className="flex-1">
                                    {seatRows.map((seat) => (
                                        <div
                                            key={seat.label}
                                            className="text-base font-semibold text-[var(--foundation-blue-600)]"
                                        >
                                            {seat.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="px-3 pb-2 text-xl font-bold leading-7 text-[var(--foundation-neutral-240)]">
                            결제 금액
                        </div>
                        <div className="flex flex-col gap-4 rounded-[10px] border border-[var(--foundation-neutral-940)] p-6">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="text-lg font-semibold text-[var(--foundation-primary-600)]">
                                        총 결제 금액
                                    </div>
                                    <div className="text-lg font-semibold text-[var(--foundation-primary-600)]">
                                        {won(totalAmount) || 0}
                                    </div>
                                </div>

                                <div className="h-px bg-[var(--stroke-interactive-neutral-default)]" />

                                <div className="flex flex-col gap-0.5">
                                    {seatRows.map((seat) => (
                                        <div key={seat.label} className="flex justify-between gap-4">
                                            <div className="text-sm font-medium text-[var(--foundation-neutral-240)]">
                                                {seat.label || "-"}
                                            </div>
                                            <div className="text-sm font-medium text-[var(--foundation-neutral-240)]">
                                                1개
                                            </div>
                                        </div>
                                    ))}

                                    <div className="flex justify-between gap-4">
                                        <div className="text-sm font-medium text-[var(--foundation-neutral-240)]">수수료</div>
                                        <div className="text-sm font-medium text-[var(--foundation-neutral-240)]">{fee.toLocaleString() || "0"} 원</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 text-sm font-medium text-[var(--foundation-neutral-600)]">취소 기한</div>
                                    <div className="flex-1 text-sm font-medium text-[var(--foundation-neutral-240)]">
                                        {formatCancelDeadline(matchAt)}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 md:flex-row md:gap-6">
                                    <div className="w-20 text-sm font-medium text-[var(--foundation-neutral-600)]">취소 수수료</div>
                                    <div className="flex-1 text-sm font-medium text-[var(--foundation-neutral-240)]">
                                        티켓 금액의 0~10%
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsRefundModalOpen(true)}
                                        className="cursor-pointer h-6 min-w-14 rounded-md border border-[var(--foundation-primary-500)] px-2 text-xs text-[var(--foundation-primary-500)]"
                                    >
                                        자세히보기
                                    </button>
                                    <RefundPolicyModal
                                        open={isRefundModalOpen}
                                        onClose={() => setIsRefundModalOpen(false)}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="flex flex-col gap-2 md:flex-row">
                        <Link className="flex flex-1 h-10" href="/">
                            <SecondaryButton
                                size="md"
                                tone="base"
                                className="flex flex-1 h-10"
                            >
                                홈으로
                            </SecondaryButton>
                        </Link>

                        <Link className="flex flex-1 h-10" href="/my/tickets">
                            <PrimaryButton
                                size="lg"
                                tone="base"
                                className="flex flex-1 h-10"
                            >
                                내 티켓으로 가기
                            </PrimaryButton>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
