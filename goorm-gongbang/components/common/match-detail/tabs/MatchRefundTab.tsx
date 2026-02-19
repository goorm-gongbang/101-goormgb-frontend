"use client";

type CancelFeeRow = {
  label: string;
  fee: string;
};

const CANCEL_FEE_ROWS: CancelFeeRow[] = [
  {
    label: "경기 7일 전",
    fee: "취소 수수료 없음 (+ 예매 대행 수수료(예매 당일일 경우))",
  },
  {
    label: "경기 6일 전 ~ 경기 당일",
    fee: "티켓 금액의 10% + 예매 대행 수수료",
  },
];

export function MatchRefundTab() {
  return (
    <div className="w-full inline-flex flex-col justify-start items-start gap-4">
      {/* 취소 수수료 */}
      <div className="self-stretch flex flex-col justify-start items-start gap-2">
        <div className="self-stretch justify-center text-black text-lg font-medium font-['Pretendard'] leading-6">
          1. 취소 수수료
        </div>

        <div className="self-stretch pl-7 flex flex-col justify-start items-start overflow-hidden">
          <div className="self-stretch border-t border-b border-[#B7B7B7] flex flex-col justify-start items-start overflow-hidden">
            {/* table header */}
            <div className="self-stretch pl-7 py-2.5 bg-[#F3F3F3] inline-flex justify-center items-center gap-1.5">
              <div className="flex-1 justify-center text-black text-sm font-normal font-['Pretendard'] leading-5">
                내용
              </div>
              <div className="flex-1 justify-center text-black text-sm font-normal font-['Pretendard'] leading-5">
                취소 수수료
              </div>
            </div>

            {/* rows */}
            {CANCEL_FEE_ROWS.map((row) => (
              <div
                key={row.label}
                className="self-stretch pl-7 py-2.5 border-b border-[#E4E4E4] inline-flex justify-center items-center gap-1.5"
              >
                <div className="flex-1 justify-center text-black text-sm font-normal font-['Pretendard'] leading-5">
                  {row.label}
                </div>
                <div className="flex-1 justify-center text-black text-sm font-normal font-['Pretendard'] leading-5">
                  {row.fee}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 환불 정책 */}
      <div className="self-stretch flex flex-col justify-start items-start gap-2">
        <div className="self-stretch justify-center text-black text-lg font-medium font-['Pretendard'] leading-6">
          2. 환불 정책
        </div>

        <div className="self-stretch pl-7 flex flex-col justify-center items-center gap-1.5">
          <ol className="list-disc self-stretch justify-center text-black text-sm font-normal font-['Pretendard'] leading-5">
            <li className="text-black text-sm font-normal font-['Pretendard'] leading-5">
              경기일자 및 좌석변경은 불가합니다.
            </li>
            <li className="text-black text-sm font-normal font-['Pretendard'] leading-5">
              부분취소는 불가합니다. 기존 건을 전체취소후 재예매하셔야 하며, 취소좌석에 대한 좌석선점은
              보장되지 않습니다.
            </li>
            <li className="text-black text-sm font-normal font-['Pretendard'] leading-5">
              경기 7일 전 밤 12시 이전 취소 시에는 취소수수료가 부과되지 않습니다.
            </li>
            <li className="text-black text-sm font-normal font-['Pretendard'] leading-5">
              예매 당일 취소의 경우만 예매 대행 수수료가 환불되며, 그 이후 취소 시 환불되지 않습니다.
            </li>
            <li className="text-black text-sm font-normal font-['Pretendard'] leading-5">
              당일 경기 예매는 결제 이후 취소가 불가합니다.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
