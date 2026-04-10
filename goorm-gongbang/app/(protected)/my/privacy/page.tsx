/* ===========================
   개인정보 처리방침 페이지
   Route: /my/privacy
   - 브레드크럼: 마이페이지 > 개인정보 처리방침
   - 이전으로 돌아가기 버튼 포함
   - 개인정보 처리방침.md 내용 반영
=========================== */

"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#F5F5F5]">
            {/* ─── 상단 헤더 (breadcrumb) ─── */}
            <div className="sticky top-0 z-10 bg-white border-b border-[#F0F0F0]">
                <div className="max-w-[1200px] mx-auto px-4 h-12 flex items-center justify-end">
                    <nav className="flex items-center gap-1.5 text-xs text-[#9E9E9E]">
                        <button
                            type="button"
                            onClick={() => router.push("/my")}
                            className="hover:text-[#1A1A1A] transition-colors"
                        >
                            마이페이지
                        </button>
                        <span>&gt;</span>
                        <span className="text-[#1A1A1A] font-medium">개인정보 처리방침</span>
                    </nav>
                </div>
            </div>

            {/* ─── 본문 ─── */}
            <div className="max-w-[1200px] mx-auto px-4 py-5">
                {/* 이전으로 돌아가기 */}
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="mb-8 text-[13px] font-medium text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors flex items-center gap-1"
                >
                    <ChevronLeft className="w-4 h-4" />
                    이전으로 돌아가기
                </button>

                <div className="bg-white rounded-xl border border-[#E8E8E8] px-6 py-8 md:px-10">
                    <h1 className="text-2xl font-bold text-[#1A1A1A] mb-8">개인정보 처리방침</h1>

                    <div className="space-y-8 text-[15px] leading-7 text-[#3D3D3D]">
                        <section>
                            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">1. 수집하는 개인정보 항목</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-bold text-[#1A1A1A] mb-2">1-1. 카카오 소셜 로그인을 통해 수집하는 정보</h3>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>카카오 계정 고유 식별자(ID)</li>
                                        <li>프로필 닉네임</li>
                                        <li>프로필 이미지 URL</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#1A1A1A] mb-2">1-2. 서비스 이용 및 예매 과정에서 생성·수집되는 정보</h3>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li><strong>예매자 확인 정보</strong>: 이름, 이메일 주소, 연락처(휴대폰 번호), 생년월일</li>
                                        <li><strong>선호 데이터(추천 서비스용)</strong>: 좌석 스타일, 관람 높이, 구역 위치, 통로/중앙 선호, 응원 성향, 시야 방해 민감도, 선호 가격대 등</li>
                                        <li><strong>예매 및 결제 정보</strong>: 예매 번호, 좌석 정보(구역/열/번호), 모바일 티켓(QR) 발급 데이터, 결제 수단, 결제 금액, 환불 내역 등</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#1A1A1A] mb-2">1-3. 자동으로 수집되는 정보 (트래픽 제어 및 보안)</h3>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li><strong>서비스 이용 로그</strong>: 접속 일시, 방문 페이지, 예매 시도 기록(Hold 요청 등), 추천 좌석 클릭 및 노출 이벤트</li>
                                        <li><strong>기기 및 보안 정보</strong>: 기기 유형(모바일/웹), 브라우저 정보, 세션 ID 등</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">2. 개인정보 수집 방법</h2>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>카카오 OAuth 2.0 인증을 통한 수집</li>
                                <li>서비스 이용 과정에서 이용자가 직접 입력(온보딩 설문, 주문서 작성, 1:1 문의 등)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">3. 개인정보 이용 목적</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>회원 식별 및 추천 서비스 제공</strong>: 사용자 맞춤형 추천 좌석 산출, 추천 결과 재계산 및 선호 데이터 관리</li>
                                <li><strong>예매 및 결제 처리</strong>: 좌석 Hold(임시 확보), 주문 생성, 결제 승인 및 취소/환불 처리</li>
                                <li><strong>대규모 트래픽 제어</strong>: 예매 오픈 시 대기열 관리, 동일 사용자 중복 Hold 제한, 매크로/봇 차단</li>
                                <li><strong>고객 지원</strong>: 티켓 상세 정보 제공, 모바일 티켓(QR) 발급, 1:1 문의 응대 및 공지사항 전달</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">4. 개인정보의 제3자 제공 및 위탁</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-bold text-[#1A1A1A] mb-2">4-1. 제3자 제공</h3>
                                    <p className="mb-2">서비스는 원활한 경기 관람을 위해 아래와 같이 개인정보를 제공합니다.</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li><strong>제공받는 자</strong>: 예매한 경기의 주최 구단 및 예매 운영 대행사</li>
                                        <li><strong>제공 목적</strong>: 경기장 입장 확인, 현장 CS 처리, 해당 구단 멤버십 확인</li>
                                        <li><strong>제공 항목</strong>: 예매자 성명, 연락처, 예매번호, 좌석 정보</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#1A1A1A] mb-2">4-2. 처리 위탁</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse border border-[#F0F0F0] text-sm">
                                            <thead>
                                                <tr className="bg-[#FAFAFA]">
                                                    <th className="border border-[#F0F0F0] px-4 py-2 text-left">업체</th>
                                                    <th className="border border-[#F0F0F0] px-4 py-2 text-left">위탁 내용</th>
                                                    <th className="border border-[#F0F0F0] px-4 py-2 text-left">보유 기간</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="border border-[#F0F0F0] px-4 py-2 font-bold">카카오</td>
                                                    <td className="border border-[#F0F0F0] px-4 py-2">소셜 로그인 인증</td>
                                                    <td className="border border-[#F0F0F0] px-4 py-2">카카오 정책에 따름</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-[#F0F0F0] px-4 py-2 font-bold">토스페이/카카오페이</td>
                                                    <td className="border border-[#F0F0F0] px-4 py-2">결제 승인 및 인증 처리</td>
                                                    <td className="border border-[#F0F0F0] px-4 py-2">관련 법령에 따름</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-[#F0F0F0] px-4 py-2 font-bold">Google Analytics</td>
                                                    <td className="border border-[#F0F0F0] px-4 py-2">서비스 이용 통계 분석</td>
                                                    <td className="border border-[#F0F0F0] px-4 py-2">14개월</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">5. 개인정보 보유 및 파기</h2>
                            <div className="space-y-4">
                                <p>수집 및 이용 목적이 달성된 개인정보는 지체 없이 파기합니다. 단, 관계 법령에 따라 보존 의무가 있는 경우 해당 기간 동안 보관합니다.</p>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse border border-[#F0F0F0] text-sm">
                                        <thead>
                                            <tr className="bg-[#FAFAFA]">
                                                <th className="border border-[#F0F0F0] px-4 py-2 text-left">보존 항목</th>
                                                <th className="border border-[#F0F0F0] px-4 py-2 text-left">근거 법령</th>
                                                <th className="border border-[#F0F0F0] px-4 py-2 text-left">보존 기간</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="border border-[#F0F0F0] px-4 py-2">계약·청약철회 기록</td>
                                                <td className="border border-[#F0F0F0] px-4 py-2">전자상거래법</td>
                                                <td className="border border-[#F0F0F0] px-4 py-2">5년</td>
                                            </tr>
                                            <tr>
                                                <td className="border border-[#F0F0F0] px-4 py-2">대금 결제 및 재화 공급</td>
                                                <td className="border border-[#F0F0F0] px-4 py-2">전자상거래법</td>
                                                <td className="border border-[#F0F0F0] px-4 py-2">5년</td>
                                            </tr>
                                            <tr>
                                                <td className="border border-[#F0F0F0] px-4 py-2">소비자 불만/분쟁 처리</td>
                                                <td className="border border-[#F0F0F0] px-4 py-2">전자상거래법</td>
                                                <td className="border border-[#F0F0F0] px-4 py-2">3년</td>
                                            </tr>
                                            <tr>
                                                <td className="border border-[#F0F0F0] px-4 py-2">서비스 접속 로그</td>
                                                <td className="border border-[#F0F0F0] px-4 py-2">통신비밀보호법</td>
                                                <td className="border border-[#F0F0F0] px-4 py-2">3개월</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#1A1A1A] mb-2">회원 탈퇴 시 처리 기준</h3>
                                    <ul className="list-disc pl-5 space-y-1 text-sm">
                                        <li><strong>즉시 파기</strong>: 카카오 연결 정보, 온보딩 선호 데이터, 추천 서비스 이용 이력 등</li>
                                        <li><strong>탈퇴 제한</strong>: 유효한 티켓 보유 또는 환불/정산 처리 중인 경우 처리가 완료될 때까지 탈퇴 불가</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">6. 이용자의 권리</h2>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>자신의 개인정보 열람 및 수정 요청</li>
                                <li>예매 및 결제 내역 확인</li>
                                <li>회원 탈퇴 요청</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">7. 개인정보 보호 담당자</h2>
                            <div className="bg-[#FAFAFA] rounded-xl p-5 border border-[#F0F0F0]">
                                <ul className="space-y-1">
                                    <li><span className="font-bold">서비스명:</span> 플레이볼 (Playball)</li>
                                    <li><span className="font-bold">이메일:</span> <a href="mailto:support@playball.one" className="text-[var(--foundation-primary-600)] hover:underline">support@playball.one</a></li>
                                </ul>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
