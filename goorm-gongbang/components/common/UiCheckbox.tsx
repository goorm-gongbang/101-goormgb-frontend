"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export type UiCheckboxProps = React.ComponentProps<typeof Checkbox>;

export function UiCheckbox({ className, ...props }: UiCheckboxProps) {
  return (
    <Checkbox
      {...props}
      className={cn(
        "h-4 w-4 rounded border",
        "data-[state=unchecked]:bg-transparent data-[state=unchecked]:border-[var(--foundation-primary-600)]",
        "data-[state=checked]:bg-[var(--foundation-primary-600)] data-[state=checked]:border-[var(--foundation-primary-600)] data-[state=checked]:text-[var(--light-primary-foreground)]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent",
        "disabled:data-[state=unchecked]:!border-[var(--foundation-neutral-600)]",
        "disabled:data-[state=checked]:!border-[var(--foundation-neutral-600)]",
        className
      )}
    />
  );
}
