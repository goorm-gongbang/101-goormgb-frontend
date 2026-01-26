import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

type ShadcnButtonProps = React.ComponentProps<typeof Button>;

type KakaoButtonProps = Omit<ShadcnButtonProps, "size" | "variant"> & {
    label?: string;
    fixedWidth?: boolean;
    contentPadding?: "6" | "20";
    bgVariant?: "kakao" | "yellow";
    icon?: React.ReactNode;
};

const wrapperBase = "h-11 px-3.5 rounded-md inline-flex justify-center items-center overflow-hidden transition-colors";

const innerBase = "flex justify-center items-center gap-2 overflow-hidden";

const iconWrap = "w-4 h-4 relative overflow-hidden";
const defaultIcon = (
    <Image
        src="/login/kakao-logo.svg"
        alt=""
        width={16}
        height={16}
        className="h-4 w-4"
        priority
    />
);

const textBase = "justify-end text-base font-semibold font-['Apple_SD_Gothic_Neo'] leading-6 text-[var(--kakao-text)]";

const bgStyles: Record<NonNullable<KakaoButtonProps["bgVariant"]>, string> = {
    kakao:
        "bg-[var(--bg-kakao-bg)] hover:bg-[var(--bg-kakao-bg-hover)]",
    yellow:
        "bg-[var(--foundation-yellow-500)] hover:bg-[var(--foundation-yellow-600)]",
};

const disabledStyles = "cursor-not-allowed opacity-60";

export function KakaoButton({
    label = "카카오로 시작하기",
    fixedWidth = false,
    contentPadding = "6",
    bgVariant = "kakao",
    icon,
    disabled,
    className,
    ...props
}: KakaoButtonProps) {
    return (
        <Button
            disabled={disabled}
            className={cn(
                wrapperBase,
                fixedWidth && "w-80",
                disabled
                    ? disabledStyles
                    : cn("cursor-pointer", bgStyles[bgVariant]),
                className
            )}
            {...props}
        >
            <div className={cn(innerBase, contentPadding === "20" ? "px-20" : "px-6")}>
                <div data-size="md" className={iconWrap}>
                    {icon ?? defaultIcon}
                </div>
                <span className={textBase}>{label}</span>
            </div>
        </Button>
    );
}
