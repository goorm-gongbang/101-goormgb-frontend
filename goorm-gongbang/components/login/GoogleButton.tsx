import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

type ShadcnButtonProps = React.ComponentProps<typeof Button>;

type GoogleButtonProps = Omit<ShadcnButtonProps, "size" | "variant"> & {
    label?: string;
    fixedWidth?: "w-80" | "w-52";
    theme?: "light" | "dark";
    icon?: React.ReactNode;
};

const wrapperBase = "h-11 rounded-md inline-flex items-center justify-center overflow-hidden transition-colors border border-[var(--foundation-neutral-920)]";

const sizeStyles: Record<NonNullable<GoogleButtonProps["fixedWidth"]>, string> = {
    "w-80": "w-80",
    "w-52": "w-52",
};

const themeStyles: Record<NonNullable<GoogleButtonProps["theme"]>, string> = {
    light: "bg-white",
    dark: "bg-[var(--foundation-neutral-980)]",
};

const contentBase = "inline-flex items-center justify-center gap-3.5 px-3.5";
const iconWrap = "h-6 w-6 flex-shrink-0";
const textBase = "text-base font-medium font-['Roboto'] leading-6 text-black/50";
const disabledStyles = "cursor-not-allowed opacity-60";

function DefaultGoogleIcon() {
    return (
        <Image
            src="/login/google-logo.svg"
            alt=""
            width={6}
            height={6}
            className="h-6 w-6"
            priority
        />
    );
}

export function GoogleButton({
    label = "구글로 시작하기",
    fixedWidth = "w-80",
    theme = "light",
    icon,
    disabled,
    className,
    ...props
}: GoogleButtonProps) {
    return (
        <Button
            disabled={disabled}
            className={cn(
                wrapperBase,
                sizeStyles[fixedWidth],
                themeStyles[theme],
                disabled ? disabledStyles : "cursor-pointer hover:bg-black/5",
                className
            )}
            {...props}
        >
            <span className={contentBase}>
                <span className={iconWrap}>{icon ?? <DefaultGoogleIcon />}</span>
                <span className={textBase}>{label}</span>
            </span>
        </Button>
    );
}
