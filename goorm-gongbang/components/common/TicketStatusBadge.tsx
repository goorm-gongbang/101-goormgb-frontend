type TicketStatus = "available" | "soldOut" | "upcoming";

type TicketStatusBadgeProps = {
  status: TicketStatus;
};

const STATUS_STYLE_MAP: Record<
  TicketStatus,
  {
    label: string;
    wrapperClassName: string;
    textClassName: string;
  }
> = {
  available: {
    label: "예매 가능",
    wrapperClassName:
      "bg-[var(--foundation-primary-10)] outline-[var(--foundation-primary-600)]",
    textClassName: "text-[var(--foundation-primary-600)]",
  },
  soldOut: {
    label: "매진",
    wrapperClassName:
      "bg-[var(--foundation-red-50)] outline-[var(--foundation-red-400)]",
    textClassName: "text-[var(--foundation-red-400)]",
  },
  upcoming: {
    label: "판매 예정",
    wrapperClassName:
      "bg-[var(--foundation-blue-50)] outline-[var(--foundation-blue-500)]",
    textClassName: "text-[var(--foundation-blue-500)]",
  },
};

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  const style = STATUS_STYLE_MAP[status];

  return (
    <div
      data-color={status}
      className={[
        "shrink-0 inline-flex h-6 items-center justify-center rounded-[100px] p-2 outline outline-1 outline-offset-[-1px]",
        style.wrapperClassName,
      ].join(" ")}
    >
      <div
        className={[
          "text-center text-xs font-semibold leading-4 font-['Pretendard_Variable']",
          style.textClassName,
        ].join(" ")}
      >
        {style.label}
      </div>
    </div>
  );
}
