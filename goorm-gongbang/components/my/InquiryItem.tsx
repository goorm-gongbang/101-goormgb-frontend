"use client";

import { useState, ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Inquiry {
    id: number;
    status: "COMPLETED" | "WAITING";
    statusLabel: string;
    category: string;
    title: string;
    description: string;
    date: string;
    answer: ReactNode;
}

interface InquiryItemProps {
    item: Inquiry;
    isLast: boolean;
}

export function InquiryItem({ item, isLast }: InquiryItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className={cn("bg-white", !isLast && "border-b border-[#F1F3F5]")}>
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                    "w-full flex items-center justify-between px-10 py-7 text-left hover:bg-gray-50/50 transition-colors group",
                )}
            >
                <div className="flex items-center gap-5 overflow-hidden">
                    {/* 상태 배지 */}
                    <span
                        className={cn(
                            "shrink-0 inline-flex items-center justify-center px-3 py-1.5 rounded-full border text-[12px] font-bold whitespace-nowrap",
                            item.status === "COMPLETED" 
                                ? "text-[var(--foundation-primary-500)] border-[var(--foundation-primary-500)]" 
                                : "text-[#999999] border-[#DEDEDE]"
                        )}
                    >
                        {item.statusLabel}
                    </span>

                    {/* 제목 & 날짜 */}
                    <div className="flex items-center gap-3 overflow-hidden">
                        <span className="text-[16px] font-bold text-[#333333] group-hover:text-[var(--foundation-primary-600)] transition-colors truncate">
                            {item.title}
                        </span>
                        <span className="shrink-0 text-[14px] font-medium text-[#ADB5BD]">
                            {item.date}
                        </span>
                    </div>
                </div>

                {/* 화살표 */}
                {isExpanded ? (
                    <ChevronUp className="shrink-0 w-5 h-5 text-[#CED4DA] group-hover:text-[#1A1A1A] transition-colors" />
                ) : (
                    <ChevronDown className="shrink-0 w-5 h-5 text-[#CED4DA] group-hover:text-[#1A1A1A] transition-colors" />
                )}
            </button>

            {/* 확대 영역: 문의 내용 + 답변 내용 */}
            {isExpanded && (
                <div className="px-10 pb-8 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* 문의 내용 (Question) */}
                    <div className="mb-6 px-2">
                        <div className="text-[13px] font-bold text-[var(--foundation-primary-500)] mb-1">
                            [{item.category}]
                        </div>
                        <p className="text-[15px] font-medium text-[#333333] leading-relaxed whitespace-pre-wrap">
                            {item.description}
                        </p>
                    </div>

                    {/* 답변 내용 (Answer Box) */}
                    {item.answer && (
                        <div className="bg-[#F8F9FA] rounded-[12px] p-8 text-[15px] leading-relaxed text-[#495057] font-medium">
                            {item.answer}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
