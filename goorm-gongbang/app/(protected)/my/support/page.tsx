"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const MOCK_INQUIRIES: Inquiry[] = [
    {
        id: 1,
        status: "COMPLETED",
        statusLabel: "답변 완료",
        category: "결제/수수료",
        title: "무통장입금(가상계좌)은 이용 제한이 있나요?",
        description: "가상계좌 입금을 하려고 하는데, 혹시 미성년자나 특정 연령대에서 이용할 수 없는 제한이 있는지 궁금합니다.",
        date: "2026.02.09",
        answer: "무통장입금(가상계좌)는 19세 미만 고객에게만 제공됩니다."
    },
    {
        id: 2,
        status: "WAITING",
        statusLabel: "답변 대기",
        category: "예매/상품",
        title: "결제 중에 예매 정보를 변경할 수 있나요?",
        description: "좌석을 선택하고 결제 페이지로 넘어갔는데, 이 상태에서 인원수를 한 명 더 추가하거나 구역을 바꿀 수 있는 방법이 있을까요? 창을 닫으면 좌석이 풀릴까봐 걱정돼서 문의드립니다.",
        date: "2026.01.09",
        answer: (
            <div className="flex flex-col gap-4">
                <p>결제 단계로 넘어온 이후에는 선택한 예매 정보 변경이 어렵습니다.</p>
                <ul className="list-disc list-inside flex flex-col gap-1 text-[15px]">
                    <li>정보를 변경하려면 현재 창을 종료한 뒤 다시 예매해 주시기 바랍니다.</li>
                    <li>지정석의 경우, ‘취소 후 재예매’ 기능을 통해 가격을 변경하실 수 있습니다.</li>
                </ul>
                <p className="text-[#666] font-medium mt-1">※ 단, 취소 후 재예매 서비스는 상품에 따라 제공되지 않을 수 있습니다.</p>
            </div>
        )
    }
];

export default function SupportPage() {
    const router = useRouter();
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);

    useEffect(() => {
        // 로컬스토리지에서 새로 작성된 문의 가져오기
        const saved = localStorage.getItem("my-inquiries");
        const localInquiries = saved ? JSON.parse(saved) : [];
        
        // 기존 MOCK 데이터와 합치기
        setInquiries([...localInquiries, ...MOCK_INQUIRIES]);
    }, []);

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            {/* ─── 상단 헤더 (breadcrumb) ─── */}
            <div className="bg-white border-b border-[#F0F0F0]">
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

                <div className="mb-10 flex items-center justify-between">
                    <h1 className="text-[32px] font-extrabold tracking-tight text-[#1A1A1A]">1:1 문의</h1>
                </div>

                {/* 문의한 내용 섹션 */}
                <div className="flex flex-col gap-6">
                    <div 
                        onClick={() => router.push("/my/support/write")}
                        className="cursor-pointer self-stretch px-8 py-6 bg-[var(--background-white)] rounded-[20px] outline outline-1 outline-offset-[-1px] outline-[var(--stroke-interactive-neutral-default)] inline-flex flex-col justify-start items-start gap-4">
                        <div className="justify-start text-black text-xl font-semibold font-['Pretendard_Variable'] leading-8">1:1 문의작성</div>
                    </div>

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
