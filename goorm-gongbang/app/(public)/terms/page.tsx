"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function TermsPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#F5F5F5]">
            <div className="max-w-[1200px] mx-auto px-4 py-5">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="mb-8 text-[13px] font-medium text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors flex items-center gap-1"
                >
                    <ChevronLeft className="w-4 h-4" />
                    이전으로 돌아가기
                </button>

                <div className="bg-white rounded-xl border border-[#E8E8E8] px-6 py-8 md:px-10">
                    <div className="flex justify-between items-start mb-8">
                        <h1 className="text-2xl font-bold text-[#1A1A1A]">이용 약관</h1>
                        <span className="text-xs text-[#9E9E9E]">시행일: 2026년 2월 24일</span>
                    </div>

                    <p className="mb-10 text-[15px] leading-7 text-[#3D3D3D]">
                        본 약관은 Playball(이하 "서비스")의 이용 조건 및 절차에 관한 사항을 규정합니다. 서비스를 이용함으로써 본 약관에 동의한 것으로 간주됩니다.
                    </p>

                    <div className="space-y-10 text-[15px] leading-7 text-[#3D3D3D]">
                        <section>
                            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">제1조 (목적)</h2>
                            <p>본 약관은 Playball이 제공하는 스포츠 티켓 예매 및 추천 기반 트래픽 분산 서비스의 이용과 관련하여 서비스와 이용자 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.</p>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">제2조 (서비스 내용)</h2>
                            <ul className="list-decimal pl-5 space-y-2">
                                <li>스포츠 경기 일정 조회 및 티켓 예매 (좌석 맵 모드 및 추천 좌석 모드 제공)</li>
                                <li>온보딩 설문에 기반한 맞춤형 추천 좌석 산출 및 제공</li>
                                <li>티켓 결제(간편결제, 무통장 입금 등) 및 모바일 티켓(QR) 발급</li>
                                <li>예매 취소, 환불 처리 및 이용 내역 관리</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">제3조 (회원가입 및 계정)</h2>
                            <ul className="list-decimal pl-5 space-y-2">
                                <li>회원가입은 카카오 소셜 로그인을 통해 이루어집니다.</li>
                                <li>만 14세 미만 이용자는 서비스를 이용할 수 없습니다.</li>
                                <li>타인의 정보를 도용하거나 허위 정보로 가입할 경우 이용이 제한되거나 예매가 취소될 수 있습니다.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">제4조 (이용자의 의무 및 금지 행위)</h2>
                            <ul className="list-decimal pl-5 space-y-3">
                                <li><strong>비정상적 접근</strong>: 매크로, 봇 등 자동화 도구를 이용한 예매 시도</li>
                                <li><strong>부정 점유</strong>: 비정상적으로 다수의 좌석을 중복 점유(Hold)하는 행위</li>
                                <li><strong>불법 거래</strong>: 암표 재판매 또는 프리미엄을 얹은 양도 행위</li>
                                <li><strong>시스템 방해</strong>: 해킹, 데이터 임의 조작 등 정상적 운영 방해</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">제5조 (예매 및 좌석 Hold 정책)</h2>
                            <ul className="list-decimal pl-5 space-y-2">
                                <li>좌석 선택 성공 시 일정 시간(타이머) 동안 해당 좌석이 독점 배정됩니다.</li>
                                <li>유효 시간 내에 결제를 완료하지 않을 경우 Hold는 자동 해제됩니다.</li>
                                <li>동일 계정당 동시에 Hold할 수 있는 좌석은 1개로 제한됩니다.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">제6조 (결제, 취소 및 환불)</h2>
                            <ul className="list-decimal pl-5 space-y-2">
                                <li>무통장 입금 시 지정 기한 내 미입금 시 주문은 자동 취소됩니다.</li>
                                <li>예매 취소 시 구단 정책에 따라 취소 수수료가 부과될 수 있습니다.</li>
                                <li>구체적인 환불 방식은 PG사 및 금융기관의 기준을 따릅니다.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">제7조 (추천 서비스 및 면책 조항)</h2>
                            <ul className="list-decimal pl-5 space-y-2">
                                <li>'추천 좌석'은 예매 성공률 상승을 목적으로 하며, 반드시 최우선 좌석 확보를 보장하지 않습니다.</li>
                                <li>추천된 좌석이더라도 동시 접속 경합으로 Hold에 실패할 수 있습니다.</li>
                                <li>경기장 시야 정보 등은 구단 제공 데이터를 기반으로 하며 실제와 미세한 차이가 있을 수 있습니다.</li>
                            </ul>
                        </section>

                        <section className="bg-[#FAFAFA] rounded-xl p-6 border border-[#F0F0F0]">
                            <h2 className="text-base font-bold text-[#1A1A1A] mb-3">부칙</h2>
                            <p className="text-sm">본 약관은 2026년 2월 24일부터 시행됩니다.</p>
                            <p className="text-sm mt-1">문의: <a href="mailto:support@playball.one" className="text-[var(--foundation-primary-600)] hover:underline">support@playball.one</a></p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
