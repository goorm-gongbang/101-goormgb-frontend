"use client";

import { useState, ReactNode } from "react";
import { ChevronDown, ChevronUp, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { getInquiryDetail } from "@/lib/services";
import type { InquiryDetail } from "@/lib/types";

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
    const [detail, setDetail] = useState<InquiryDetail | null>(null);
    const [isFetching, setIsFetching] = useState(false);

    const handleToggle = async () => {
        const next = !isExpanded;
        setIsExpanded(next);

        if (next && !detail) {
            setIsFetching(true);
            try {
                const data = await getInquiryDetail(item.id);
                setDetail(data);
            } catch {
                // toast는 getInquiryDetail 내부에서 처리
            } finally {
                setIsFetching(false);
            }
        }
    };

    const displayCategory = detail?.category ?? item.category;
    const displayContent = detail?.content ?? item.description;

    return (
        <div className={cn("bg-white", !isLast && "border-b border-[#F1F3F5]")}>
            <button
                type="button"
                onClick={handleToggle}
                className={cn(
                    "w-full flex items-center justify-between px-3 py-5 text-left hover:bg-gray-50/50 transition-colors group",
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
                    {isFetching ? (
                        <div className="py-6 text-center text-[14px] text-[#ADB5BD]">불러오는 중...</div>
                    ) : (
                        <>
                            {/* 문의 내용 (Question) */}
                            <div className="mb-6 px-2">
                                <div className="text-[13px] font-bold text-[var(--foundation-primary-500)] mb-1">
                                    [{displayCategory}]
                                </div>
                                <p className="text-[15px] font-medium text-[#333333] leading-relaxed whitespace-pre-wrap">
                                    {displayContent}
                                </p>
                            </div>

                            {/* 첨부파일 다운로드 버튼 */}
                            {detail?.fileAttached && detail.downloadUrl && (
                                <div className="mb-4 px-2">
                                    <a
                                        href={detail.downloadUrl}
                                        download
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#DEE2E6] text-[13px] font-medium text-[#495057] hover:bg-[#F8F9FA] transition-colors"
                                    >
                                        <Paperclip className="w-4 h-4" />
                                        첨부파일 다운로드
                                    </a>
                                </div>
                            )}

                            {/* 답변 내용 (Answer Box) */}
                            {item.answer && (
                                <div className="bg-[#F8F9FA] rounded-[12px] p-8 text-[15px] leading-relaxed text-[#495057] font-medium">
                                    {item.answer}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
