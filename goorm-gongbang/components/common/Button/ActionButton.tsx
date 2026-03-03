import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

/* ===========================
   ActionButton
   - Primary, Secondary, Tertiary, Destructive 통합
   - tone, size, leftIcon, loading 지원
=========================== */

type Variant = "primary" | "secondary" | "tertiary" | "destructive";
type Tone = "strong" | "base" | "soft";
type Size = "lg" | "md" | "sm";

type ShadcnButtonProps = React.ComponentProps<typeof Button>;

type ActionButtonProps = Omit<ShadcnButtonProps, "size" | "variant"> & {
  variant?: Variant;
  tone?: Tone;
  size?: Size;
  leftIcon?: React.ReactNode;
  loading?: boolean;
};

/* ---------------------------
   Size Styles
--------------------------- */
const sizeStyles: Record<Size, string> = {
  lg: "h-10 min-w-20 px-4 py-2 text-sm",
  md: "h-9 min-w-20 px-4 py-2 text-sm",
  sm: "h-6 min-w-14 px-2 py-1 text-xs",
};

/* ---------------------------
   Variant + Tone Styles
--------------------------- */
const variantToneStyles: Record<Variant, Record<Tone, string>> = {
  primary: {
    strong:
      "bg-[var(--foundation-primary-600)] text-[var(--foundation-neutral-white)] hover:bg-[var(--foundation-primary-700)]",
    base:
      "bg-[var(--foundation-primary-500)] text-[var(--foundation-neutral-white)] hover:bg-[var(--foundation-primary-600)]",
    soft:
      "bg-[var(--foundation-primary-400)] text-[var(--foundation-neutral-white)] hover:bg-[var(--foundation-primary-500)]",
  },
  secondary: {
    strong:
      "bg-[var(--foundation-primary-10)] border border-[var(--foundation-primary-600)] text-[var(--foundation-primary-600)] hover:bg-[var(--foundation-primary-20)]",
    base:
      "bg-transparent border border-[var(--foundation-primary-500)] text-[var(--foundation-primary-500)] hover:bg-[var(--foundation-primary-10)]",
    soft:
      "bg-transparent border border-[var(--foundation-primary-400)] text-[var(--foundation-primary-400)] hover:bg-[var(--foundation-primary-10)]",
  },
  tertiary: {
    strong:
      "bg-transparent text-[var(--foundation-primary-600)] hover:bg-[var(--foundation-primary-10)]",
    base:
      "bg-transparent text-[var(--foundation-primary-500)] hover:bg-[var(--foundation-primary-10)]",
    soft:
      "bg-[var(--foundation-primary-10)] text-[var(--foundation-primary-500)] hover:bg-[var(--foundation-primary-20)]",
  },
  destructive: {
    strong:
      "bg-[var(--foundation-red-600)] text-[var(--foundation-neutral-white)] hover:bg-[var(--foundation-red-700)]",
    base:
      "bg-[var(--foundation-red-500)] text-[var(--foundation-neutral-white)] hover:bg-[var(--foundation-red-600)]",
    soft:
      "bg-[var(--foundation-red-400)] text-[var(--foundation-neutral-white)] hover:bg-[var(--foundation-red-500)]",
  },
};

const disabledStyles =
  "bg-[var(--background-interactive-neutral-disabled)] text-[var(--text-interactive-neutral-disabled)] cursor-not-allowed";

/* ---------------------------
   Component
--------------------------- */
export function ActionButton({
  variant = "primary",
  tone = "base",
  size = "lg",
  leftIcon,
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ActionButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Button
      disabled={isDisabled}
      className={cn(
        "rounded-md inline-flex justify-center items-center gap-2 font-['Pretendard'] font-medium leading-5 transition",
        sizeStyles[size],
        isDisabled ? disabledStyles : variantToneStyles[variant][tone],
        !isDisabled && "cursor-pointer",
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : leftIcon ? (
        <span className="flex-shrink-0 w-4 h-4">{leftIcon}</span>
      ) : null}
      <span className="text-center">{children}</span>
    </Button>
  );
}

/* ---------------------------
   Convenience Exports
   - 기존 컴포넌트명 호환용
--------------------------- */
export const PrimaryButton = (props: Omit<ActionButtonProps, "variant">) => (
  <ActionButton variant="primary" {...props} />
);

export const SecondaryButton = (props: Omit<ActionButtonProps, "variant">) => (
  <ActionButton variant="secondary" {...props} />
);

export const TertiaryButton = (props: Omit<ActionButtonProps, "variant">) => (
  <ActionButton variant="tertiary" {...props} />
);

export const DestructiveButton = (props: Omit<ActionButtonProps, "variant">) => (
  <ActionButton variant="destructive" {...props} />
);
