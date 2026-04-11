"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ActionButton } from "@/components/common/Button";
import { InquiryItem, Inquiry } from "@/components/my/InquiryItem";

/* ===========================
   API 연동 가이드 (GET /api/my/inquiries)
   - Method: GET
   - Endpoint: /api/v1/support/inquiries
   - Description: 사용자의 1:1 문의 내역 목록을 조회합니다.
   
   [Response 예시]
   {
     "success": true,
     "data": [
       {
         "id": number,
         "status": "WAITING" | "COMPLETED",
         "category": "예매/상품" | "결제/수수료" | ... ,
         "title": string,
         "description": string,
         "date": "YYYY.MM.DD",
         "answer": string | null
       }
     ]
   }
=========================== */

export default function SupportPage() {
    const router = useRouter();
    const pathname = usePathname();
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);

    const loadInquiries = useCallback(() => {
        const saved = localStorage.getItem("my-inquiries");
        const localInquiries = saved ? JSON.parse(saved) : [];
        setInquiries(localInquiries);
    }, []);

    useEffect(() => {
        loadInquiries();
    }, [loadInquiries, pathname]);

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            {/* ─── 상단 헤더 (breadcrumb) ─── */}
            <div className="sticky top-12 z-10 bg-white border-b border-[#F0F0F0]">
                <div className="max-w-[1240px] mx-auto px-6 h-12 flex items-center justify-end">
                    <nav className="flex items-center gap-1.5 text-xs text-[#999999]">
                        <button
                            type="button"
                            onClick={() => router.push("/my")}
                            className="hover:text-[#1A1A1A] transition-colors"
                        >
                            마이페이지
                        </button>
                        <span>&gt;</span>
                        <span className="text-[#1A1A1A] font-medium">1:1 문의</span>
                    </nav>
                </div>
            </div>

            {/* ─── 본문 ─── */}
            <div className="max-w-[1000px] mx-auto px-6 py-10">
                {/* 이전으로 돌아가기 */}
                <button
                    type="button"
                    onClick={() => router.push("/my")}
                    className="mb-8 text-[13px] font-medium text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors flex items-center gap-1"
                >
                    <ChevronLeft className="w-4 h-4" />
                    이전으로 돌아가기
                </button>

                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-[24px] font-bold text-[#1A1A1A]">1:1 문의</h1>
                    <ActionButton
                        onClick={() => router.push("/my/support/write")}
                        size="lg"
                    >
                        1:1 문의 작성
                    </ActionButton>
                </div>

                {/* 문의한 내용 섹션 */}
                <div className="flex flex-col gap-6">

                    <div className="bg-white rounded-xl border border-[#E9ECEF] overflow-hidden px-8 py-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-black text-xl font-semibold leading-8">문의한 내용</h3>
                        </div>
                        
                        {inquiries.length > 0 ? (
                            inquiries.map((item, idx) => (
                                <InquiryItem 
                                    key={item.id} 
                                    item={item} 
                                    isLast={idx === inquiries.length - 1} 
                                />
                            ))
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-[#999]">
                                <p className="text-[16px] font-medium">문의 내역이 없습니다.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
