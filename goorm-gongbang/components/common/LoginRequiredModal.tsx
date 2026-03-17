"use client";

import { KakaoButton } from "@/components/login/KakaoButton";
import { getKakaoLoginUrl } from "@/lib/services";
import { ApiError } from "@/lib/api";

type Props = {
    open: boolean;
    onClose: () => void;
};

const handleKakaoLogin = async () => {
    try {
        const data = await getKakaoLoginUrl();
        const loginUrl = data?.loginUrl;

        if (!loginUrl) {
            console.error("❌ loginUrl missing:", data);
            return;
        }

        window.location.href = loginUrl;
    } catch (e) {
        if (e instanceof ApiError) {
            console.error("❌ kakao login-url failed:", e.status, e.message);
        } else {
            console.error("⚠️ kakao login-url error:", e);
        }
    }
};

export function LoginRequiredModal({ open, onClose }: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="inline-flex flex-col items-center gap-6">
                <div className="w-full max-w-[420px] rounded-2xl bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-[var(--stroke-interactive-neutral-default)]">
                    <div className="inline-flex w-full flex-col items-start justify-start gap-8 p-8">
                        <div className="flex w-full flex-col items-start justify-start gap-4">
                            <div className="flex w-full flex-col items-start justify-start gap-8">
                                <div className="flex w-full flex-col items-start justify-start gap-6">
                                    <div className="inline-flex w-full items-center justify-center">
                                        <div className="flex-1 text-xl font-bold leading-7 text-[var(--foundation-neutral-160)] font-['Pretendard']">
                                            예매를 계속하려면 로그인이 필요해요
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex w-full flex-col items-start justify-start gap-8">
                                <div className="flex w-full flex-col items-start justify-start gap-6">
                                    <div className="inline-flex w-full items-center justify-center">
                                        <div className="flex-1 text-base font-medium leading-6 text-[var(--foundation-neutral-160)] font-['Pretendard']">
                                            간편 로그인 하나로, 원하는 경기를 바로 예매하세요
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex w-full flex-col items-start justify-start gap-2.5">
                            <div className="flex w-full flex-col items-start justify-start gap-3">
                                <div className="inline-flex w-full items-center justify-start gap-2">
                                    <div className="inline-flex flex-1 flex-col items-start justify-start gap-2">
                                        <KakaoButton onClick={handleKakaoLogin} className="w-full" bgVariant="kakao" contentPadding="20" />
                                    </div>
                                </div>
                            </div>

                            <div className="inline-flex w-full items-center justify-center gap-2 p-2">
                                <div className="text-center text-xs font-medium leading-4 font-['Pretendard_Variable']">
                                    <span className="text-[var(--foundation-neutral-560)]">
                                        해당 계정을 통해 표고에 로그인함으로써
                                        <br />
                                    </span>
                                    <span className="text-[var(--foundation-blue-500)]">
                                        개인정보 수집·이용
                                    </span>
                                    <span className="text-[var(--foundation-neutral-560)]"> 및 </span>
                                    <span className="text-[var(--foundation-blue-500)]">
                                        이용약관
                                    </span>
                                    <span className="text-[var(--foundation-neutral-560)]">
                                        에 동의하는 것으로 간주됩니다.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="cursor-pointer text-center text-base font-normal leading-0 text-[var(--foundation-neutral-white)] underline font-['Pretendard']"
                >
                    다음에 할래요
                </button>
            </div>
        </div>
    );
}
