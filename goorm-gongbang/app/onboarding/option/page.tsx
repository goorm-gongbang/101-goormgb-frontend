"use client";
import { useState } from "react";
import { ChipButton } from "@/components/common/ChipButton";
import { useRouter} from "next/navigation";
import { TertiaryButton } from "@/components/common/TertiaryButton";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { SecondaryButton } from "@/components/common/SecondaryButton";

type ViewTypePreference = "통로 선호" | "중앙 선호" | "무관";
type EnvPreference = "그늘 선호" | "햇빛 무관" | "무관";
type MoodPreference = "열정적인 응원" | "조용한 관람" | "무관";
type DistPreference = "안전망 민감" | "난간·기둥 민감" | "보통" | "둔감";
type PricePreference = "~ 13,000원" | "14,000원 ~ 17,000원" | "18,000원 ~ 29,000원" | "30,000원 ~ " | "무관";

const viewTypeOptions: ViewTypePreference[] = ["통로 선호", "중앙 선호", "무관"];
const envOptions: EnvPreference[] = ["그늘 선호", "햇빛 무관", "무관"];
const moodOptions: MoodPreference[] = ["열정적인 응원", "조용한 관람", "무관"];
const distOptions: DistPreference[] = ["안전망 민감", "난간·기둥 민감", "보통", "둔감"];
const priceOptions: PricePreference[] = ["~ 13,000원", "14,000원 ~ 17,000원", "18,000원 ~ 29,000원", "30,000원 ~ ", "무관"];

/* Chip */
function Chip({ label, click, onClick }: {
    click: boolean;
    label: string; // 글자 데이터
    onClick: () => void;
}) {
    return (
        <ChipButton
            uiSize="lg"
            tone={click ? "strong" : "soft"}
            onClick={onClick}
            aria-pressed={click}
        >
            {label}
        </ChipButton>
    );
}

function toggleSingle<T>(prev: T | null, next: T): T | null {
    return prev === next ? null : next;
}

export default function SeatStyleOnboardingOptionPage() {
    const router = useRouter();

    const [viewType, setViewType] = useState<ViewTypePreference | null>(null);
    const [env, setEnv] = useState<EnvPreference | null>(null);
    const [mood, setMood] = useState<MoodPreference | null>(null);
    const [dist, setDist] = useState<DistPreference | null>(null);
    const [price, setPrice] = useState<PricePreference | null>(null);

    /* 이전 버튼 클릭 */
    const handlePrev = () => {
        console.log("handlePrev click");
        //router.push("/");
    }

    /* 시작하기 버튼 클릭 */
    const handleNext = () => {
        console.log("handlenext click");
        //router.push("/");
    };

    /* 건너뛰기 버튼 클릭 */
    const handleSkip = () => {
        console.log("handleskip click");
        //router.push("/");
    }

    return (
        <div
            className="w-full min-h-screen overflow-hidden"
            style={{ background: "var(--background-grey, #FAFAFA)" }}
        >
            <div className="w-full min-h-screen flex flex-col lg:flex-row">
                {/* Left Copy 영역 */}
                <div className="w-full lg:w-1/2 flex items-center">
                    <div className="w-full px-6 sm:px-10 lg:px-20 py-12 lg:py-0">
                        <div className="inline-flex flex-col items-start gap-8 max-w-[524px]">
                            <div data-progress="1/2" className="inline-flex items-center gap-2">
                                <div
                                    className="w-24 h-2.5 rounded-full"
                                    style={{ background: "var(--foundation-neutral-900, #E6E6E6)" }}
                                />
                                <div
                                    className="w-24 h-2.5 rounded-full"
                                    style={{ background: "var(--foundation-primary-500, #00C292)" }}
                                />
                            </div>

                            <div className="self-stretch flex flex-col items-start gap-[5px]">
                                <div
                                    className="self-stretch text-2xl sm:text-3xl font-semibold leading-9 sm:leading-10"
                                    style={{ color: "var(--text-normal-n240, #3D3D3D)" }}
                                >
                                    선택 선호도를 알려주세요
                                </div>
                                <div
                                    className="self-stretch text-base sm:text-lg font-normal leading-6 sm:leading-7"
                                    style={{ color: "var(--text-normal-n240, #3D3D3D)" }}
                                >
                                    선택 항목은 추천 품질 개선 목적이며,
                                    <br />
                                    미입력 시 추천의 품질이 저하될 수 있습니다.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="w-full lg:w-1/2 bg-white overflow-hidden">
                    <div className="min-h-screen px-6 sm:px-10 lg:px-20 py-10 sm:py-16 lg:py-28 inline-flex flex-col justify-between w-full">
                        <div className="self-stretch flex flex-col items-start gap-12 lg:gap-16">
                            {/* Sections */}
                            <div className="self-stretch flex flex-col items-start gap-8">
                                {/* Section 1 */}
                                <section className="self-stretch flex flex-col items-start gap-4">
                                    <div className="self-stretch flex flex-col items-start gap-1.5">
                                        <div className="self-stretch inline-flex items-start gap-2">
                                            <div className="text-base sm:text-lg font-semibold leading-6 text-black">
                                                좌석 타입 선호가 있나요?
                                            </div>
                                        </div>
                                        <div className="self-stretch inline-flex items-center gap-2">
                                            <div className="flex-1 text-sm font-medium leading-5 text-black">
                                                이동 편의나 시야 차이를 고려할 수 있어요.
                                            </div>
                                        </div>
                                    </div>

                                    <div className="self-stretch inline-flex items-center gap-1.5 flex-wrap">
                                        {viewTypeOptions.map((opt) => (
                                            <Chip key={opt} label={opt} click={viewType === opt} onClick={() => setViewType((prev) => toggleSingle(prev, opt))} />
                                        ))}
                                    </div>
                                </section>

                                {/* Section 2 */}
                                <section className="self-stretch flex flex-col items-start gap-4">
                                    <div className="self-stretch flex flex-col items-start gap-1.5">
                                        <div className="self-stretch inline-flex items-start gap-2">
                                            <div className="text-base sm:text-lg font-semibold leading-6 text-black">
                                                관람 환경에 대한 선호가 있나요?
                                            </div>
                                        </div>
                                        <div className="self-stretch inline-flex items-center gap-2">
                                            <div className="flex-1 text-sm font-medium leading-5 text-black">
                                                햇빛 여부에 따라 체감이 달라질 수 있어요.
                                            </div>
                                        </div>
                                    </div>

                                    <div className="self-stretch inline-flex items-center gap-1.5 flex-wrap">
                                        {envOptions.map((opt) => (
                                            <Chip key={opt} label={opt} click={env === opt} onClick={() => setEnv((prev) => toggleSingle(prev, opt))} />
                                        ))}
                                    </div>
                                </section>

                                {/* Section 3 */}
                                <section className="self-stretch flex flex-col items-start gap-4">
                                    <div className="self-stretch flex flex-col items-start gap-1.5">
                                        <div className="self-stretch inline-flex items-start gap-2">
                                            <div className="text-base sm:text-lg font-semibold leading-6 text-black">
                                                관람 분위기는 어떤 쪽이 좋으신가요?
                                            </div>
                                        </div>
                                        <div className="self-stretch inline-flex items-center gap-2">
                                            <div className="flex-1 text-sm font-medium leading-5 text-black">
                                                응원 강도와 주변 소음 수준에 영향을 줘요.
                                            </div>
                                        </div>
                                    </div>

                                    <div className="self-stretch inline-flex items-center gap-1.5 flex-wrap">
                                        {moodOptions.map((opt) => (
                                            <Chip key={opt} label={opt} click={mood === opt} onClick={() => setMood((prev) => toggleSingle(prev, opt))} />
                                        ))}
                                    </div>
                                </section>

                                {/* Section 4 */}
                                <section className="self-stretch flex flex-col items-start gap-4">
                                    <div className="self-stretch flex flex-col items-start gap-1.5">
                                        <div className="self-stretch inline-flex items-start gap-2">
                                            <div className="text-base sm:text-lg font-semibold leading-6 text-black">
                                                시야 방해 요소에 얼마나 민감하신가요?
                                            </div>
                                        </div>
                                        <div className="self-stretch inline-flex items-center gap-2">
                                            <div className="flex-1 text-sm font-medium leading-5 text-black">
                                                안전망·난간 등 시야 요소를 고려해 추천해요.
                                            </div>
                                        </div>
                                    </div>

                                    <div className="self-stretch inline-flex items-center gap-1.5 flex-wrap">
                                        {distOptions.map((opt) => (
                                            <Chip key={opt} label={opt} click={dist === opt} onClick={() => setDist((prev) => toggleSingle(prev, opt))} />
                                        ))}
                                    </div>
                                </section>

                                {/* Section 5 */}
                                <section className="self-stretch flex flex-col items-start gap-4">
                                    <div className="self-stretch flex flex-col items-start gap-1.5">
                                        <div className="self-stretch inline-flex items-start gap-2">
                                            <div className="text-base sm:text-lg font-semibold leading-6 text-black">
                                                좌석 가격은 어떤 가격대를 원하시나요?
                                            </div>
                                        </div>
                                        <div className="self-stretch inline-flex items-center gap-2">
                                            <div className="flex-1 text-sm font-medium leading-5 text-black">
                                                동일한 좌석 조건일 경우에만 가격을 반영해요.
                                            </div>
                                        </div>
                                    </div>

                                    <div className="self-stretch inline-flex items-center gap-1.5 flex-wrap">
                                        {priceOptions.map((opt) => (
                                            <Chip key={opt} label={opt} click={price === opt} onClick={() => setPrice((prev) => toggleSingle(prev, opt))} />
                                        ))}
                                    </div>
                                </section>
                            </div>

                            {/* Bottom CTA */}
                            <div className="w-full inline-flex justify-between items-center">
                                <div>
                                    <TertiaryButton uiSize="md" tone="base" onClick={handlePrev}>이전</TertiaryButton>
                                </div>
                                <div className="self-stretch flex justify-center items-center gap-4">
                                    <div>
                                        <PrimaryButton uiSize="lg" tone="base" onClick={handleNext}>시작하기</PrimaryButton>
                                    </div>
                                    <div>
                                        <SecondaryButton uiSize="lg" tone="base" onClick={handleSkip}>건너뛰기</SecondaryButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
