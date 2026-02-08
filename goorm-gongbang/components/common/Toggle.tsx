"use client";

import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type ToggleProps = React.ComponentProps<typeof Switch>;

export function Toggle({ className, ...props }: ToggleProps) {
  return (
    <Switch
      {...props}
      className={cn(
        "w-9 h-5 rounded-[300px] overflow-hidden p-0",
        "data-[state=checked]:bg-[var(--foundation-primary-400)]",
        "data-[state=unchecked]:bg-[var(--foundation-neutral-680)]",
        className
      )}
    />
  );
}