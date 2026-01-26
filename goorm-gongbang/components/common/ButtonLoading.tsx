import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export function ButtonSpinner() {
    return (
        <div className="flex gap-2">
            <Button
                type="button"
                disabled
                className="
                    h-10 px-4 py-2
                    opacity-50
                    bg-[var(--foundation-neutral-400)]
                    rounded-md
                    inline-flex items-center justify-center
                    gap-0
                    pointer-events-none
                "
            >
                <span className="pr-2 flex items-center">
                    <Spinner
                        data-icon="inline-start"
                        className="h-4 w-4 text-[var(--foundation-neutral-960)]"
                    />
                </span>

                <span className="text-center justify-center text-[var(--primary-foreground)] text-sm font-medium font-['Inter'] leading-5">
                    대기 중
                </span>
            </Button>
        </div>
    )
}
