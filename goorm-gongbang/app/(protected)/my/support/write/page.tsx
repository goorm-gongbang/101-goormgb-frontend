"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

/* ===========================
   API 연동 가이드 (POST /api/my/inquiries)
   - Method: POST
   - Endpoint: /api/v1/support/inquiries
   - Description: 새 1:1 문의를 등록합니다.
   
   [Request Body]
   {
     "category": "예매/상품" | "결제/수수료" | "배송/반송" | "시스템 오류" | "기타",
     "title": string,
     "content": string
   }
   
   [Response]
   - 성공 시: 201 Created
   - 실패 시: 에러 메시지 반환
=========================== */

const INQUIRY_TYPES = ["예매/상품", "결제/수수료", "배송/반송", "시스템 오류", "기타"];

export default function SupportWritePage() {
    const router = useRouter();
    const [type, setType] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isTypeOpen, setIsTypeOpen] = useState(false);

    const handleSubmit = () => {
        if (!type || !title || !content) {
            toast.error("모든 항목을 입력해주세요.");
            return;
        }

        // 로컬스토리지에 저장하여 목록 페이지에서 확인할 수 있도록 함 (Mock persistence)
        const newInquiry = {
            id: Date.now(),
            status: "WAITING",
            statusLabel: "답변 대기",
            category: type,
            title: title,
            description: content,
            date: new Date().toLocaleDateString("ko-KR").replace(/\s/g, "").slice(0, -1), // "2024.03.26" 형식
            answer: null
        };

        const existing = localStorage.getItem("my-inquiries");
        const list = existing ? JSON.parse(existing) : [];
        list.unshift(newInquiry);
        localStorage.setItem("my-inquiries", JSON.stringify(list));

        toast.success("문의가 접수되었습니다.");
        router.push("/my/support");
    };

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
                        <button
                            type="button"
                            onClick={() => router.push("/my/support")}
                            className="hover:text-[#1A1A1A] transition-colors"
                        >
                            1:1 문의
                        </button>
                        <span>&gt;</span>
                        <span className="text-[#1A1A1A] font-medium">문의 작성</span>
                    </nav>
                </div>
            </div>

            {/* ─── 본문 ─── */}
            <div className="max-w-[800px] mx-auto px-6 py-10">
                <button
                    type="button"
                    onClick={() => router.push("/my/support")}
                    className="mb-8 text-[13px] font-medium text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors flex items-center gap-1"
                >
                    <ChevronLeft className="w-4 h-4" />
                    이전으로 돌아가기
                </button>

                <h1 className="text-[32px] font-extrabold tracking-tight text-[#1A1A1A] mb-10">1:1 문의 작성</h1>

                <div className="bg-white rounded-xl border border-[#E9ECEF] p-10 flex flex-col gap-8 shadow-sm">
                    {/* 문의 유형 */}
                    <div className="flex flex-col gap-3">
                        <Label className="text-[16px] font-bold text-[#333333] ml-1">문의 유형</Label>
                        <DropdownMenu open={isTypeOpen} onOpenChange={setIsTypeOpen}>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className={cn(
                                        "w-full h-14 rounded-[12px] px-5 flex items-center justify-between border transition-all text-left",
                                        isTypeOpen 
                                            ? "border-[var(--foundation-primary-500)] bg-[var(--foundation-primary-10)]" 
                                            : "border-[#E0E0E0] bg-white hover:border-[#CCCCCC]"
                                    )}
                                >
                                    <span className={cn(
                                        "text-[15px] font-medium",
                                        type ? "text-[#1A1A1A]" : "text-[#ADB5BD]"
                                    )}>
                                        {type ?? "문의 유형을 선택해주세요"}
                                    </span>
                                    <ChevronDown className={cn(
                                        "w-5 h-5 transition-transform",
                                        isTypeOpen ? "text-[var(--foundation-primary-500)] rotate-180" : "text-[#ADB5BD]"
                                    )} />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-[12px] p-2">
                                {INQUIRY_TYPES.map((t) => (
                                    <DropdownMenuItem 
                                        key={t} 
                                        onClick={() => setType(t)}
                                        className="h-12 rounded-[8px] px-4 font-medium cursor-pointer focus:bg-[var(--foundation-primary-10)] focus:text-[var(--foundation-primary-600)]"
                                    >
                                        {t}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* 제목 */}
                    <div className="flex flex-col gap-3">
                        <Label className="text-[16px] font-bold text-[#333333] ml-1">제목</Label>
                        <Input 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="제목을 입력해주세요"
                            className="h-14 rounded-[12px] border-[#E0E0E0] px-5 text-[15px] hover:border-[var(--foundation-primary-500)] focus-visible:ring-0 focus-visible:border-[var(--foundation-primary-500)] transition-all outline-none"
                        />
                    </div>

                    {/* 내용 */}
                    <div className="flex flex-col gap-3">
                        <Label className="text-[16px] font-bold text-[#333333] ml-1">내용</Label>
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="문의하실 내용을 상세히 입력해주세요"
                            className="min-h-[240px] rounded-[12px] border border-[#E0E0E0] p-5 text-[15px] hover:border-[var(--foundation-primary-500)] focus-visible:ring-0 focus-visible:border-[var(--foundation-primary-500)] focus-visible:outline-none transition-all resize-none leading-relaxed"
                        />
                    </div>

                    {/* 제안/안내 문구 */}
                    <div className="bg-[#F8F9FA] rounded-[12px] p-5 text-[13px] text-[#666] leading-relaxed">
                        <p>• 문의하신 내용은 담당자 확인 후 순차적으로 답변해 드립니다.</p>
                        <p>• 평일 10:00 ~ 18:00 (토/일/공휴일 제외) 운영됩니다.</p>
                        <p>• 등록한 문의는 수정하거나 삭제할 수 없습니다.</p>
                    </div>

                    {/* 문의하기 버튼 */}
                    <Button 
                        onClick={handleSubmit}
                        className="h-14 rounded-[12px] bg-[var(--foundation-primary-500)] hover:bg-[var(--foundation-primary-600)] text-white text-[17px] font-bold transition-all shadow-md shadow-green-100"
                    >
                        문의하기
                    </Button>
                </div>
            </div>
        </div>
    );
}
