"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, Minus, Plus } from "lucide-react";
import { TicketingNavigator } from "@/components/common/TicketingNavigator";
import { CancelOrderModal } from "@/components/common/CancelOrderModal";
import { RefundPolicyModal } from "@/components/common/RefundPolicyModal";
import { useRouter, useParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { PaymentTimeoutModal } from "@/components/common/PaymentTimeoutModal";
import { PrimaryButton, SecondaryButton } from "@/components/common/Button";

export default function Page() {
    const router = useRouter();

    const params = useParams<{ matchId: string }>();
    const matchId = Array.isArray(params.matchId) ? params.matchId[0] : params.matchId;

    const [step, setStep] = useState<"ticket" | "payment">("ticket");
    const handleNextStep = () => {
        if (!canProceed) return;
        setStep("payment");
    };

    const handleSubmitPayment = () => {
        if (!canSubmitPayment || !matchId) return;

        if (paymentMethod === "toss" || paymentMethod === "kakao") {
            router.push(`/pay/${matchId}/complete?method=${paymentMethod}`);
            return;
        }

        if (paymentMethod === "bank") {
            router.push(`/pay/${matchId}/bank-account`);
        }
    };

    /* 남은 결제 시간 */
    const [remainingSeconds, setRemainingSeconds] = useState(1000 * 60); // ★ 이부분 나중에 5 * 60 으로 변경

    /* 티켓 선택 */
    const PRICE = {
        normal: 20000,   // 일반
        disabled: 10000, // 장애인
        veteran: 10000,  // 국가유공자
        child: 10000,    // 어린이
        infant: 0,       // 미취학 아동
        senior: 4500,    // 경로자
        youth: 7000,     // 청소년/군경
    } as const;

    type TicketKey = keyof typeof PRICE;

    const [ticketCounts, setTicketCounts] = useState<Record<TicketKey, number>>({
        normal: 2,
        disabled: 0,
        veteran: 0,
        child: 0,
        infant: 0,
        senior: 0,
        youth: 0,
    });

    const changeCount = (key: keyof typeof ticketCounts, diff: number) => {
        setTicketCounts((prev) => ({
            ...prev,
            [key]: Math.max(0, prev[key] + diff), // 0 미만 방지
        }));
    };

    const ticketAmount = (Object.keys(PRICE) as TicketKey[]).reduce(
        (sum, key) => sum + PRICE[key] * ticketCounts[key], 0
    );

    const fee = ticketAmount > 0 ? 2000 : 0;
    const discount = 0;
    const totalAmount = ticketAmount + fee - discount;
    const won = (n: number) => `${n.toLocaleString("ko-KR")} 원`;

    /* 예매자 확인 */
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [number, setNumber] = useState("");
    const [birth, setBirth] = useState("");

    /* 모달 */
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
    const [isPaymentTimeoutModalOpen, setIsPaymentTimeoutModalOpen] = useState(false);

    /* 예외처리 */
    const formatPhone = (value: string) => {
        const digits = value.replace(/\D/g, "").slice(0, 11); // 숫자만, 최대 11자리
        if (digits.length < 4) return digits;
        if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    };

    const formatBirth6 = (value: string) => value.replace(/\D/g, "").slice(0, 6);

    const onlyDigits = (v: string) => v.replace(/\D/g, "");
    const isNameValid = name.trim().length > 0;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const phoneDigits = onlyDigits(number);
    const isPhoneValid = /^01[0-9]\d{7,8}$/.test(phoneDigits) && phoneDigits.length === 11;
    const birthDigits = onlyDigits(birth);
    const isBirthValid = /^\d{6}$/.test(birthDigits);
    const canProceed = isNameValid && isEmailValid && isPhoneValid && isBirthValid;
    const [paymentMethod, setPaymentMethod] = useState<"toss" | "kakao" | "bank">("toss");
    const [cashReceipt, setCashReceipt] = useState<"apply" | "none">("none");
    const [isCashReceiptEditing, setIsCashReceiptEditing] = useState(false);
    const [cashReceiptPhone, setCashReceiptPhone] = useState("");
    const [saveCashReceiptInfo, setSaveCashReceiptInfo] = useState(true);
    const formatCountdown = (seconds: number) => {
        const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
        const secs = String(seconds % 60).padStart(2, "0");
        return `${minutes}:${secs}`;
    };
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [agreeCancelFee, setAgreeCancelFee] = useState(false);
    const [showTermsDetail, setShowTermsDetail] = useState(false);
    const [showCancelFeeDetail, setShowCancelFeeDetail] = useState(false);
    const canSubmitPayment = agreeTerms && agreeCancelFee;

    const [receiptPurpose, setReceiptPurpose] = useState<"personal" | "business">("personal");

    useEffect(() => {
        if (isPaymentTimeoutModalOpen) return;

        const timer = setInterval(() => {
            setRemainingSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsPaymentTimeoutModalOpen(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isPaymentTimeoutModalOpen]);

    return (
        <div className="w-full min-h-screen flex flex-col items-center bg-[var(--foundation-neutral-980)] ">
            <div className="w-full border-b border-[var(--foundation-neutral-880)] bg-white">
                <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 py-4 flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
                    <div className="min-w-0 flex items-start sm:items-center gap-3 sm:gap-4">
                        <button
                            type="button"
                            data-rounded="Medium"
                            data-size="Large"
                            data-status="Default"
                            data-stroke="False"
                            className="cursor-pointer w-10 h-10 rounded-md flex shrink-0 justify-center items-center"
                            aria-label="뒤로가기"
                            onClick={() => setStep("ticket")}
                        >
                            <ChevronLeft
                                className="w-6 h-6 text-[var(--foundation-neutral-160)]"
                                strokeWidth={1.5}
                            />
                        </button>

                        <div className="min-w-0 flex flex-wrap items-center gap-x-2 gap-y-1 sm:gap-x-3">
                            <div className="text-[var(--foundation-neutral-240)] text-sm sm:text-base lg:text-lg font-semibold leading-5 sm:leading-6">
                                2026년 3월 29일 (일) 14:00
                            </div>

                            <div className="text-[var(--foundation-neutral-240)] text-sm sm:text-base lg:text-lg font-semibold leading-5 sm:leading-6">
                                LG vs KT
                            </div>

                            <div className="hidden sm:block text-[var(--foundation-neutral-600)] text-sm sm:text-base leading-5">
                                |
                            </div>

                            <div className="min-w-0 flex items-center gap-2">
                                <div
                                    data-logo="LG"
                                    data-mode="Color"
                                    data-size="xsmall"
                                    className="w-7 h-7 sm:w-8 sm:h-8 bg-white inline-flex flex-col justify-center items-center overflow-hidden shrink-0"
                                >
                                    <img
                                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white object-cover"
                                        src="https://goormgb-assets.s3.ap-northeast-2.amazonaws.com/static/clubs/hanwha-eagles.png"
                                        alt="logo"
                                    />
                                </div>

                                <div className="min-w-0 text-[var(--foundation-neutral-400)] text-sm sm:text-base font-medium leading-5 sm:leading-6 truncate">
                                    잠실종합운동장 잠실야구장
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-auto overflow-x-auto">
                        <TicketingNavigator active={step === "ticket" ? "order" : "pay"} />
                    </div>
                </div>
            </div>

            <div className="w-full flex justify-center px-4 sm:px-6 md:px-8 xl:px-12 py-8">
                <div className="w-full max-w-[1440px] flex flex-col xl:flex-row justify-start items-start gap-8 xl:gap-14">
                    <div className="w-full xl:min-w-[760px] xl:max-w-[1000px] xl:shrink-0 inline-flex flex-col justify-start items-start gap-8">
                        {step === "ticket" ? (
                            <>
                                <div className="self-stretch flex flex-col justify-start items-start gap-4">
                                    <div className="self-stretch flex flex-col justify-start items-start gap-2">
                                        <div className="self-stretch justify-center text-[var(--foundation-neutral-240)] text-lg sm:text-xl font-bold font-['Pretendard'] leading-7">티켓 선택</div>
                                    </div>
                                    <div className="self-stretch p-4 bg-[var(--foundation-neutral-white)] rounded-[10px] outline outline-1 outline-offset-[-1px] outline-[var(--foundation-neutral-940)] flex flex-col justify-start items-start gap-4">
                                        <div className="self-stretch inline-flex justify-start items-start gap-2">
                                            <div className="w-20 justify-center text-[var(--foundation-neutral-600)] text-sm sm:text-base font-medium font-['Pretendard'] leading-6">기본가</div>
                                            <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                                                <div className="self-stretch inline-flex justify-start items-start gap-2 sm:gap-10">
                                                    <div className="flex-1 min-w-0 flex items-start gap-2">
                                                        <div className="flex-1 min-w-0 break-keep text-[var(--foundation-neutral-240)] text-sm sm:text-base font-semibold font-['Pretendard'] leading-6">일반</div>
                                                        <div className="shrink-0 min-w-[76px] text-right text-[var(--foundation-neutral-240)] text-sm sm:text-base font-semibold font-['Pretendard'] leading-6">20,000 원</div>
                                                    </div>
                                                    <div className="rounded-xl flex justify-center items-center gap-2">
                                                        <div className="flex justify-start items-center gap-0.5">
                                                            <div onClick={() => changeCount("normal", -1)} data-rounded="Medium" data-size="small" data-status="Default" data-stroke="True" className="cursor-pointer w-7 h-7 px-4 py-2 bg-[var(--foundation-neutral-960)] rounded-md flex justify-center items-center">
                                                                <Minus className="w-4 h-4 shrink-0 text-[var(--foundation-neutral-440)]" strokeWidth={1.75} />
                                                            </div>
                                                            <div className="w-8 h-8 px-4 py-2 rounded-md flex justify-center items-center">
                                                                <div className="justify-center text-[var(--foundation-neutral-240)] text-base font-medium font-['Pretendard'] leading-6">{ticketCounts.normal}</div>
                                                            </div>
                                                            <div onClick={() => changeCount("normal", +1)} data-rounded="Medium" data-size="small" data-status="Default" data-stroke="True" className="cursor-pointer w-7 h-7 px-4 py-2 bg-[var(--foundation-neutral-960)] rounded-md flex justify-center items-center">
                                                                <Plus className="w-4 h-4 shrink-0 text-[var(--foundation-neutral-440)]" strokeWidth={1.75} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-[var(--foundation-neutral-900)]" />
                                        <div className="self-stretch inline-flex justify-start items-start gap-2">
                                            <div className="w-20 justify-center text-[var(--foundation-neutral-600)] text-sm sm:text-base font-medium font-['Pretendard'] leading-6">기본 할인</div>
                                            <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                                                <div className="self-stretch inline-flex justify-start items-start gap-2 sm:gap-10">
                                                    <div className="flex-1 min-w-0 flex items-start gap-2">
                                                        <div className="flex-1 min-w-0 break-keep text-[var(--foundation-neutral-240)] text-sm sm:text-base font-semibold font-['Pretendard'] leading-6"><span>장애인</span><span className="block lg:inline">(1급 ~ 3급)</span></div>
                                                        <div className="shrink-0 min-w-[76px] text-right text-[var(--foundation-neutral-240)] text-sm sm:text-base font-semibold font-['Pretendard'] leading-6">10,000 원</div>
                                                    </div>
                                                    <div className="flex justify-start items-center gap-0.5">
                                                        <div onClick={() => changeCount("disabled", -1)} data-rounded="Medium" data-size="small" data-status="Default" data-stroke="True" className="cursor-pointer w-7 h-7 px-4 py-2 bg-[var(--foundation-neutral-960)] rounded-md flex justify-center items-center">
                                                            <Minus className="w-4 h-4 shrink-0 text-[var(--foundation-neutral-440)]" strokeWidth={1.75} />
                                                        </div>
                                                        <div className="w-8 h-8 px-4 py-2 rounded-md flex justify-center items-center">
                                                            <div className="justify-center text-[var(--foundation-neutral-600)] text-base font-medium font-['Pretendard'] leading-6">{ticketCounts.disabled}</div>
                                                        </div>
                                                        <div onClick={() => changeCount("disabled", +1)} data-rounded="Medium" data-size="small" data-status="Default" data-stroke="True" className="cursor-pointer w-7 h-7 px-4 py-2 bg-[var(--foundation-neutral-960)] rounded-md flex justify-center items-center">
                                                            <Plus className="w-4 h-4 shrink-0 text-[var(--foundation-neutral-440)]" strokeWidth={1.75} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="self-stretch inline-flex justify-start items-start gap-2 sm:gap-10">
                                                    <div className="flex-1 min-w-0 flex items-start gap-2">
                                                        <div className="flex-1 min-w-0 break-keep text-[var(--foundation-neutral-240)] text-sm sm:text-base font-semibold font-['Pretendard'] leading-6"><span>국가유공자</span><span className="block lg:inline">(국가유공자 & 병역명문가)</span></div>
                                                        <div className="shrink-0 min-w-[76px] text-right text-[var(--foundation-neutral-240)] text-sm sm:text-base font-semibold font-['Pretendard'] leading-6">10,000 원</div>
                                                    </div>
                                                    <div className="flex justify-start items-center gap-0.5">
                                                        <div onClick={() => changeCount("veteran", -1)} data-rounded="Medium" data-size="small" data-status="Default" data-stroke="True" className="cursor-pointer w-7 h-7 px-4 py-2 bg-[var(--foundation-neutral-960)] rounded-md flex justify-center items-center">
                                                            <Minus className="w-4 h-4 shrink-0 text-[var(--foundation-neutral-440)]" strokeWidth={1.75} />
                                                        </div>
                                                        <div className="w-8 h-8 px-4 py-2 rounded-md flex justify-center items-center">
                                                            <div className="justify-center text-[var(--foundation-neutral-600)] text-base font-medium font-['Pretendard'] leading-6">{ticketCounts.veteran}</div>
                                                        </div>
                                                        <div onClick={() => changeCount("veteran", +1)} data-rounded="Medium" data-size="small" data-status="Default" data-stroke="True" className="cursor-pointer w-7 h-7 px-4 py-2 bg-[var(--foundation-neutral-960)] rounded-md flex justify-center items-center">
                                                            <Plus className="w-4 h-4 shrink-0 text-[var(--foundation-neutral-440)]" strokeWidth={1.75} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="self-stretch inline-flex justify-start items-start gap-2 sm:gap-10">
                                                    <div className="flex-1 min-w-0 flex items-start gap-2">
                                                        <div className="flex-1 min-w-0 break-keep text-[var(--foundation-neutral-240)] text-sm sm:text-base font-semibold font-['Pretendard'] leading-6"><span>어린이</span><span className="block lg:inline">(36개월 ~ 초등학생)</span></div>
                                                        <div className="shrink-0 min-w-[76px] text-right text-[var(--foundation-neutral-240)] text-sm sm:text-base font-semibold font-['Pretendard'] leading-6">10,000 원</div>
                                                    </div>
                                                    <div className="flex justify-start items-center gap-0.5">
                                                        <div onClick={() => changeCount("child", -1)} data-rounded="Medium" data-size="small" data-status="Default" data-stroke="True" className="cursor-pointer w-7 h-7 px-4 py-2 bg-[var(--foundation-neutral-960)] rounded-md flex justify-center items-center">
                                                            <Minus className="w-4 h-4 shrink-0 text-[var(--foundation-neutral-440)]" strokeWidth={1.75} />
                                                        </div>
                                                        <div className="w-8 h-8 px-4 py-2 rounded-md flex justify-center items-center">
                                                            <div className="justify-center text-[var(--foundation-neutral-600)] text-base font-medium font-['Pretendard'] leading-6">{ticketCounts.child}</div>
                                                        </div>
                                                        <div onClick={() => changeCount("child", +1)} data-rounded="Medium" data-size="small" data-status="Default" data-stroke="True" className="cursor-pointer w-7 h-7 px-4 py-2 bg-[var(--foundation-neutral-960)] rounded-md flex justify-center items-center">
                                                            <Plus className="w-4 h-4 shrink-0 text-[var(--foundation-neutral-440)]" strokeWidth={1.75} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="self-stretch inline-flex justify-start items-start gap-2 sm:gap-10">
                                                    <div className="flex-1 min-w-0 flex items-start gap-2">
                                                        <div className="flex-1 min-w-0 break-keep text-[var(--foundation-neutral-240)] text-sm sm:text-base font-semibold font-['Pretendard'] leading-6"><span>미취학 아동</span><span className="block lg:inline">(36개월 미만, 보호자 좌석 미점유 시)</span></div>
                                                        <div className="shrink-0 min-w-[76px] text-right text-[var(--foundation-neutral-240)] text-sm sm:text-base font-semibold font-['Pretendard'] leading-6">무료</div>
                                                    </div>
                                                    <div className="flex justify-start items-center gap-0.5">
                                                        <div onClick={() => changeCount("infant", -1)} data-rounded="Medium" data-size="small" data-status="Default" data-stroke="True" className="cursor-pointer w-7 h-7 px-4 py-2 bg-[var(--foundation-neutral-960)] rounded-md flex justify-center items-center">
                                                            <Minus className="w-4 h-4 shrink-0 text-[var(--foundation-neutral-440)]" strokeWidth={1.75} />
                                                        </div>
                                                        <div className="w-8 h-8 px-4 py-2 rounded-md flex justify-center items-center">
                                                            <div className="justify-center text-[var(--foundation-neutral-600)] text-base font-medium font-['Pretendard'] leading-6">{ticketCounts.infant}</div>
                                                        </div>
                                                        <div onClick={() => changeCount("infant", +1)} data-rounded="Medium" data-size="small" data-status="Default" data-stroke="True" className="cursor-pointer w-7 h-7 px-4 py-2 bg-[var(--foundation-neutral-960)] rounded-md flex justify-center items-center">
                                                            <Plus className="w-4 h-4 shrink-0 text-[var(--foundation-neutral-440)]" strokeWidth={1.75} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="self-stretch inline-flex justify-start items-start gap-2 sm:gap-10">
                                                    <div className="flex-1 min-w-0 flex items-start gap-2">
                                                        <div className="flex-1 min-w-0 break-keep text-[var(--foundation-neutral-800)] text-sm sm:text-base font-semibold font-['Pretendard'] leading-6"><span>경로자</span><span className="block lg:inline">(만 65세 이상)</span></div>
                                                        <div className="hidden lg:block shrink-0 text-[var(--foundation-neutral-800)] text-xs font-medium font-['Pretendard'] leading-4">외야 그린석 한정</div>
                                                        <div className="shrink-0 min-w-[76px] text-right text-[var(--foundation-neutral-800)] text-sm sm:text-base font-semibold font-['Pretendard'] leading-6">4,500 원</div>
                                                    </div>
                                                    <div className="flex justify-start items-center gap-0.5">
                                                        <div onClick={() => changeCount("senior", -1)} data-rounded="Medium" data-size="small" data-status="Default" data-stroke="True" className="cursor-pointer w-7 h-7 px-4 py-2 bg-[var(--foundation-neutral-960)] rounded-md flex justify-center items-center">
                                                            <Minus className="w-4 h-4 shrink-0 text-[var(--foundation-neutral-440)]" strokeWidth={1.75} />
                                                        </div>
                                                        <div className="w-8 h-8 px-4 py-2 rounded-md flex justify-center items-center">
                                                            <div className="justify-center text-[var(--foundation-neutral-800)] text-base font-medium font-['Pretendard'] leading-6">{ticketCounts.senior}</div>
                                                        </div>
                                                        <div onClick={() => changeCount("senior", +1)} data-rounded="Medium" data-size="small" data-status="Default" data-stroke="True" className="cursor-pointer w-7 h-7 px-4 py-2 bg-[var(--foundation-neutral-960)] rounded-md flex justify-center items-center">
                                                            <Plus className="w-4 h-4 shrink-0 text-[var(--foundation-neutral-440)]" strokeWidth={1.75} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="self-stretch inline-flex justify-start items-start gap-2 sm:gap-10">
                                                    <div className="flex-1 min-w-0 flex items-start gap-2">
                                                        <div className="flex-1 min-w-0 break-keep text-[var(--foundation-neutral-800)] text-sm sm:text-base font-semibold font-['Pretendard'] leading-6"><span>청소년/군경</span><span className="block lg:inline">(중·고생, 일반 사병)</span></div>
                                                        <div className="hidden lg:block shrink-0 text-[var(--foundation-neutral-800)] text-xs font-medium font-['Pretendard'] leading-4">외야 그린석 한정</div>
                                                        <div className="shrink-0 min-w-[76px] text-right text-[var(--foundation-neutral-800)] text-sm sm:text-base font-semibold font-['Pretendard'] leading-6">7,000 원</div>
                                                    </div>
                                                    <div className="flex justify-start items-center gap-0.5">
                                                        <div onClick={() => changeCount("youth", -1)} data-rounded="Medium" data-size="small" data-status="Default" data-stroke="True" className="cursor-pointer w-7 h-7 px-4 py-2 bg-[var(--foundation-neutral-960)] rounded-md flex justify-center items-center">
                                                            <Minus className="w-4 h-4 shrink-0 text-[var(--foundation-neutral-440)]" strokeWidth={1.75} />
                                                        </div>
                                                        <div className="w-8 h-8 px-4 py-2 rounded-md flex justify-center items-center">
                                                            <div className="justify-center text-[var(--foundation-neutral-800)] text-base font-medium font-['Pretendard'] leading-6">{ticketCounts.youth}</div>
                                                        </div>
                                                        <div onClick={() => changeCount("youth", +1)} data-rounded="Medium" data-size="small" data-status="Default" data-stroke="True" className="cursor-pointer w-7 h-7 px-4 py-2 bg-[var(--foundation-neutral-960)] rounded-md flex justify-center items-center">
                                                            <Plus className="w-4 h-4 shrink-0 text-[var(--foundation-neutral-440)]" strokeWidth={1.75} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="self-stretch flex flex-col justify-start items-start gap-4">
                                    <div className="self-stretch flex flex-col justify-start items-start gap-2">
                                        <div className="self-stretch justify-center text-[var(--foundation-neutral-240)] text-xl font-bold font-['Pretendard'] leading-7">예매자 확인</div>
                                    </div>

                                    <div className="self-stretch p-4 bg-[var(--background-white)] rounded-[10px] outline outline-1 outline-offset-[-1px] outline-[var(--foundation-neutral-940)] grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="self-stretch inline-flex justify-start items-center gap-2">
                                            <div className="w-16 self-stretch flex justify-start items-center gap-2">
                                                <div className="justify-center text-[var(--foundation-neutral-240)] text-base font-medium font-['Pretendard'] leading-6">이름</div>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="이름 입력"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="flex-1 h-10 px-4 py-2 bg-[var(--foundation-neutral-white)] rounded-md outline outline-1 outline-offset-[-1px] outline-[var(--foundation-neutral-900)] text-sm font-medium font-['Pretendard'] leading-5 placeholder:opacity-80"
                                            />
                                        </div>

                                        <div className="self-stretch inline-flex justify-start items-center gap-2">
                                            <div className="w-16 self-stretch flex justify-start items-center gap-2">
                                                <div className="justify-center text-[var(--foundation-neutral-240)] text-sm font-medium font-['Pretendard'] leading-5">이메일</div>
                                            </div>

                                            <input
                                                type="text"
                                                placeholder="이메일 입력"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="flex-1 h-10 px-4 py-2 bg-[var(--foundation-neutral-white)] rounded-md outline outline-1 outline-offset-[-1px] outline-[var(--foundation-neutral-900)] text-sm font-medium font-['Pretendard'] leading-5 placeholder:opacity-80"
                                            />
                                        </div>

                                        <div className="self-stretch inline-flex justify-start items-center gap-2">
                                            <div className="w-16 self-stretch flex justify-start items-center gap-2">
                                                <div className="justify-center text-[var(--foundation-neutral-240)] text-sm font-medium font-['Pretendard'] leading-5">연락처</div>
                                            </div>

                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="연락처 입력"
                                                value={number}
                                                onChange={(e) => setNumber(formatPhone(e.target.value))}
                                                className="flex-1 h-10 px-4 py-2 bg-[var(--foundation-neutral-white)] rounded-md outline outline-1 outline-offset-[-1px] outline-[var(--foundation-neutral-900)] text-sm font-medium font-['Pretendard'] leading-5 placeholder:opacity-80"
                                            />
                                        </div>

                                        <div className="self-stretch inline-flex justify-start items-center gap-2">
                                            <div className="w-16 self-stretch flex justify-start items-center gap-2">
                                                <div className="justify-center whitespace-nowrap text-[var(--foundation-neutral-240)] text-sm font-medium font-['Pretendard'] leading-5">생년월일</div>
                                            </div>

                                            <input
                                                type="text"
                                                placeholder="생년월일 입력 (YYMMDD)"
                                                value={birth}
                                                onChange={(e) => setBirth(formatBirth6(e.target.value))}
                                                className="flex-1 h-10 px-4 py-2 bg-[var(--foundation-neutral-white)] rounded-md outline outline-1 outline-offset-[-1px] outline-[var(--foundation-neutral-900)] text-sm font-medium font-['Pretendard'] leading-5 placeholder:opacity-80"
                                            />
                                        </div>
                                    </div>
                                </div>

                            </>
                        ) : (
                            <div className="self-stretch inline-flex flex-col justify-start items-start gap-8">
                                <div className="self-stretch flex flex-col justify-start items-start gap-4">
                                    <div className="self-stretch flex flex-col justify-start items-start gap-2">
                                        <div className="self-stretch justify-center text-[var(--foundation-neutral-240)] text-xl font-bold font-['Pretendard'] leading-7">결제 정보</div>
                                    </div>
                                    <div className="self-stretch p-4 bg-[var(--background-white)] rounded-[10px] outline outline-1 outline-offset-[-1px] outline-[var(--foundation-neutral-940)] inline-flex flex-col justify-start items-start gap-6">
                                        <div className="self-stretch inline-flex justify-start items-start gap-2">
                                            <div className="w-20 justify-center text-[var(--foundation-neutral-600)] text-base font-medium font-['Pretendard'] leading-6">
                                                결제 수단
                                            </div>
                                            <div className="flex-1 inline-flex flex-col justify-start items-start gap-4">
                                                <label className="self-stretch inline-flex justify-start items-center gap-4 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="paymentMethod"
                                                        value="toss"
                                                        checked={paymentMethod === "toss"}
                                                        onChange={() => setPaymentMethod("toss")}
                                                        className="sr-only"
                                                    />
                                                    <div
                                                        className={`w-4 h-4 p-[3px] rounded-[50px] flex justify-center items-center gap-2 overflow-hidden ${paymentMethod === "toss"
                                                            ? "bg-[var(--foundation-primary-500)]"
                                                            : "bg-[var(--background-white)] border border-[var(--stroke-interactive-neutral-default)]"
                                                            }`}
                                                    >
                                                        {paymentMethod === "toss" && (
                                                            <div className="w-1.5 h-1.5 bg-[var(--foundation-neutral-white)] rounded-[50px]" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 flex justify-start items-center gap-2">
                                                        <img className="w-5 h-5 rounded-[50px]" src="/pay/toss.png" alt="토스페이" />
                                                        <div className="flex-1 text-[var(--foundation-neutral-240)] text-base font-medium font-['Pretendard'] leading-6">
                                                            토스페이
                                                        </div>
                                                    </div>
                                                </label>

                                                <label className="self-stretch inline-flex justify-start items-center gap-4 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="paymentMethod"
                                                        value="kakao"
                                                        checked={paymentMethod === "kakao"}
                                                        onChange={() => setPaymentMethod("kakao")}
                                                        className="sr-only"
                                                    />
                                                    <div
                                                        className={`w-4 h-4 p-[3px] rounded-[50px] flex justify-center items-center gap-2 overflow-hidden ${paymentMethod === "kakao"
                                                            ? "bg-[var(--foundation-primary-500)]"
                                                            : "bg-[var(--background-white)] border border-[var(--stroke-interactive-neutral-default)]"
                                                            }`}
                                                    >
                                                        {paymentMethod === "kakao" && (
                                                            <div className="w-1.5 h-1.5 bg-[var(--foundation-neutral-white)] rounded-[50px]" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 flex justify-start items-center gap-2">
                                                        <img className="w-12 h-5" src="/pay/kakao.png" alt="카카오페이" />
                                                        <div className="flex-1 text-[var(--foundation-neutral-240)] text-base font-medium font-['Pretendard'] leading-6">
                                                            카카오페이
                                                        </div>
                                                    </div>
                                                </label>

                                                <label className="self-stretch inline-flex justify-start items-center gap-4 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="paymentMethod"
                                                        value="bank"
                                                        checked={paymentMethod === "bank"}
                                                        onChange={() => setPaymentMethod("bank")}
                                                        className="sr-only"
                                                    />
                                                    <div
                                                        className={`w-4 h-4 p-[3px] rounded-[50px] flex justify-center items-center gap-2 overflow-hidden ${paymentMethod === "bank"
                                                            ? "bg-[var(--foundation-primary-500)]"
                                                            : "bg-[var(--background-white)] border border-[var(--stroke-interactive-neutral-default)]"
                                                            }`}
                                                    >
                                                        {paymentMethod === "bank" && (
                                                            <div className="w-1.5 h-1.5 bg-[var(--foundation-neutral-white)] rounded-[50px]" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 text-[var(--foundation-neutral-240)] text-base font-medium font-['Pretendard'] leading-6">
                                                        무통장 입금
                                                    </div>
                                                </label>
                                            </div>

                                        </div>
                                        <div className="self-stretch h-0 outline outline-2 outline-offset-[-1px] outline-[var(--foundation-neutral-900)]" />

                                        <div className="self-stretch inline-flex justify-start items-start gap-2">
                                            <div className="w-20 justify-center text-[var(--foundation-neutral-600)] text-base font-medium font-['Pretendard'] leading-6">
                                                현금영수증
                                            </div>
                                            <div className="flex-1 inline-flex flex-col justify-start items-start gap-4">
                                                <label className="self-stretch inline-flex justify-start items-center gap-4 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="cashReceipt"
                                                        value="apply"
                                                        checked={cashReceipt === "apply"}
                                                        onChange={() => {
                                                            setCashReceipt("apply");
                                                            setIsCashReceiptEditing(false);
                                                        }}
                                                        className="sr-only"
                                                    />
                                                    <div
                                                        className={`w-4 h-4 p-[3px] rounded-[50px] flex justify-center items-center gap-2 overflow-hidden ${cashReceipt === "apply"
                                                            ? "bg-[var(--foundation-primary-500)]"
                                                            : "bg-[var(--background-white)] border border-[var(--stroke-interactive-neutral-default)]"
                                                            }`}
                                                    >
                                                        {cashReceipt === "apply" && (
                                                            <div className="w-1.5 h-1.5 bg-[var(--foundation-neutral-white)] rounded-[50px]" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 text-[var(--foundation-neutral-240)] text-base font-medium font-['Pretendard'] leading-6">
                                                        신청
                                                    </div>
                                                </label>

                                                <label className="self-stretch inline-flex justify-start items-center gap-4 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="cashReceipt"
                                                        value="none"
                                                        checked={cashReceipt === "none"}
                                                        onChange={() => {
                                                            setCashReceipt("none");
                                                            setIsCashReceiptEditing(false);
                                                        }}
                                                        className="sr-only"
                                                    />
                                                    <div
                                                        className={`w-4 h-4 p-[3px] rounded-[50px] flex justify-center items-center gap-2 overflow-hidden ${cashReceipt === "none"
                                                            ? "bg-[var(--foundation-primary-500)]"
                                                            : "bg-[var(--background-white)] border border-[var(--stroke-interactive-neutral-default)]"
                                                            }`}
                                                    >
                                                        {cashReceipt === "none" && (
                                                            <div className="w-1.5 h-1.5 bg-[var(--foundation-neutral-white)] rounded-[50px]" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 text-[var(--foundation-neutral-240)] text-base font-medium font-['Pretendard'] leading-6">
                                                        미신청
                                                    </div>
                                                </label>

                                                {/* 신청일 때만 하단 노출 */}
                                                {cashReceipt === "apply" && !isCashReceiptEditing && (
                                                    <div className="self-stretch h-14 p-4 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-[var(--stroke-interactive-neutral-default)] inline-flex justify-start items-center gap-2">
                                                        <div className="flex-1 text-[var(--foundation-neutral-240)] text-base font-medium font-['Pretendard'] leading-6">
                                                            개인소득공제용
                                                        </div>
                                                        <div className="text-[var(--foundation-neutral-240)] text-xs font-normal font-['Pretendard'] leading-4">
                                                            ({cashReceiptPhone ? formatPhone(cashReceiptPhone) : "010-0000-0000"})
                                                        </div>

                                                        <SecondaryButton
                                                            type="button"
                                                            size="sm"
                                                            tone="base"
                                                            onClick={() => setIsCashReceiptEditing(true)}
                                                        >
                                                            변경하기
                                                        </SecondaryButton>
                                                    </div>
                                                )}

                                                {/* 변경하기 클릭 시 */}
                                                {cashReceipt === "apply" && isCashReceiptEditing && (
                                                    <div className="self-stretch p-4 bg-[var(--background-grey)] rounded-[10px] outline outline-1 outline-offset-[-1px] outline-[var(--stroke-interactive-neutral-default)] inline-flex flex-col justify-center items-start gap-4">
                                                        <div className="self-stretch flex flex-col justify-start items-start gap-1">
                                                            <div className="self-stretch justify-center text-black text-xs font-normal font-['Pretendard'] leading-4">발급 용도</div>

                                                            <label className="self-stretch inline-flex justify-start items-center gap-4 cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="receiptPurpose"
                                                                    value="personal"
                                                                    checked={receiptPurpose === "personal"}
                                                                    onChange={() => setReceiptPurpose("personal")}
                                                                    className="sr-only"
                                                                />
                                                                <div
                                                                    className={`w-4 h-4 p-[3px] rounded-[50px] flex justify-center items-center gap-2 overflow-hidden ${receiptPurpose === "personal"
                                                                        ? "bg-[var(--foundation-primary-500)]"
                                                                        : "bg-[var(--background-white)] border border-[var(--stroke-interactive-neutral-default)]"
                                                                        }`}
                                                                >
                                                                    {receiptPurpose === "personal" && (
                                                                        <div className="w-1.5 h-1.5 bg-[var(--foundation-neutral-white)] rounded-[50px]" />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 justify-center text-[var(--foundation-neutral-240)] text-sm font-medium font-['Pretendard'] leading-5">
                                                                    개인소득공제용
                                                                </div>
                                                            </label>

                                                            <label className="self-stretch inline-flex justify-start items-center gap-4 cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="receiptPurpose"
                                                                    value="business"
                                                                    checked={receiptPurpose === "business"}
                                                                    onChange={() => setReceiptPurpose("business")}
                                                                    className="sr-only"
                                                                />
                                                                <div
                                                                    className={`w-4 h-4 p-[3px] rounded-[50px] flex justify-center items-center gap-2 overflow-hidden ${receiptPurpose === "business"
                                                                        ? "bg-[var(--foundation-primary-500)]"
                                                                        : "bg-[var(--background-white)] border border-[var(--stroke-interactive-neutral-default)]"
                                                                        }`}
                                                                >
                                                                    {receiptPurpose === "business" && (
                                                                        <div className="w-1.5 h-1.5 bg-[var(--foundation-neutral-white)] rounded-[50px]" />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 justify-center text-[var(--foundation-neutral-240)] text-sm font-medium font-['Pretendard'] leading-5">
                                                                    사업자지출증빙
                                                                </div>
                                                            </label>
                                                        </div>

                                                        <div className="self-stretch flex flex-col justify-start items-start gap-1">
                                                            <div className="self-stretch justify-center text-black text-xs font-normal font-['Pretendard'] leading-4">전화번호</div>

                                                            <div className="self-stretch relative">
                                                                <input
                                                                    type="text"
                                                                    inputMode="numeric"
                                                                    value={cashReceiptPhone}
                                                                    onChange={(e) => setCashReceiptPhone(formatPhone(e.target.value))}
                                                                    placeholder="010-0000-0000"
                                                                    className="self-stretch w-full h-10 p-2 bg-[var(--foundation-neutral-white)] rounded-md outline outline-1 outline-offset-[-1px] outline-[var(--foundation-neutral-900)] text-[var(--foundation-neutral-680)] text-sm font-medium font-['Pretendard'] leading-5"
                                                                />

                                                                <button
                                                                    type="button"
                                                                    onClick={() => setCashReceiptPhone("")}
                                                                    disabled={!cashReceiptPhone}
                                                                    aria-label="전화번호 지우기"
                                                                    className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded flex items-center justify-center disabled:opacity-40"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                                        <g clipPath="url(#clip0_clear_phone)">
                                                                            <path d="M8.00001 14.6663C11.6819 14.6663 14.6667 11.6816 14.6667 7.99967C14.6667 4.31778 11.6819 1.33301 8.00001 1.33301C4.31811 1.33301 1.33334 4.31778 1.33334 7.99967C1.33334 11.6816 4.31811 14.6663 8.00001 14.6663Z" fill="#E0E0E0" />
                                                                            <path d="M10 5.99967L6.00001 9.99967L10 5.99967Z" fill="#E0E0E0" />
                                                                            <path d="M6.00001 5.99967L10 9.99967L6.00001 5.99967Z" fill="#E0E0E0" />
                                                                            <path d="M10 5.99967L6.00001 9.99967M6.00001 5.99967L10 9.99967M14.6667 7.99967C14.6667 11.6816 11.6819 14.6663 8.00001 14.6663C4.31811 14.6663 1.33334 11.6816 1.33334 7.99967C1.33334 4.31778 4.31811 1.33301 8.00001 1.33301C11.6819 1.33301 14.6667 4.31778 14.6667 7.99967Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                                                                        </g>
                                                                        <defs>
                                                                            <clipPath id="clip0_clear_phone">
                                                                                <rect width="16" height="16" fill="white" />
                                                                            </clipPath>
                                                                        </defs>
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <label className="self-stretch inline-flex justify-start items-center gap-4 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={saveCashReceiptInfo}
                                                                onChange={(e) => setSaveCashReceiptInfo(e.target.checked)}
                                                                className="sr-only"
                                                            />

                                                            <div className="flex justify-start items-start">
                                                                {saveCashReceiptInfo ? (
                                                                    <div className="w-4 h-4 bg-[var(--foundation-primary-600)] rounded flex items-center justify-center">
                                                                        <svg viewBox="0 0 16 16" className="w-3 h-3 text-white" fill="none" aria-hidden="true">
                                                                            <path
                                                                                d="M3.5 8.5L6.5 11.5L12.5 4.5"
                                                                                stroke="currentColor"
                                                                                strokeWidth="2"
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                            />
                                                                        </svg>
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-4 h-4 rounded outline outline-1 outline-offset-[-1px] outline-[var(--stroke-interactive-neutral-default)]" />
                                                                )}
                                                            </div>

                                                            <div className="flex-1 text-[var(--foundation-neutral-240)] text-sm font-medium font-['Pretendard'] leading-5">
                                                                현금영수증 정보 저장
                                                            </div>
                                                        </label>

                                                        <div className="self-stretch inline-flex justify-start items-center gap-2">
                                                            <SecondaryButton
                                                                type="button"
                                                                size="lg"
                                                                tone="base"
                                                                onClick={() => setIsCashReceiptEditing(false)}
                                                                className="flex-1 min-w-20"
                                                            >
                                                                취소
                                                            </SecondaryButton>

                                                            <PrimaryButton
                                                                type="button"
                                                                size="lg"
                                                                tone="base"
                                                                onClick={() => {
                                                                    if (!/^01[0-9]\d{7,8}$/.test(phoneDigits) || phoneDigits.length !== 11) return;
                                                                    setIsCashReceiptEditing(false)
                                                                }}
                                                                className="flex-1 min-w-20"
                                                            >
                                                                확인
                                                            </PrimaryButton>
                                                        </div>
                                                    </div>
                                                )}

                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="self-stretch flex flex-col justify-start items-start gap-4">
                                    <div className="self-stretch flex flex-col justify-start items-start gap-2">
                                        <div className="self-stretch justify-center text-[var(--foundation-neutral-240)] text-xl font-bold font-['Pretendard'] leading-7">약관 동의</div>
                                    </div>
                                    <div className="self-stretch p-4 bg-[var(--background-white)] rounded-[10px] outline outline-1 outline-offset-[-1px] outline-[var(--foundation-neutral-940)] inline-flex flex-col justify-start items-start gap-6">
                                        {/* 이용 약관 동의 */}
                                        <div className="self-stretch flex flex-col justify-start items-start gap-3">
                                            <div className="self-stretch h-5 inline-flex justify-start items-center gap-3">
                                                <label className="cursor-pointer bg-[var(--foundation-neutral-white)] flex justify-start items-start">
                                                    <input
                                                        type="checkbox"
                                                        checked={agreeTerms}
                                                        onChange={(e) => setAgreeTerms(e.target.checked)}
                                                        className="sr-only"
                                                    />
                                                    {agreeTerms ? (
                                                        <div className="w-4 h-4 rounded bg-[var(--foundation-primary-500)] flex items-center justify-center">
                                                            <svg viewBox="0 0 16 16" className="w-3 h-3 text-white" fill="none">
                                                                <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </div>
                                                    ) : (
                                                        <div className="w-4 h-4 rounded outline outline-1 outline-offset-[-1px] outline-[var(--stroke-interactive-neutral-default)]" />
                                                    )}
                                                </label>

                                                <div className="flex-1 self-stretch flex justify-start items-center gap-2">
                                                    <div className="flex-1">
                                                        <span className="text-[var(--foundation-neutral-240)] text-base font-semibold font-['Pretendard_Variable'] leading-6">이용 약관 동의 </span>
                                                        <span className="text-[var(--foundation-red-500)] text-base font-semibold font-['Pretendard_Variable'] leading-6">*</span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => setShowTermsDetail((prev) => !prev)}
                                                        className="cursor-pointer w-7 h-4 flex items-center justify-center"
                                                        aria-label="이용 약관 상세 보기"
                                                    >
                                                        <ChevronRight
                                                            className={`w-4 h-4 text-[var(--foundation-neutral-600)] transition-transform ${showTermsDetail ? "rotate-90" : ""}`}
                                                            strokeWidth={1.75}
                                                        />
                                                    </button>
                                                </div>
                                            </div>

                                            {showTermsDetail && (
                                                <div className="self-stretch pl-7 inline-flex justify-start items-start gap-0.5 overflow-hidden">
                                                    <div className="flex-1 pl-3 pr-6 py-3 bg-[var(--foundation-neutral-960)] rounded-xl rounded-br-sm flex justify-start items-start gap-0.5">
                                                        <div className="flex-1 text-[var(--foundation-neutral-240)] text-sm font-medium font-['Pretendard'] leading-5 whitespace-pre-line">
                                                            프로스포츠 암표 근절 이용 약관에 아래와 같이 동의합니다.
                                                            {"\n\n"}회사는 ‘이용약관 제34조’ 및 ‘국민체육진흥법’에 의거 선량한 이용자의 보호를 위하여 다음과 같이 부정이용을 통해 티켓을 구입한 고객에 대하여 일정한 기간을 정하여 예매제한 또는 예매 건에 대한 취소 및 강제폐기(압류) 등의 조치를 취할 수 있습니다.
                                                            {"\n\n"}부정한 방법을 통한 예매의 경우(예. 매크로 이용 등 비정상적인 방법을 통한 예매)
                                                            {"\n"}반복적인 다량 구매 후 취소하는 경우(예. 재판매를 위하여 일정기간 동안 다량 구매 후 취소를 반복하는 경우)
                                                            {"\n"}암표매매의 목적으로 구매하거나 암표매매를 이미 한 경우(예. 구매한 티켓을 회사의 판매가보다 높은 가격을 받고 타에 판매하는 경우)
                                                            {"\n"}기타 이에 준하는 부정한 이용으로 판단되는 경우
                                                            {"\n\n"}위 행위에 대하여 회사는 해당 고객에게 그 즉시 1일 이상의 소명기한을 부여하며, 그 기간 내 고객으로부터 소명서를 제출할 경우 그 내용이 합당하다고 판단되면 해당 조치를 해지할 수 있습니다.
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* 취소/취소 수수료 동의 */}
                                        <div className="self-stretch flex flex-col justify-start items-start gap-3">
                                            <div className="self-stretch h-5 inline-flex justify-start items-center gap-3">
                                                <label className="cursor-pointer bg-[var(--foundation-neutral-white)] flex justify-start items-start">
                                                    <input
                                                        type="checkbox"
                                                        checked={agreeCancelFee}
                                                        onChange={(e) => setAgreeCancelFee(e.target.checked)}
                                                        className="sr-only"
                                                    />
                                                    {agreeCancelFee ? (
                                                        <div className="w-4 h-4 rounded bg-[var(--foundation-primary-500)] flex items-center justify-center">
                                                            <svg viewBox="0 0 16 16" className="w-3 h-3 text-white" fill="none">
                                                                <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </div>
                                                    ) : (
                                                        <div className="w-4 h-4 rounded outline outline-1 outline-offset-[-1px] outline-[var(--stroke-interactive-neutral-default)]" />
                                                    )}
                                                </label>

                                                <div className="flex-1 self-stretch flex justify-start items-center gap-2">
                                                    <div className="flex-1">
                                                        <span className="text-[var(--foundation-neutral-240)] text-base font-semibold font-['Pretendard_Variable'] leading-6">취소/취소 수수료 동의 </span>
                                                        <span className="text-[var(--foundation-red-500)] text-base font-semibold font-['Pretendard_Variable'] leading-6">*</span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCancelFeeDetail((prev) => !prev)}
                                                        className="cursor-pointer w-7 h-4 flex items-center justify-center"
                                                        aria-label="취소 수수료 상세 보기"
                                                    >
                                                        <ChevronRight
                                                            className={`w-4 h-4 text-[var(--foundation-neutral-600)] transition-transform ${showCancelFeeDetail ? "rotate-90" : ""}`}
                                                            strokeWidth={1.75}
                                                        />
                                                    </button>
                                                </div>
                                            </div>

                                            {showCancelFeeDetail && (
                                                <div className="self-stretch pl-7 inline-flex justify-start items-start gap-0.5 overflow-hidden">
                                                    <div className="flex-1 pl-3 pr-6 py-3 bg-[var(--foundation-neutral-960)] rounded-xl flex flex-col justify-start items-start gap-3">
                                                        <div className="text-[var(--foundation-neutral-240)] text-sm font-medium font-['Pretendard'] leading-5">1. 취소 수수료</div>

                                                        <div className="ml-[20px] self-stretch bg-[var(--foundation-neutral-white)] border-t border-b border-zinc-400 overflow-hidden">
                                                            <div className="self-stretch px-4 py-2.5 bg-[var(--foundation-neutral-900)] grid grid-cols-2 gap-2">
                                                                <div className="text-black text-sm font-normal font-['Pretendard'] leading-5">내용</div>
                                                                <div className="text-black text-sm font-normal font-['Pretendard'] leading-5">취소 수수료</div>
                                                            </div>
                                                            <div className="self-stretch px-4 py-2.5 border-b border-neutral-200 grid grid-cols-2 gap-2">
                                                                <div className="text-black text-sm font-normal font-['Pretendard'] leading-5">경기 7일 전</div>
                                                                <div className="text-black text-sm font-normal font-['Pretendard'] leading-5">취소 수수료 없음 (+ 예매 당일일 경우 예매 대행 수수료)</div>
                                                            </div>
                                                            <div className="self-stretch px-4 py-2.5 border-b border-neutral-200 grid grid-cols-2 gap-2">
                                                                <div className="text-black text-sm font-normal font-['Pretendard'] leading-5">경기 6일 전 ~ 경기 당일</div>
                                                                <div className="text-black text-sm font-normal font-['Pretendard'] leading-5">티켓 금액의 10% + 예매 대행 수수료</div>
                                                            </div>
                                                        </div>

                                                        <div className="text-[var(--foundation-neutral-240)] text-sm font-medium font-['Pretendard'] leading-5">2. 환불 정책</div>
                                                        <div className="ml-[20px] text-black text-sm font-normal font-['Pretendard'] leading-5 whitespace-pre-line">
                                                            <ul className="list-disc pl-5 marker:text-[var(--foundation-neutral-240)]">
                                                                <li>경기일자 및 좌석변경은 불가합니다.</li>
                                                                <li>부분취소는 불가합니다. 기존 건을 전체취소 후 재예매하셔야 하며, 취소좌석에 대한 좌석선점은 보장되지 않습니다.</li>
                                                                <li>경기 7일 전 밤 12시 이전 취소 시에는 취소수수료가 부과되지 않습니다.</li>
                                                                <li>예매 당일 취소의 경우만 예매 대행 수수료가 환불되며, 그 이후 취소 시 환불되지 않습니다.</li>
                                                                <li>당일 경기 예매는 결제 이후 취소가 불가합니다.</li>
                                                            </ul>

                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="w-full xl:w-96 xl:shrink-0 self-stretch shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] inline-flex flex-col justify-start items-start gap-4 overflow-hidden">
                        <div className="self-stretch inline-flex justify-end items-center gap-2">
                            <div className="flex-1 justify-center text-[var(--foundation-neutral-240)] text-xl font-bold font-['Pretendard'] leading-7">MY 예매 정보</div>
                            <div className="text-right justify-center text-[var(--foundation-neutral-240)] text-sm font-medium font-['Pretendard'] leading-5">남은 결제 시간</div>
                            <PaymentTimeoutModal
                                open={isPaymentTimeoutModalOpen}
                                onConfirm={() => {
                                    setIsPaymentTimeoutModalOpen(false);
                                    router.push(`/matches/${matchId}`); // ★ 경기 상세 페이지 경로 (추후 /matches/(번호) 추가해야함.)
                                }}
                            />
                            <div data-order="5순위" className="h-6 p-2 bg-[var(--foundation-red-500)] rounded-[100px] outline outline-1 outline-offset-[-1px] outline-[var(--foundation-red-400)] flex justify-center items-center">
                                <div className="text-center justify-center text-[var(--foundation-neutral-white)] text-xs font-semibold font-['Pretendard'] leading-5">{formatCountdown(remainingSeconds)}</div>
                            </div>
                        </div>
                        <div className="self-stretch flex-1 bg-[var(--background-white)] rounded-[10px] outline outline-1 outline-offset-[-1px] outline-[var(--foundation-neutral-940)] flex flex-col justify-start items-start">
                            <div className="self-stretch flex-1 p-6 flex flex-col justify-start items-start gap-8">
                                <div className="self-stretch flex flex-col justify-start items-start gap-4">
                                    <div className="self-stretch justify-center text-[var(--foundation-neutral-240)] text-base font-semibold font-['Pretendard'] leading-6">경기 정보</div>
                                    <div className="self-stretch flex flex-col justify-start items-start gap-2">
                                        <div className="self-stretch inline-flex justify-center items-start gap-2">
                                            <div className="justify-center text-[var(--foundation-neutral-600)] text-sm font-medium font-['Pretendard'] leading-5">경기 장소</div>
                                            <div className="flex-1 text-right justify-center text-[var(--foundation-neutral-240)] text-sm font-medium font-['Pretendard'] leading-5">서울 송파구 올림픽로 19-2 서울종합운동장</div>
                                        </div>
                                        <div className="self-stretch inline-flex justify-center items-center gap-2">
                                            <div className="justify-center text-[var(--foundation-neutral-600)] text-sm font-medium font-['Pretendard'] leading-5">경기 시간</div>
                                            <div className="flex-1 text-right justify-center text-[var(--foundation-neutral-240)] text-sm font-medium font-['Pretendard'] leading-5">2026년 3월 29일 (일) 14:00 </div>
                                        </div>
                                        <div className="self-stretch inline-flex justify-start items-start gap-2">
                                            <div className="justify-center text-[var(--foundation-neutral-600)] text-sm font-medium font-['Pretendard'] leading-5">선택 좌석</div>
                                            <div className="flex-1 inline-flex flex-col justify-center items-start gap-0.5">
                                                <div className="self-stretch text-right justify-center text-[var(--foundation-blue-600)] text-sm font-medium font-['Pretendard'] leading-5">오렌지석 206블럭 3열 13번</div>
                                                <div className="self-stretch text-right justify-center text-[var(--foundation-blue-600)] text-sm font-medium font-['Pretendard'] leading-5">오렌지석 206블럭 3열 14번</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="self-stretch h-56 flex flex-col justify-start items-start gap-4">
                                    <div className="self-stretch justify-center text-[var(--foundation-neutral-240)] text-base font-semibold font-['Pretendard'] leading-6">결제 금액</div>
                                    <div className="self-stretch px-2.5 flex flex-col justify-start items-start gap-4">
                                        <div className="self-stretch inline-flex justify-start items-start gap-2">
                                            <div className="w-20 justify-center text-[var(--foundation-neutral-240)] text-sm font-medium font-['Pretendard'] leading-5">티켓 금액</div>
                                            <div className="flex-1 text-right justify-center text-[var(--foundation-neutral-20)] text-base font-semibold font-['Pretendard'] leading-6">{won(ticketAmount)}</div>
                                        </div>
                                        <div className="self-stretch inline-flex justify-start items-start gap-2">
                                            <div className="w-20 justify-center text-[var(--foundation-neutral-240)] text-sm font-medium font-['Pretendard'] leading-5">수수료</div>
                                            <div className="flex-1 text-right justify-center text-[var(--foundation-neutral-20)] text-base font-semibold font-['Pretendard'] leading-6">{won(fee)}</div>
                                        </div>
                                        <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-[var(--foundation-neutral-900)]" />
                                        <div className="self-stretch inline-flex justify-start items-start gap-2">
                                            <div className="w-20 justify-center text-[var(--foundation-neutral-240)] text-sm font-medium font-['Pretendard'] leading-5">할인</div>
                                            <div className="flex-1 text-right justify-center text-[var(--foundation-neutral-20)] text-sm font-medium font-['Pretendard'] leading-5">{discount === 0 ? "-" : `- ${won(discount)}`}</div>
                                        </div>
                                        <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-[var(--foundation-neutral-900)]" />
                                        <div className="self-stretch inline-flex justify-start items-center gap-2">
                                            <div className="w-20 justify-center text-[var(--foundation-neutral-240)] text-base font-semibold font-['Pretendard'] leading-6">총 결제 금액</div>
                                            <div className="flex-1 text-right justify-center text-[var(--foundation-primary-600)] text-xl font-bold font-['Pretendard'] leading-7">{won(totalAmount)}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                                    <div className="self-stretch inline-flex justify-start items-center gap-2">
                                        <div className="w-20 justify-center text-[var(--foundation-neutral-600)] text-sm font-medium font-['Pretendard'] leading-5">취소 기한</div>
                                        <div className="flex-1 justify-center text-[var(--foundation-neutral-240)] text-sm font-medium font-['Pretendard'] leading-5">2026년 2월 11일 (수) 23:59</div>
                                    </div>
                                    <div className="self-stretch inline-flex justify-start items-center gap-2">
                                        <div className="w-20 justify-center text-[var(--foundation-neutral-600)] text-sm font-medium font-['Pretendard'] leading-5">취소 수수료</div>
                                        <div className="flex-1 justify-center text-[var(--foundation-neutral-240)] text-sm font-medium font-['Pretendard'] leading-5">티켓 금액의 0~10%</div>
                                        
                                        <SecondaryButton
                                            type="button"
                                            size="sm"
                                            tone="base"
                                            onClick={() => setIsRefundModalOpen(true)}
                                        >
                                            자세히보기
                                        </SecondaryButton>

                                        <RefundPolicyModal
                                            open={isRefundModalOpen}
                                            onClose={() => setIsRefundModalOpen(false)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="self-stretch p-6 flex flex-col justify-start items-start gap-6">
                                <div className="self-stretch inline-flex justify-start items-center gap-2">

                                    <SecondaryButton
                                        type="button"
                                        size="lg"
                                        tone="base"
                                        onClick={() => setIsCancelModalOpen(true)}
                                        className="flex-1 min-w-20"
                                    >
                                        이전
                                    </SecondaryButton>

                                    <CancelOrderModal
                                        open={isCancelModalOpen}
                                        onClose={() => setIsCancelModalOpen(false)}
                                        onFindOtherSeat={() => {
                                            setIsCancelModalOpen(false);
                                        }}
                                        onSelectAlternativeSeat={() => {
                                            setIsCancelModalOpen(false);
                                            router.back();
                                        }}
                                    />

                                    <PrimaryButton
                                        type="button"
                                        size="lg"
                                        tone="base"
                                        disabled={step === "ticket" ? !canProceed : !canSubmitPayment}
                                        onClick={step === "ticket" ? handleNextStep : handleSubmitPayment}
                                        className="flex-1 min-w-20"
                                    >
                                        다음 단계
                                    </PrimaryButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
