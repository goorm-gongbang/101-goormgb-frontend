"use client";

/* ===========================
   마이페이지 레이아웃 컴포넌트
   - 구성: 프로필 요약 (닉네임, 소지 뱃지, 하위 링크), 메뉴 섹션 (티켓/일반), 하단 (로그아웃/탈퇴)
   - 서브페이지 렌더링: children이 존재할 경우 하단에 별도 카드로 표시 (현재 preferences, profile 등)

   [TODO] API 연동 시
   1. MOCK_USER 데이터 → useAuthStore 유저 정보 및 프로필 API 연동
   2. SECTIONS 내 껍데기 링크들 구현 (공지사항, FAQ 등)
   3. 로그인 상태 체크 (Unauthorized 시 /login 리다이렉트)
   4. 프로필 이미지 업로드 기능 추가
=========================== */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { getMyPageProfile, logout as logoutApi } from "@/lib/services";
import type { MyPageProfileData } from "@/lib/types";
import { DeleteAccountModal } from "./DeleteAccountModal";


/* ===========================
   타입
=========================== */
type LinkItem = {
    label: string;
    href: string;
};

type Section = {
    title: string;
    items: LinkItem[];
};

/* ===========================
   섹션 데이터
=========================== */
const SECTIONS: Section[] = [
    {
        title: "티켓 관리",
        items: [
            { label: "경기 예정 티켓", href: "/my/tickets" },
            { label: "예매 내역", href: "/my/reservations" },
        ],
    },
    {
        title: "일반",
        items: [
            { label: "공지사항", href: "/notices" },
            { label: "FAQ", href: "/faq" },
            { label: "1:1 문의", href: "/my/support" },
            { label: "이용약관", href: "/terms" },
            { label: "취소·환불 정책", href: "/refund" },
            { label: "개인정보 처리방침", href: "/privacy" },
        ],
    },
];

/* ===========================
   Props
=========================== */
type Props = {
    children?: React.ReactNode;
};

/* ===========================
   컴포넌트
=========================== */
export function MyPageLayout({ children }: Props) {
    const router = useRouter();
    const pathname = usePathname();

    const bootstrapped = useAuthStore((s) => s.bootstrapped);
    const accessToken = useAuthStore((s) => s.accessToken);
    const user = useAuthStore((s) => s.user);
    const logoutStore = useAuthStore((s) => s.logout);

    const isLoggedIn = bootstrapped && !!accessToken && !!user;

    const [profileData, setProfileData] = useState<MyPageProfileData | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        if (isLoggedIn) {
            getMyPageProfile().then(setProfileData).catch(() => {});
        }
    }, [isLoggedIn]);

    // 로그아웃
    const handleLogout = async () => {
        try {
            await logoutApi();
        } catch (e) {
            console.error("logout failed:", e);
        } finally {
            logoutStore();
            router.replace("/");
        }
    };

    // 로딩 중
    if (!bootstrapped) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
                <div className="w-8 h-8 rounded-full border-4 border-[var(--foundation-primary-500)] border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!isLoggedIn) return null;

    const nickname = profileData?.profile.nickname ?? "";
    const profileImageUrl = profileData?.profile.profileImageUrl ?? "";
    const snsProvider = profileData?.profile.snsProvider ?? "";
    const initial = nickname.charAt(0);

    return (
        <div className="min-h-screen bg-[#F5F5F5]">
            <div className="max-w-[1200px] mx-auto px-4 py-5 flex flex-col gap-3">

                {/* ─────────────────────────────────────
          프로필 카드
      ───────────────────────────────────── */}
                <div className="bg-white rounded-xl border border-[#E8E8E8] px-5 py-5">
                    <div className="flex items-center gap-4">

                        {/* 프로필 이미지 */}
                        {profileImageUrl ? (
                            <img
                                src={profileImageUrl}
                                alt="프로필"
                                className="w-[60px] h-[60px] rounded-full object-cover flex-shrink-0"
                            />
                        ) : (
                            <div
                                className="w-[60px] h-[60px] rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                                style={{ background: "var(--foundation-primary-500)" }}
                            >
                                {initial}
                            </div>
                        )}

                        {/* 닉네임 + 뱃지 + 하위 링크 */}
                        <div className="flex flex-col gap-1.5">
                            {/* 닉네임 + 소셜 뱃지 */}
                            <div className="flex items-center gap-2">
                                <span className="text-[#1A1A1A] text-[17px] font-bold leading-6">
                                    {nickname}
                                </span>
                                {snsProvider && (
                                    <span className="inline-flex items-center gap-1 bg-[#FEE500] text-[#000000] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                        {snsProvider.toUpperCase()}
                                    </span>
                                )}
                            </div>

                            {/* 하위 링크 */}
                            <div className="flex items-center gap-0 text-[#999999] text-xs font-normal">
                                <Link
                                    href="/my/profile"
                                    className="hover:text-[#555] transition-colors"
                                >
                                    개인정보 수정
                                </Link>
                                <span className="mx-2 text-[#D6D6D6]">|</span>
                                <Link
                                    href="/my/preferences"
                                    className="hover:text-[#555] transition-colors"
                                >
                                    선호 데이터 수정
                                </Link>
                                <span className="mx-2 text-[#D6D6D6]">|</span>
                                <Link
                                    href="/my/payments"
                                    className="hover:text-[#555] transition-colors"
                                >
                                    결제수단 관리
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─────────────────────────────────────
          섹션 카드들
      ───────────────────────────────────── */}
                {SECTIONS.map((section) => (
                    <div
                        key={section.title}
                        className="bg-white rounded-xl border border-[#E8E8E8] px-5 py-4"
                    >
                        {/* 섹션 제목 */}
                        <h2 className="text-[#1A1A1A] text-sm font-bold mb-3">
                            {section.title}
                        </h2>

                        {/* 메뉴 항목 */}
                        <ul>
                            {section.items.map((item, idx) => {
                                const isActive =
                                    pathname === item.href || pathname.startsWith(item.href + "/");

                                return (
                                    <li
                                        key={item.label}
                                        className={cn(
                                            idx !== 0 && "border-t border-[#F0F0F0]"
                                        )}
                                    >
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "flex items-center justify-between py-3 transition-colors",
                                                isActive
                                                    ? "text-[var(--foundation-primary-600)]"
                                                    : "text-[#3D3D3D] hover:text-[#1A1A1A]"
                                            )}
                                        >
                                            <span className="text-sm font-normal leading-6">
                                                {item.label}
                                            </span>
                                            <ChevronRight
                                                className={cn(
                                                    "w-4 h-4 flex-shrink-0",
                                                    isActive
                                                        ? "text-[var(--foundation-primary-500)]"
                                                        : "text-[#ADADAD]"
                                                )}
                                            />
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}

                {/* ─────────────────────────────────────
          로그아웃 / 회원 탈퇴 카드
      ───────────────────────────────────── */}
                <div className="bg-white rounded-xl border border-[#E8E8E8] px-5 py-1">
                    {/* 로그아웃 */}
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center py-3.5 border-b border-[#F0F0F0] text-[#3D3D3D] text-sm font-normal hover:text-[#1A1A1A] transition-colors"
                    >
                        로그아웃
                    </button>

                    {/* 회원 탈퇴 */}
                    <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        className="w-full flex items-center py-3.5 text-[var(--foundation-red-500)] text-sm font-normal hover:opacity-80 transition-opacity"
                    >
                        회원 탈퇴
                    </button>
                </div>

                {/* children (서브 페이지용) */}
                {children && (
                    <div className="bg-white rounded-xl border border-[#E8E8E8]">
                        {children}
                    </div>
                )}
            </div>

            {/* 회원 탈퇴 모달 */}
            <DeleteAccountModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onDeleteSuccess={() => {
                    logoutStore();
                    router.replace("/");
                }}
            />
        </div>
    );
}
