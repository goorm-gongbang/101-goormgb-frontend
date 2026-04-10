"use client";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="w-full bg-[var(--background-grey)] px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-[120px] py-12 lg:py-20">
            <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
                <div className="flex flex-col justify-start gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-9">
                    <div className="flex flex-1 flex-col gap-8 lg:flex-row lg:items-start lg:gap-9">
                        <div className="opacity-90 flex items-end gap-10">
                            <div className="flex h-28 w-40 items-center p-2">
                                <div className="h-full w-36" />
                                <img src="/logo.png" alt="logo" />
                            </div>
                        </div>

                        <div className="flex max-w-[420px] flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <div className="text-sm font-semibold leading-5 text-[var(--foundation-neutral-520)]">
                                    플레이볼 사업자 정보
                                </div>

                                <div className="flex flex-col gap-1">
                                    <div className="text-sm font-normal leading-5 text-[var(--foundation-neutral-520)]">
                                        상호명 : 플레이볼
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <div className="text-sm font-normal leading-5 text-[var(--foundation-neutral-520)]">
                                            사업자등록번호 : 000-00-00000
                                        </div>
                                        <a
                                            href=""
                                            className="cursor-pointer text-xs font-normal leading-4 text-[var(--foundation-primary-600)] underline"
                                        >
                                            사업자 정보 확인
                                        </a>
                                    </div>

                                    <div className="text-sm font-normal leading-5 text-[var(--foundation-neutral-520)]">
                                        통신판매업 신고번호 : 2026-플레이볼-0000
                                    </div>

                                    <div className="text-sm font-normal leading-5 text-[var(--foundation-neutral-520)]">
                                        사업장 소재지 : 서울특별시 00구
                                    </div>

                                    <div className="text-sm font-normal leading-5 text-[var(--foundation-neutral-520)]">
                                        운영시간 : 평일 10:00 - 17:00
                                        <br />
                                        점심시간 13:00 - 14:00
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8 lg:h-44 lg:gap-20">
                        <div className="flex flex-col gap-8 sm:flex-row sm:justify-end sm:gap-16">
                            <div className="flex flex-col gap-6">
                                <div className="text-base font-semibold leading-6 text-[var(--foundation-primary-500)]">
                                    바로 가기
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Link
                                        href="/"
                                        className="text-sm font-medium leading-5 text-[var(--foundation-neutral-200)] hover:underline"
                                    >
                                        홈
                                    </Link>
                                    <Link
                                        href="/"
                                        className="text-sm font-medium leading-5 text-[var(--foundation-neutral-200)] hover:underline"
                                    >
                                        마이페이지
                                    </Link>
                                    <Link
                                        href="/"
                                        className="text-sm font-medium leading-5 text-[var(--foundation-neutral-200)] hover:underline"
                                    >
                                        공지사항
                                    </Link>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="text-base font-semibold leading-6 text-[var(--foundation-primary-500)]">
                                    이용 안내
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Link
                                        href="/"
                                        className="text-sm font-medium leading-5 text-[var(--foundation-neutral-200)] hover:underline"
                                    >
                                        취소 환불 정책
                                    </Link>
                                    <Link
                                        href="/"
                                        className="text-sm font-medium leading-5 text-[var(--foundation-neutral-200)] hover:underline"
                                    >
                                        개인 정보 처리 방침
                                    </Link>
                                    <Link
                                        href="/"
                                        className="text-sm font-medium leading-5 text-[var(--foundation-neutral-200)] hover:underline"
                                    >
                                        이용약관
                                    </Link>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="text-base font-semibold leading-6 text-[var(--foundation-primary-500)]">
                                    고객센터
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Link
                                        href="/"
                                        className="text-sm font-medium leading-5 text-[var(--foundation-neutral-200)] hover:underline"
                                    >
                                        공지사항
                                    </Link>
                                    <Link
                                        href="/"
                                        className="text-sm font-medium leading-5 text-[var(--foundation-neutral-200)] hover:underline"
                                    >
                                        FAQ
                                    </Link>
                                    <Link
                                        href="/"
                                        className="text-sm font-medium leading-5 text-[var(--foundation-neutral-200)] hover:underline"
                                    >
                                        1:1 문의
                                    </Link>
                                    <Link
                                        href="/"
                                        className="text-sm font-medium leading-5 text-[var(--foundation-neutral-200)] hover:underline"
                                    >
                                        제휴/입점 문의
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px w-full bg-[var(--stroke-interactive-neutral-default)]" />

                <div className="flex flex-col gap-3 text-sm font-normal leading-5 text-[var(--text-info-n600)] sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-1">
                        <span>Copyright</span>
                        <span>©</span>
                        <span>2026 GRGB COMPANY - All rights reserved</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <span>support@playball.one</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
