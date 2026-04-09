"use client";

export function MatchRecommendTab() {
  return (
    <div className="w-full inline-flex flex-col justify-start items-start gap-4">
      {/* 1 */}
      <section className="self-stretch flex flex-col justify-start items-start gap-2">
        <h3 className="self-stretch justify-center text-black text-lg font-medium font-['Pretendard'] leading-5">
          1. 추천 좌석이 뭔가요?
        </h3>
        <div className="self-stretch pl-7 flex flex-col justify-center items-start gap-1.5 list-disc">
          <div className="self-stretch text-black text-sm font-normal font-['Pretendard'] leading-5">
            추천좌석은 사전에 입력한 선호(구역/뷰/통로/응원/가격 등) 를 바탕으로, 현재 남아있는 좌석 중 조건에
            가장 잘 맞는 좌석을 1·2·3순위로 추천해드리는 기능입니다.
          </div>
          <div className="self-stretch text-black text-sm font-normal font-['Pretendard'] leading-5">
            추천 결과는 실시간 잔여 좌석/경합 상황에 따라 달라질 수 있습니다.
          </div>
        </div>
      </section>

      {/* 2 */}
      <section className="self-stretch flex flex-col justify-start items-start gap-2">
        <h3 className="self-stretch justify-center text-black text-lg font-medium font-['Pretendard'] leading-5">
          2. 어떻게 사용하나요?
        </h3>

        <div className="self-stretch pl-7 flex flex-col justify-center items-start gap-1.5">
          <ol className="self-stretch flex flex-col gap-1.5 list-decimal pl-5">
            <li className="self-stretch text-black text-sm font-normal font-['Pretendard'] leading-5">
              우측 패널의 “사용자 선호 좌석 추천” 토글을 ON으로 켜세요.
            </li>
            <li className="self-stretch text-black text-sm font-normal font-['Pretendard'] leading-5">
              인원 수(1~10매) 를 선택하면, 해당 인원에 맞는 추천 좌석이 갱신됩니다.
            </li>
            <li className="self-stretch text-black text-sm font-normal font-['Pretendard'] leading-5">
              추천 카드에서 마음에 드는 좌석을 선택한 뒤 [예매하기] 를 누르면 좌석 확보(Hold)를 시도합니다.
            </li>
          </ol>

          <ul className="self-stretch flex flex-col gap-1.5 list-disc pl-5">
            <li className="self-stretch text-black text-sm font-normal font-['Pretendard'] leading-5">
              토글을 OFF로 끄면 기존처럼 좌석맵에서 직접 선택할 수 있어요.
            </li>
          </ul>
        </div>
      </section>

      {/* 3 */}
      <section className="self-stretch flex flex-col justify-start items-start gap-2">
        <h3 className="self-stretch justify-center text-black text-lg font-medium font-['Pretendard'] leading-5">
          3. 추천 결과는 어떻게 보이나요?
        </h3>

        <ul className="self-stretch pl-7 flex flex-col justify-center items-start gap-1.5 list-disc">
          <li className="self-stretch text-black text-sm font-normal font-['Pretendard'] leading-5">
            추천은 보통 아래 탭으로 제공됩니다.
            <ul className="mt-1.5 flex flex-col gap-1.5 list-disc pl-5">
              <li className="text-black text-sm font-normal font-['Pretendard'] leading-5">
                1순위 / 2순위 / 3순위 / 전체
              </li>
            </ul>
          </li>
          <li className="self-stretch text-black text-sm font-normal font-['Pretendard'] leading-5">
            각 추천 카드는 아래 정보를 포함합니다.
            <ul className="mt-1.5 flex flex-col gap-1.5 list-disc pl-5">
              <li className="text-black text-sm font-normal font-['Pretendard'] leading-5">
                좌석 정보(구역/열/번)
              </li>
              <li className="text-black text-sm font-normal font-['Pretendard'] leading-5">
                총액 / 단가(원/매)
              </li>
              <li className="text-black text-sm font-normal font-['Pretendard'] leading-5">
                태그(예: 통로, 응원단, 하단, 시야좋음 등) → 선호 조건과 매칭된 포인트를 표시
              </li>
            </ul>
          </li>
          <li className="self-stretch text-black text-sm font-normal font-['Pretendard'] leading-5">
            토글을 OFF로 끄면 기존처럼 좌석맵에서 직접 선택할 수 있어요.
          </li>
        </ul>
      </section>

      {/* 4 */}
      <section className="self-stretch flex flex-col justify-start items-start gap-2">
        <h3 className="self-stretch justify-center text-black text-lg font-medium font-['Pretendard'] leading-5">
          4. 인원 수 / 연석 추천 정책
        </h3>

        <ul className="self-stretch pl-7 flex flex-col justify-center items-start gap-1.5 list-disc">
          <li className="self-stretch text-black text-sm font-normal font-['Pretendard'] leading-5">
            1~3매: 반드시 연석(붙어있는 좌석) 으로만 추천/확보를 시도합니다.
          </li>
          <li className="self-stretch text-black text-sm font-normal font-['Pretendard'] leading-5">
            4매 이상: 예매 상황에 따라 2인 묶음 단위 조합으로 추천될 수 있습니다.
          </li>
          <li className="self-stretch text-black text-sm font-normal font-['Pretendard'] leading-5">
            인원수 변경은 추천좌석 모드에서만 가능합니다.
          </li>
        </ul>
      </section>

      {/* 5 */}
      <section className="self-stretch flex flex-col justify-start items-start gap-2">
        <h3 className="self-stretch justify-center text-black text-lg font-medium font-['Pretendard'] leading-5">
          5. 새로고침 정책
        </h3>

        <ul className="self-stretch pl-7 flex flex-col justify-center items-start gap-1.5 list-disc">
          <li className="self-stretch text-black text-sm font-normal font-['Pretendard'] leading-5">
            추천 좌석이 방금 다른 사람에게 선점되었거나, 더 나은 후보를 다시 찾고 싶을 때 사용하세요.
          </li>
          <li className="self-stretch text-black text-sm font-normal font-['Pretendard'] leading-5">
            새로고침 시점의 잔여 좌석을 기준으로 추천이 재계산됩니다.
          </li>
          <li className="self-stretch text-black text-sm font-normal font-['Pretendard'] leading-5">
            만약 추천 가능한 좌석이 없으면, 안내 모달이 표시되고 좌석맵 모드로 전환됩니다.
          </li>
        </ul>
      </section>

      {/* 6 */}
      <section className="self-stretch flex flex-col justify-start items-start gap-2">
        <h3 className="self-stretch justify-center text-black text-lg font-medium font-['Pretendard'] leading-5">
          6. 유의사항
        </h3>

        <ul className="self-stretch pl-7 flex flex-col justify-center items-start gap-1.5 list-disc">
          <li className="self-stretch text-black text-sm font-normal font-['Pretendard'] leading-5">
            추천좌석은 “좋은 좌석”을 보장하기보다는, 선호 조건을 반영해 좌석 탐색을 빠르게 돕는 기능입니다.
            추천 결과는 실시간 재고와 경합 상황에 따라 수시로 바뀔 수 있습니다.
          </li>
          <li className="self-stretch text-black text-sm font-normal font-['Pretendard'] leading-5">
            동일 계정/세션에서 동시에 여러 좌석을 Hold하는 행위는 제한될 수 있습니다. (어뷰징 방지)
          </li>
          <li className="self-stretch text-black text-sm font-normal font-['Pretendard'] leading-5">
            일부 좌석만 Hold되는 경우는 허용하지 않고, 전체 좌석이 한 번에 확보되지 않으면 실패로 처리합니다.
          </li>
          <li className="self-stretch text-black text-sm font-normal font-['Pretendard'] leading-5">
            Hold 실패 시에는 사유 안내와 함께, 다른 추천 카드 선택 / 새로고침 / 좌석맵 전환으로 다시 시도할 수
            있습니다.
          </li>
        </ul>
      </section>
    </div>
  );
}
