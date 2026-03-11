"use client";
import { useState } from "react";
import Link from "next/link";
import { Check, ExternalLink } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "@/components/common/Button";
import { RefundPolicyModal } from "@/components/common/RefundPolicyModal";

const stadiumAddress = "서울 송파구 올림픽로 19-2 서울종합운동장";


export default function BankAccountPage() {
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
    const naverMapUrl = `https://map.naver.com/p/search/${encodeURIComponent(stadiumAddress)}`;

    return (
        <div className="min-h-screen bg-[var(--foundation-neutral-980)] px-4 py-8">
            <div className="mx-auto flex w-full max-w-[1060px] flex-col gap-5">
                <div className="flex flex-col gap-5 rounded-[10px] bg-white px-6 py-8 md:px-12">
                    <div className="flex flex-col items-center gap-2 py-4 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-[var(--foundation-primary-500)] text-[var(--foundation-primary-500)]">
                                <Check className="h-5 w-5" strokeWidth={2.5} />
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-0.5">
                            <div className="text-2xl font-semibold leading-8 text-[var(--foundation-primary-600)]">
                                예약된 티켓 확정을 위해 기한 내 결제를 완료해주세요.
                            </div>
                            <div className="text-sm font-semibold leading-5 text-[var(--foundation-neutral-600)]">
                                입금 기한 내 입금이 완료되지 않을 시, 예매된 티켓이 취소됩니다.
                            </div>
                        </div>
                    </div>

                    <section className="flex flex-col gap-2">
                        <div className="px-3 text-xl font-bold leading-7 text-[var(--foundation-neutral-240)]">
                            입금 안내 정보
                        </div>

                        <div className="flex flex-col gap-4 rounded-[10px] border border-[var(--foundation-primary-500)] bg-white p-6">
                            <div className="flex items-center gap-6">
                                <div className="text-lg font-medium leading-6 text-[var(--foundation-neutral-600)]">
                                    입금 기한
                                </div>
                                <div className="flex-1 text-lg font-semibold leading-6 text-[var(--foundation-neutral-240)]">
                                    2026년 3월 24일 (화) 23:59
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-lg font-medium leading-6 text-[var(--foundation-neutral-600)]">
                                    입금 계좌
                                </div>
                                <div className="flex-1 text-lg font-semibold leading-6 text-[var(--foundation-neutral-240)]">
                                    국민 000-0000-0000-00
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="w-16 text-lg font-medium leading-6 text-[var(--foundation-neutral-600)]">
                                    예금주
                                </div>
                                <div className="flex-1 text-lg font-semibold leading-6 text-[var(--foundation-neutral-240)]">
                                    윤정빈
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="flex flex-col gap-2">
                        <div className="px-3 text-xl font-bold leading-7 text-[var(--foundation-neutral-240)]">
                            경기 정보
                        </div>

                        <div className="flex flex-col gap-4 rounded-[10px] border border-[var(--foundation-neutral-940)] bg-white p-6">
                            <div className="flex flex-col gap-2 md:flex-row md:gap-6">
                                <div className="w-20 text-base font-medium leading-6 text-[var(--foundation-neutral-600)]">
                                    경기 장소
                                </div>

                                <div className="flex-1">
                                    <div className="text-base font-semibold leading-6 text-[var(--foundation-neutral-240)]">
                                        잠실종합운동장 잠실야구장
                                    </div>

                                    <a
                                        href={naverMapUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-0.5 inline-flex items-center gap-1 text-xs leading-4 text-[var(--foundation-neutral-600)]"
                                    >
                                        <span className="underline">{stadiumAddress}</span>
                                        <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="w-20 text-base font-medium leading-6 text-[var(--foundation-neutral-600)]">
                                    경기 시간
                                </div>
                                <div className="flex-1 text-base font-semibold leading-6 text-[var(--foundation-neutral-240)]">
                                    2026년 3월 29일 (일) 14:00
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 md:flex-row md:gap-6">
                                <div className="w-20 text-base font-medium leading-6 text-[var(--foundation-neutral-600)]">
                                    선택 좌석
                                </div>
                                <div className="flex-1">
                                    <div className="text-base font-semibold leading-6 text-[var(--foundation-blue-600)]">
                                        오렌지석 206블럭 3열 13번
                                    </div>
                                    <div className="text-base font-semibold leading-6 text-[var(--foundation-blue-600)]">
                                        오렌지석 206블럭 3열 14번
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="flex flex-col gap-2">
                        <div className="px-3 text-xl font-bold leading-7 text-[var(--foundation-neutral-240)]">
                            결제 금액
                        </div>

                        <div className="flex flex-col gap-4 rounded-[10px] border border-[var(--foundation-neutral-940)] bg-white p-6">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="text-lg font-semibold leading-6 text-[var(--foundation-primary-600)]">
                                        총 결제 금액
                                    </div>
                                    <div className="text-lg font-semibold leading-6 text-[var(--foundation-primary-600)]">
                                        42,000 원
                                    </div>
                                </div>

                                <div className="h-px bg-[var(--stroke-interactive-neutral-default)]" />

                                <div className="flex flex-col gap-0.5">
                                    <div className="flex justify-between">
                                        <div className="text-sm font-medium leading-5 text-[var(--foundation-neutral-240)]">
                                            티켓 금액
                                        </div>
                                        <div className="text-sm font-medium leading-5 text-[var(--foundation-neutral-240)]">
                                            40,000 원
                                        </div>
                                    </div>

                                    <div className="flex justify-between">
                                        <div className="text-sm font-medium leading-5 text-[var(--foundation-neutral-240)]">
                                            수수료
                                        </div>
                                        <div className="text-sm font-medium leading-5 text-[var(--foundation-neutral-240)]">
                                            2,000 원
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 text-sm font-medium text-[var(--foundation-neutral-600)]">취소 기한</div>
                                    <div className="flex-1 text-sm font-medium text-[var(--foundation-neutral-240)]">
                                        2026년 2월 11일 (수) 23:59
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
