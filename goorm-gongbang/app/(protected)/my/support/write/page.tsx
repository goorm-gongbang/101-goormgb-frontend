"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useRef, type ChangeEvent } from "react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { PrimaryButton } from "@/components/common/Button";
import { createInquiry, issueInquiryPresignedUrl, confirmInquiryFile } from "@/lib/services";
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

    const [isEditingWriter, setIsEditingWriter] = useState(false);
    const [writerName, setWriterName] = useState("윤정빈");
    const [writerEmail, setWriterEmail] = useState("playball123@gmail.com");
    const [phoneNumber, setPhoneNumber] = useState("010-0000-0000");
    const onlyDigits = (v: string) => v.replace(/\D/g, "");
    const phoneDigits = onlyDigits(phoneNumber);
    const isPhoneValid = /^01[0-9]\d{7,8}$/.test(phoneDigits) && phoneDigits.length === 11;
    const formatPhone = (value: string) => {
        const digits = value.replace(/\D/g, "").slice(0, 11); // 숫자만, 최대 11자리
        if (digits.length < 4) return digits;
        if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    };
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        setImageFiles(files);
    };

    const handleClearImages = () => {
        setImageFiles([]);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const uploadInquiryImage = async (inquiryId: number, file: File) => {
        const { presignedUrl, fileKey } = await issueInquiryPresignedUrl(inquiryId, {
            fileName: file.name,
        });

        const contentType = file.type;
        if (!contentType) {
            throw new Error("파일 형식을 확인할 수 없습니다.");
        }

        const uploadResponse = await fetch(presignedUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
        });

        if (!uploadResponse.ok) {
            throw new Error("첨부파일 업로드에 실패했습니다.");
        }

        await confirmInquiryFile(inquiryId, { fileKey });
    };

    const isFormValid = !!type && title.trim().length > 0 && content.trim().length > 0 && isPhoneValid;

    const handleSubmit = async () => {
        if (!type) return;
        if (!isFormValid) return;

        try {
            setIsSubmitting(true);

            const body: CreateInquiryRequest = {
                category: CATEGORY_MAP[type],
                title: title.trim(),
                content: content.trim(),
                phoneNumber: phoneNumber.trim(),
            };

            const result = await createInquiry(body);

            const image = imageFiles[0];
            if (image) {
                await uploadInquiryImage(result.inquiryId, image);
            }

            toast.success("문의가 접수되었습니다.");
            router.push("/my/support");
        } catch (e) {
            const error = e as { status?: number; message?: string };

            if (error.status === 400) {
                toast.error("요청 값 오류");
                return;
            }
            if (error.status === 401) {
                toast.error("인증 필요");
                router.push("/login");
                return;
            }
            if (error.status === 403) {
                toast.error("본인 문의 아님");
                return;
            }
            if (error.status === 404) {
                toast.error("사용자 없음");
                return;
            }
            if (error.status === 413) {
                toast.error("파일 크기 제한 초과");
                return;
            }

            toast.error(error.message ?? "문의 등록 중 오류가 발생했습니다.");
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

                <div className="flex flex-col gap-8 shadow-sm">
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

                        {/* 이미지 */}
                        <Label className="text-[16px] font-bold text-[#333333] ml-1">이미지</Label>

                        <div className="relative w-full">
                            <Input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="h-14 w-full rounded-[12px] border-[#E0E0E0] pr-12 px-4 text-[15px]"
                            />

                            {imageFiles.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleClearImages}
                                    className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 inline-flex items-center justify-center text-[#999] hover:text-[#333] transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="self-stretch px-8 py-6 bg-white rounded-[20px] border border-[var(--stroke-interactive-neutral-default)] flex flex-col items-end gap-2">
                        <div className="self-stretch text-black text-xl font-semibold leading-8">
                            작성자 정보
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsEditingWriter((prev) => !prev)}
                            className="cursor-pointer text-sm font-normal underline leading-5 text-[#6C757D]"
                        >
                            {isEditingWriter ? "완료" : "변경하기"}
                        </button>

                        <div className="self-stretch p-5 bg-[var(--foundation-neutral-980)] rounded-[20px] flex items-center gap-2">
                            {isEditingWriter ? (
                                <>
                                    <Input
                                        value={writerName}
                                        onChange={(e) => setWriterName(e.target.value)}
                                        placeholder="이름을 입력해주세요"
                                        className="h-12 rounded-[12px] border-[#E0E0E0] px-4 text-[15px]"
                                    />
                                    <Input
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(formatPhone(e.target.value))}
                                        placeholder="010-1234-5678"
                                        className="h-12 rounded-[12px] border-[#E0E0E0] px-4 text-[15px]"
                                    />
                                    <Input
                                        value={writerEmail}
                                        onChange={(e) => setWriterEmail(e.target.value)}
                                        placeholder="이메일을 입력해주세요"
                                        className="h-12 rounded-[12px] border-[#E0E0E0] px-4 text-[15px]"
                                    />
                                </>
                            ) : (
                                <>
                                    <div className="flex-1 text-[#1A1A1A] text-xl font-bold leading-7">
                                        {writerName}
                                    </div>

                                    <div className="flex-1 flex flex-col items-end gap-2">
                                        <div className="text-[#1A1A1A] text-lg font-bold leading-6">
                                            {phoneNumber}
                                        </div>
                                        <div className="text-[#1A1A1A] text-base font-semibold leading-6">
                                            {writerEmail}
                                        </div>
                                    </div>
                                </>
                            )}

                        </div>
                    </div>



                    {/* 제안/안내 문구 */}
                    <div className="bg-[var(--foundation-blue-50)] border border-[var(--foundation-blue-100)] rounded-xl p-5 text-sm text-[var(--text-normal-n240)] leading-relaxed">
                        <p>• 문의하신 내용은 담당자 확인 후 순차적으로 답변해 드립니다.</p>
                        <p>• 평일 10:00 ~ 18:00 (토/일/공휴일 제외) 운영됩니다.</p>
                        <p>• 등록한 문의는 수정하거나 삭제할 수 없습니다.</p>
                    </div>

                    {/* 문의하기 버튼 */}
                    <PrimaryButton
                        onClick={handleSubmit}
                        disabled={isSubmitting || !isFormValid}
                    >
                        등록하기
                    </PrimaryButton>
                </div>
            </div>
        </div>
    );
}
