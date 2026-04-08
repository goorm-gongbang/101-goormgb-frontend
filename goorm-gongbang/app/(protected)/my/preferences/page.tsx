"use client";

/* ===========================
   선호 데이터 수정 페이지 (독립 페이지)
   Route: /my/preferences
   - 상단: 브레드크럼 헤더 (마이페이지 > 내 선호 데이터 수정)
   - 본문: PreferenceForm (max-w-[1200px] 중앙 정렬)
   - 이전으로 돌아가기 버튼 포함

   [TODO] API 연동 시
   - PreferenceForm 내 mock 초기값 → 유저 저장 데이터로 교체
   - 저장 시 → 실제 API 호출
   - PreferenceForm.tsx 상단 주석의 통합 작업 목록 참고
=========================== */

import { useRouter } from "next/navigation";
import { PreferenceForm } from "@/components/my/PreferenceForm";

export default function PreferencesPage() {
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
                        <span className="text-[#1A1A1A] font-medium">내 선호 데이터 수정</span>
                    </nav>
                </div>
            </div>

            {/* ─── 본문 (max-w 중앙 정렬) ─── */}
            <div className="max-w-[1200px] mx-auto px-4 py-5">
                <PreferenceForm />
            </div>
        </div>
    );
}
