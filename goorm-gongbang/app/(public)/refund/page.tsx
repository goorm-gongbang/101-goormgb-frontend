"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function RefundPolicyPage() {
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
                    <h1 className="text-2xl font-bold text-[#1A1A1A] mb-8">취소 · 환불 정책</h1>

                    <div className="space-y-10 text-[15px] leading-7 text-[#3D3D3D]">

                        {/* 취소 가능 기간 */}
                        <section>
                            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">1. 취소 가능 기간</h2>
                            <p className="mb-4">취소 가능 여부는 경기 당일 기준으로 판단합니다. 경기 당일은 취소·환불이 불가하며, 전일(D-1)까지만 취소 가능합니다.</p>

                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-[#F0F0F0] text-sm">
                                    <thead>
                                        <tr className="bg-[#FAFAFA]">
                                            <th className="border border-[#F0F0F0] px-4 py-3 text-left font-bold text-[#1A1A1A]">취소 시점</th>
                                            <th className="border border-[#F0F0F0] px-4 py-3 text-left font-bold text-[#1A1A1A]">취소 수수료</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="border border-[#F0F0F0] px-4 py-3">예매일 포함 경기 7일 전까지</td>
                                            <td className="border border-[#F0F0F0] px-4 py-3 text-[var(--foundation-primary-600)] font-medium">없음 (전액 환불)</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-[#F0F0F0] px-4 py-3">경기 6일 전 ~ 1일 전</td>
                                            <td className="border border-[#F0F0F0] px-4 py-3">티켓 금액의 10% + 예매 대행 수수료</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-[#F0F0F0] px-4 py-3">경기 당일</td>
                                            <td className="border border-[#F0F0F0] px-4 py-3 text-[var(--foundation-red-500)] font-medium">취소 불가</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <p className="mt-4 text-sm text-[#7A7A7A]">
                                ※ &quot;경기 N일 전&quot; 기준은 취소 요청 시간이 아닌 <strong className="text-[#3D3D3D]">취소 요청 날짜(자정 기준 0시)</strong>로 판단합니다.<br />
                                ※ 예매 대행 수수료는 예매 시 고지된 수수료 금액을 그대로 적용합니다.
                            </p>
                        </section>

                        {/* 결제 수단별 환불 처리 */}
                        <section>
                            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">2. 결제 수단별 환불 처리</h2>

                            <div className="space-y-4">
                                <div className="bg-[#FAFAFA] rounded-xl p-5 border border-[#F0F0F0]">
                                    <h3 className="font-bold text-[#1A1A1A] mb-2">간편결제 (카카오페이 / 토스페이)</h3>
                                    <ul className="list-disc pl-5 space-y-1 text-sm">
                                        <li>취소 요청 승인 즉시 환불 처리</li>
                                        <li>실제 계좌/카드 반영은 카드사·PG 정책에 따라 1~3 영업일 소요될 수 있음</li>
                                    </ul>
                                </div>

                                <div className="bg-[#FAFAFA] rounded-xl p-5 border border-[#F0F0F0]">
                                    <h3 className="font-bold text-[#1A1A1A] mb-2">무통장 입금</h3>
                                    <ul className="list-disc pl-5 space-y-1 text-sm">
                                        <li>취소 요청 승인 후 <strong>영업일 3일 이내</strong> 등록된 계좌로 환불금 입금</li>
                                        <li>환불 계좌는 취소 요청 시점에 직접 입력</li>
                                        <li>처리 결과는 마이페이지 &gt; 티켓 관리에서 확인 가능</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 무통장 입금 기한 및 자동 취소 */}
                        <section>
                            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">3. 무통장 입금 기한 및 자동 취소</h2>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-bold text-[#1A1A1A] mb-2">입금 기한</h3>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li><strong>일반 예매</strong>: 예매 완료 익일(+1일) 23시 59분까지</li>
                                        <li><strong>경기 당일 예매</strong>: 경기 시작 3시간 전까지 (이후 무통장 입금 결제 불가)</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-bold text-[#1A1A1A] mb-2">미입금 자동 취소</h3>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>입금 기한 초과 시 주문 상태가 <strong>자동 취소</strong>로 전환됩니다.</li>
                                        <li>자동 취소 시 수수료 없이 전액 환불 처리 (입금 미완료 상태이므로)</li>
                                        <li>자동 취소 전 알림이 발송됩니다.</li>
                                    </ul>
                                </div>

                                <p className="text-sm text-[#7A7A7A]">
                                    ※ 입금 후 잔액 반영까지 약 20분~1시간 소요될 수 있습니다. 반영 전 상태는 마이페이지에서 &quot;결제 대기&quot;로 표시됩니다.
                                </p>
                            </div>
                        </section>

                        {/* 취소 불가 케이스 */}
                        <section>
                            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">4. 취소 불가 케이스</h2>

                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-[#F0F0F0] text-sm">
                                    <thead>
                                        <tr className="bg-[#FAFAFA]">
                                            <th className="border border-[#F0F0F0] px-4 py-3 text-left font-bold text-[#1A1A1A]">케이스</th>
                                            <th className="border border-[#F0F0F0] px-4 py-3 text-left font-bold text-[#1A1A1A]">사유</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="border border-[#F0F0F0] px-4 py-3">경기 당일 취소 요청</td>
                                            <td className="border border-[#F0F0F0] px-4 py-3">당일 취소 정책</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-[#F0F0F0] px-4 py-3">이미 사용된 티켓 (QR 인증 완료)</td>
                                            <td className="border border-[#F0F0F0] px-4 py-3">입장 처리 완료</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-[#F0F0F0] px-4 py-3">취소 처리 진행 중인 건</td>
                                            <td className="border border-[#F0F0F0] px-4 py-3">중복 요청 방지</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* 부분 취소 정책 */}
                        <section>
                            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">5. 부분 취소 정책</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>동일 주문 내 일부 매수만 선택적 취소는 <strong>지원하지 않습니다.</strong></li>
                                <li>취소는 <strong>주문 단위 전체 취소</strong>만 가능합니다.</li>
                                <li>2매 이상 예매 후 일부만 취소하려는 경우 → 전체 취소 후 재예매를 이용해 주세요.</li>
                            </ul>
                        </section>

                        <section className="bg-[#FAFAFA] rounded-xl p-6 border border-[#F0F0F0]">
                            <h2 className="text-base font-bold text-[#1A1A1A] mb-2">문의</h2>
                            <p className="text-sm">취소 및 환불 관련 문의는 마이페이지 &gt; 1:1 문의를 통해 접수해 주세요.</p>
                            <p className="text-sm mt-1">이메일: <a href="mailto:support@playball.one" className="text-[var(--foundation-primary-600)] hover:underline">support@playball.one</a></p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
