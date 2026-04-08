"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ActionButton } from "@/components/common/Button";
import { createInquiry, getAccountInfo } from "@/lib/services";
import type { CreateInquiryRequest, InquiryCategory } from "@/lib/types";

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

/* UI */
const INQUIRY_TYPES = ["예매/상품", "결제/수수료", "배송/반송", "시스템 오류", "기타"] as const;

/* API */
type InquiryType = (typeof INQUIRY_TYPES)[number];
const CATEGORY_MAP: Record<InquiryType, InquiryCategory> = {
    "예매/상품": "BOOKING",
    "결제/수수료": "PAYMENT",
    "배송/반송": "DELIVERY",
    "시스템 오류": "SYSTEM_ERROR",
    "기타": "ETC",
};

export default function SupportWritePage() {
    const router = useRouter();
    const [type, setType] = useState<InquiryType | null>(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isTypeOpen, setIsTypeOpen] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [writerName, setWriterName] = useState("");
    const [writerEmail, setWriterEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await getAccountInfo();
                setWriterName(data.nickname);
                setWriterEmail(data.email);
            } catch (error) {
                console.error("Failed to fetch account info:", error);
            }
        };
        fetchUserData();
    }, []);
    const onlyDigits = (v: string) => v.replace(/\D/g, "");
    const phoneDigits = onlyDigits(phoneNumber);
    const isPhoneValid = phoneNumber.length === 0 || (/^01[0-9]\d{7,8}$/.test(phoneDigits) && (phoneDigits.length === 10 || phoneDigits.length === 11));
    const formatPhone = (value: string) => {
        const digits = value.replace(/\D/g, "").slice(0, 11); // 숫자만, 최대 11자리
        if (digits.length < 4) return digits;
        if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    };

    const isFormValid = !!type && title.trim().length > 0 && content.trim().length > 0 && isPhoneValid;

    const handleSubmit = async () => {
        if (!type) return;
        if (!isFormValid) return;

        setIsSubmitting(true);
        try {
            const body: CreateInquiryRequest = {
                category: CATEGORY_MAP[type],
                title: title.trim(),
                content: content.trim(),
                phoneNumber: phoneNumber.trim(),
            };

            // 1단계: 문의 등록
            let result: Awaited<ReturnType<typeof createInquiry>>;
            try {
                result = await createInquiry(body);
            } catch (e) {
                const error = e as { status?: number; message?: string };
                if (error.status === 400) toast.error("요청 값 오류");
                else if (error.status === 401) { toast.error("인증 필요"); router.push("/login"); }
                else if (error.status === 404) toast.error("사용자를 찾을 수 없습니다.");
                else toast.error(error.message ?? "문의 등록 중 오류가 발생했습니다.");
                return;
            }

            const inquiryId = result?.inquiryId;
            if (!inquiryId) {
                toast.error("문의 등록에 실패했습니다. 다시 시도해주세요.");
                return;
            }

            // 목록 페이지에서 즉시 반영되도록 localStorage에 저장
            const saved = localStorage.getItem("my-inquiries");
            const existing = saved ? JSON.parse(saved) : [];
            const newInquiry = {
                id: inquiryId,
                status: "WAITING",
                statusLabel: "답변 대기",
                category: type,
                title: body.title,
                description: body.content,
                date: new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\. /g, ".").replace(/\.$/, ""),
                answer: null,
            };
            localStorage.setItem("my-inquiries", JSON.stringify([newInquiry, ...existing]));

            toast.success("문의가 접수되었습니다.");
            router.refresh();
            router.push("/my/support");
        } finally {
            setIsSubmitting(false);
        }
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
                    className="cursor-pointer mb-8 text-[13px] font-medium text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors flex items-center gap-1"
                >
                    <ChevronLeft className="w-4 h-4" />
                    이전으로 돌아가기
                </button>

                <div className="flex flex-col gap-8">
                    <h1 className="text-2xl font-bold tracking-tight text-[var(--text-normal-n240)] font-['Pretendard']">1:1 문의 작성</h1>
                    {/* 문의 유형 */}
                    <div className="self-stretch px-8 py-6 bg-white rounded-[20px] border border-[var(--stroke-interactive-neutral-default)] flex flex-col items-start gap-2">
                        <Label className="text-black text-xl font-semibold leading-8">문의 유형</Label>
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

                    <div className="self-stretch px-8 py-6 bg-white rounded-[20px] border border-[var(--stroke-interactive-neutral-default)] flex flex-col items-start gap-2">
                        <Label className="text-black text-xl font-semibold leading-8">문의 내용</Label>

                        {/* 제목 */}
                        <Label className="text-[var(--text-normal-n240)] text-base font-semibold leading-6">제목</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="제목을 입력해주세요"
                            maxLength={200}
                            className="h-14 rounded-[12px] border-[#E0E0E0] px-5 text-[15px] hover:border-[var(--foundation-primary-500)] focus-visible:ring-0 focus-visible:border-[var(--foundation-primary-500)] transition-all outline-none"
                        />

                        {/* 내용 */}
                        <Label className="text-[16px] font-bold text-[#333333] ml-1">내용</Label>
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="선택하신 유형에 맞는 문의사항을 자세히 적어주세요."
                            className="min-h-[240px] rounded-[12px] border border-[#E0E0E0] p-5 text-[15px] hover:border-[var(--foundation-primary-500)] focus-visible:ring-0 focus-visible:border-[var(--foundation-primary-500)] focus-visible:outline-none transition-all resize-none leading-relaxed"
                        />


                    </div>

                    <div className="self-stretch px-8 py-6 bg-white rounded-[20px] border border-[var(--stroke-interactive-neutral-default)] flex flex-col items-start gap-4">
                        <div className="self-stretch text-black text-xl font-semibold leading-8">
                            작성자 정보
                        </div>

                        <div className="self-stretch grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label className="text-sm font-semibold text-[#666] ml-1">이름</Label>
                                <Input
                                    disabled
                                    value={writerName}
                                    onChange={(e) => setWriterName(e.target.value)}
                                    placeholder="이름을 입력해주세요"
                                    className="h-14 rounded-[12px] border-[#E0E0E0] px-4 text-[15px] focus-visible:border-[var(--foundation-primary-500)] focus-visible:ring-0 transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="text-sm font-semibold text-[#666] ml-1">이메일</Label>
                                <Input
                                    disabled
                                    value={writerEmail}
                                    onChange={(e) => setWriterEmail(e.target.value)}
                                    placeholder="이메일을 입력해주세요"
                                    className="h-14 rounded-[12px] border-[#E0E0E0] px-4 text-[15px] focus-visible:border-[var(--foundation-primary-500)] focus-visible:ring-0 transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <Label className="text-sm font-semibold text-[#666] ml-1">휴대폰 번호</Label>
                                <Input
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(formatPhone(e.target.value))}
                                    placeholder="010-0000-0000"
                                    className="h-14 rounded-[12px] border-[#E0E0E0] px-4 text-[15px] focus-visible:border-[var(--foundation-primary-500)] focus-visible:ring-0 transition-all"
                                />
                            </div>
                        </div>
                    </div>



                    {/* 제안/안내 문구 */}
                    <div className="bg-[var(--foundation-blue-50)] border border-[var(--foundation-blue-100)] rounded-xl p-5 text-sm text-[var(--text-normal-n240)] leading-relaxed">
                        <p>• 문의하신 내용은 담당자 확인 후 순차적으로 답변해 드립니다.</p>
                        <p>• 평일 10:00 ~ 18:00 (토/일/공휴일 제외) 운영됩니다.</p>
                        <p>• 등록한 문의는 수정하거나 삭제할 수 없습니다.</p>
                    </div>

                    {/* 문의하기 버튼 */}
                    <ActionButton
                        onClick={handleSubmit}
                        disabled={isSubmitting || !isFormValid}
                        size="lg"
                        className="w-full"
                    >
                        등록하기
                    </ActionButton>
                </div>
            </div>
        </div>
    );
}
