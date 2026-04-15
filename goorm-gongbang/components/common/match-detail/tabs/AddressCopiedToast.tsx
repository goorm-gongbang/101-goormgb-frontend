"use client";

import { CircleCheck } from "lucide-react";

type Props = {
    message?: string;
};

export function AddressCopiedToast({
    message = "\uC8FC\uC18C\uAC00 \uBCF5\uC0AC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
}: Props) {
    return (
        <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2">
            <div className="inline-flex flex-col items-start justify-start gap-5 rounded-2xl bg-[var(--background-white)] p-4 outline outline-1 outline-offset-[-1px] outline-[var(--foundation-primary-500)]">
                <div className="inline-flex items-center justify-start gap-4 rounded-lg px-3">
                    <div className="flex h-6 w-6 items-center justify-start">
                        <div className="relative h-4 w-4 overflow-hidden">
                            <CircleCheck className="absolute left-[0.94px] top-[0.94px] h-3.5 w-3.5 text-[var(--foundation-primary-500)]" />
                        </div>
                    </div>
                    <div className="flex items-end justify-start gap-2 overflow-hidden">
                        <div className="text-[var(--text-normal-n240)] text-xl font-normal font-['Pretendard'] leading-7">
                            {message}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
