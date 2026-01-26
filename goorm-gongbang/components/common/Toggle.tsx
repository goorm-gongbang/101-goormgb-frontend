import { Switch } from "@/components/ui/switch"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

export function Toggle() {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="switch-size-default"
        size="default"
        className="
          data-[state=checked]:bg-[var(--foundation-primary-400)]
          data-[state=unchecked]:bg-[var(--foundation-neutral-680)]
        "
      />
    </div>
  )
}

