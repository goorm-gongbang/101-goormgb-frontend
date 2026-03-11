"use client";
import { PrimaryButton } from "@/components/common/Button";

type RefundPolicyModalProps = {
  open: boolean;
  onClose: () => void;
};

export function RefundPolicyModal({ open, onClose }: RefundPolicyModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[950px] p-8 bg-white rounded-2xl inline-flex flex-col justify-start items-start gap-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="justify-center text-[var(--foundation-neutral-240)] text-xl font-bold font-['Pretendard'] leading-7">
          취소 수수료 및 환불 정책
        </div>

        <div className="self-stretch flex flex-col justify-start items-start gap-6">
          <div className="self-stretch flex flex-col justify-start items-start gap-2">
            <div className="self-stretch text-black text-lg font-medium font-['Pretendard'] leading-6">
              1. 취소 수수료
            </div>

            <div className="self-stretch pl-7">
              <div className="self-stretch border-t border-b border-zinc-400 overflow-hidden">
                <div className="w-full self-stretch pl-7 py-2.5 bg-zinc-100 inline-flex justify-center items-center gap-1.5">
                  <div className="flex-1 text-black text-sm font-normal font-['Pretendard'] leading-5">내용</div>
                  <div className="flex-1 text-black text-sm font-normal font-['Pretendard'] leading-5">취소 수수료</div>
                </div>
                <div className="w-full self-stretch pl-7 py-2.5 border-b border-neutral-200 inline-flex justify-center items-center gap-1.5">
                  <div className="flex-1 text-black text-sm font-normal font-['Pretendard'] leading-5">경기 7일 전</div>
                  <div className="flex-1 text-black text-sm font-normal font-['Pretendard'] leading-5">
                    취소 수수료 없음 (+ 예매 대행 수수료(예매 당일일 경우))
                  </div>
                </div>
                <div className="w-full self-stretch pl-7 py-2.5 border-b border-neutral-200 inline-flex justify-center items-center gap-1.5">
                  <div className="flex-1 text-black text-sm font-normal font-['Pretendard'] leading-5">경기 6일 전 ~ 경기 당일</div>
                  <div className="flex-1 text-black text-sm font-normal font-['Pretendard'] leading-5">
                    티켓 금액의 10% + 예매 대행 수수료
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="self-stretch flex flex-col justify-start items-start gap-2">
            <div className="self-stretch text-black text-lg font-medium font-['Pretendard'] leading-6">2. 환불 정책</div>
            <div className="self-stretch pl-7">
              <ul className="self-stretch list-disc text-black text-sm font-normal font-['Pretendard'] leading-5">
                <li>경기일자 및 좌석변경은 불가합니다.</li>
                <li>부분취소는 불가합니다. 기존 건을 전체취소후 재예매하셔야 하며, 취소좌석에 대한 좌석선점은 보장되지 않습니다.</li>
                <li>경기 7일 전 밤 12시 이전 취소 시에는 취소수수료가 부과되지 않습니다.</li>
                <li>예매 당일 취소의 경우만 예매 대행 수수료가 환불되며, 그 이후 취소 시 환불되지 않습니다.</li>
                <li>당일 경기 예매는 결제 이후 취소가 불가합니다.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="self-stretch inline-flex justify-center items-center gap-2">
          <PrimaryButton
            type="button"
            size="lg"
            tone="base"
            onClick={onClose}
            className="flex-1"
          >
            확인
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
