"use client"

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

function UiCheckbox({
  className,
  ...props
}: React.ComponentProps<typeof Checkbox>) {
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
  )
}

export function CheckboxDemo() {
  return (
    <FieldGroup className="max-w-sm">
      {/* 기본(미체크) */}
      <Field orientation="horizontal">
        <UiCheckbox id="terms-checkbox" name="terms-checkbox" />
        <Label htmlFor="terms-checkbox">Accept terms and conditions</Label>
      </Field>

      {/* 체크 */}
      <Field orientation="horizontal">
        <UiCheckbox
          id="terms-checkbox-2"
          name="terms-checkbox-2"
          defaultChecked
        />
        <FieldContent>
          <FieldLabel htmlFor="terms-checkbox-2">
            Accept terms and conditions
          </FieldLabel>
        </FieldContent>
      </Field>

      {/* disabled */}
      <Field orientation="horizontal">
        <UiCheckbox id="terms-checkbox-3" name="terms-checkbox-3" disabled />
        <Label htmlFor="terms-checkbox-3">Disabled</Label>
      </Field>
    </FieldGroup>
  )
}
