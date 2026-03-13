"use client";

/* ===========================
   개인정보 수정 페이지
   Route: /my/profile
   - 브레드크럼: 마이페이지 > 개인정보 수정
   - Preferences 페이지와 동일한 레이아웃 구성
   - 이전으로 돌아가기 버튼 포함

   [TODO] API 연동 시
   - ProfileEditForm 내 mock 데이터 → 유저 실제 정보로 교체
   - 닉네임 수정 시 PATCH /api/users/me 호출
   - 이메일은 카카오 연동 정보이므로 수정 불가 유지
=========================== */

import { useRouter } from "next/navigation";
import { ProfileEditForm } from "@/components/my/ProfileEditForm";

export default function ProfileEditPage() {
    const router = useRouter();

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
                        <span className="text-[#1A1A1A] font-medium">개인정보 수정</span>
                    </nav>
                </div>
            </div>

            {/* ─── 본문 ─── */}
            <div className="max-w-[1200px] mx-auto px-4 py-5">
                {/* 이전으로 돌아가기 */}
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="mb-4 text-sm text-[#9E9E9E] hover:text-[#1A1A1A] transition-colors"
                >
                    ← 이전으로 돌아가기
                </button>

                <ProfileEditForm />
            </div>
        </div>
    );
}
