"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQ_DATA = [
    {
        id: 1,
        question: "Q1. 예매한 티켓을 취소하고 싶어요. 어떻게 하나요?",
        answer: "마이페이지 > 예매 내역에서 취소할 티켓을 선택한 후 '취소 신청' 버튼을 누르시면 됩니다. 취소 수수료는 경기 7일 전까지는 무료이며, 6일 이내부터는 티켓 금액의 10%가 부과됩니다. 환불은 결제 수단에 따라 영업일 기준 1~5일 내 처리됩니다."
    },
    {
        id: 2,
        question: "Q2. 결제는 됐는데 티켓이 발급되지 않았어요.",
        answer: "결제 완료 후 네트워크 지연으로 티켓 발급이 늦어지는 경우가 있습니다. 마이페이지 > 예매 내역에서 5분 후 다시 확인해 주세요. 그래도 티켓이 보이지 않는다면 1:1 문의로 결제 내역 스크린샷과 함께 접수해 주시면 빠르게 처리해 드리겠습니다."
    },
    {
        id: 3,
        question: "Q3. 한 번에 몇 장까지 예매할 수 있나요?",
        answer: "1인당 동일 경기 기준 최대 4매까지 예매 가능합니다. 단, 구단 및 경기 특성에 따라 매수 제한이 달라질 수 있으며, 예매 화면에서 미리 확인하실 수 있습니다."
    },
    {
        id: 4,
        question: "Q4. 우천 취소된 경기는 어떻게 환불받나요?",
        answer: "경기가 공식 취소되면 별도 신청 없이 자동으로 전액 환불 처리됩니다. 환불은 결제 수단에 따라 영업일 기준 1~5일 내 완료되며, 취소 수수료는 발생하지 않습니다. 처리 완료 시 앱 푸시 알림과 이메일로 안내해 드립니다."
    }
];

function FAQItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className={cn(
                "bg-white rounded-2xl border transition-all duration-200 overflow-hidden",
                isOpen ? "border-[#00D1B2]" : "border-[#E8E8E8]"
            )}
        >
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-[88px] px-8 flex items-center justify-between text-left"
            >
                <span className="text-[17px] font-bold text-[#1A1A1A]">{question}</span>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-[#ADADAD]" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-[#ADADAD]" />
                )}
            </button>

            {isOpen && (
                <div className="px-8 pb-8 pt-0">
                    <p className="text-[15px] leading-[26px] text-[#3D3D3D] whitespace-pre-wrap">
                        {answer}
                    </p>
                </div>
            )}
        </div>
    );
}

export default function FAQPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#F5F5F5]">
            <div className="max-w-[1200px] mx-auto px-4 py-8">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="mb-8 text-[13px] font-medium text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors flex items-center gap-1"
                >
                    <ChevronLeft className="w-4 h-4" />
                    이전으로 돌아가기
                </button>

                <div className="mb-8 ml-2">
                    <h1 className="flex items-baseline gap-3">
                        <span className="text-[24px] font-bold text-[#1A1A1A]">FAQ</span>
                        <span className="text-[15px] font-medium text-[#9E9E9E]">자주 묻는 질문</span>
                    </h1>
                </div>

                <div className="flex flex-col gap-4">
                    {FAQ_DATA.map((item) => (
                        <FAQItem key={item.id} question={item.question} answer={item.answer} />
                    ))}
                </div>
            </div>
        </div>
    );
}
