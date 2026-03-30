"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const NOTICE_DATA = [
    {
        id: 1,
        isPinned: true,
        tag: "서비스 안내",
        tagColor: "primary",
        title: "[서비스 오픈] 플레이볼 정식 출시 안내",
        date: "2026.03.28",
        content: `[공지] 플레이볼이 정식 출시되었습니다 🎉

안녕하세요, 플레이볼입니다.
2026 KBO 정규시즌 개막과 함께 플레이볼이 정식 서비스를 시작합니다.

플레이볼은 기존 티켓팅의 가장 큰 불편함인 "좌석 선택 실패" 문제를 해결하기 위해 만들어진 KBO 티켓팅 플랫폼입니다. 원하는 좌석을 잡지 못해 반복적으로 재시도해야 했던 경험, 이제 플레이볼과 함께라면 달라집니다.

✅ 플레이볼의 핵심 기능
• 추천좌석 시스템: 나의 선호 구역을 기반으로 좌석을 추천하고, 블록을 선택하면 연석을 자동으로 배정합니다. 트래픽이 한 곳에 몰리는 구조 자체를 바꿔, 좌석 확보 성공률을 높입니다.
• 내블럭 설정: 내가 자주 앉는, 혹은 앉고 싶은 구역을 최대 10개까지 등록해두면 예매할 때마다 우선적으로 확인할 수 있습니다.
• 모바일 티켓(QR): 별도 출력 없이 앱에서 바로 QR 코드로 입장할 수 있습니다.
• 간편 결제: 카카오페이, 토스페이로 빠르게 결제할 수 있습니다.

✅ 현재 지원 구단 및 경기장
2026 시즌 기준 KBO 10개 구단 전체 홈경기를 지원합니다.
KIA(광주-기아 챔피언스 필드), 삼성(대구 삼성 라이온즈 파크), LG·두산(잠실야구장), KT(수원 KT 위즈 파크), SSG(인천 SSG 랜더스 필드), 롯데(사직야구장), 한화(한화생명 이글스 파크), NC(창원 NC 파크), 키움(고척 스카이돔)

✅ 서비스 이용 전 꼭 확인해주세요
플레이볼은 카카오 계정으로만 로그인이 가능합니다. 최초 로그인 후 선호 구역 설정(온보딩)을 완료해야 추천좌석 기능을 이용할 수 있습니다. 온보딩은 약 2~3분 내외로 완료할 수 있으며, 추후 마이페이지에서 언제든지 수정 가능합니다.

앞으로도 더 나은 티켓팅 경험을 위해 지속적으로 개선해 나가겠습니다.
즐거운 야구 시즌 되세요. ⚾

2026년 3월 28일
플레이볼 팀 드림`
    },
    {
        id: 2,
        isPinned: true,
        tag: "서비스 안내",
        tagColor: "primary",
        title: "[예매 안내] 2026 KBO 정규시즌 티켓 예매 오픈",
        date: "2026.03.28",
        content: `[공지] 2026 KBO 정규시즌 티켓 예매 안내

안녕하세요, 플레이볼입니다.
2026 KBO 정규시즌 티켓 예매가 시작됩니다. 예매 전 아래 내용을 꼭 확인해 주세요.

✅ 구단별 예매 오픈 일정
• KIA 타이거즈 (광주-기아 챔피언스 필드): 구단 공지 참고
• 삼성 라이온즈 (대구 삼성 라이온즈 파크): 구단 공지 참고
• LG 트윈스 (잠실야구장): 구단 공지 참고
• 두산 베어스 (잠실야구장): 구단 공지 참고
• KT 위즈 (수원 KT 위즈 파크): 구단 공지 참고
• SSG 랜더스 (인천 SSG 랜더스 필드): 구단 공지 참고
• 롯데 자이언츠 (사직야구장): 구단 공지 참고
• 한화 이글스 (한화생명 이글스 파크): 구단 공지 참고
• NC 다이노스 (창원 NC 파크): 구단 공지 참고
• 키움 히어로즈 (고척 스카이돔): 구단 공지 참고

※ 구단별 예매 오픈 일정은 각 구단 사정에 따라 변경될 수 있습니다. 최신 일정은 각 구단 공식 채널을 함께 확인해 주세요.

✅ 예매 전 준비사항
원활한 예매를 위해 아래 사항을 미리 준비해 주세요.
• 카카오 로그인 — 플레이볼은 카카오 계정으로만 로그인할 수 있습니다. 예매 전 로그인을 미리 완료해 두세요.
• 온보딩(선호 설정) 완료 — 최초 로그인 후 선호 구역 설정을 완료해야 추천좌석 기능을 이용할 수 있습니다. 온보딩을 완료하지 않으면 추천 모드 진입이 제한됩니다.
• 보안 인증(VQA) 사전 체험 — 예매 시 이미지 보안 인증이 진행됩니다. 경기 상세 페이지의 '보안 인증 체험하기' 버튼으로 미리 경험해 볼 수 있습니다.
• 결제 수단 확인 — 플레이볼은 카카오페이, 토스페이, 무통장입금을 지원합니다. 사용할 결제 수단을 미리 확인해 두세요.

✅ 예매 시 유의사항
• 1회 최대 구매 가능 매수는 10매입니다.
• 좌석 선택 후 Hold(임시 배정) 유효시간은 5분입니다. 유효시간 내 결제를 완료하지 않으면 좌석이 자동 해제됩니다.
• 예매 오픈 직후에는 대기열이 발생할 수 있습니다. 대기 중 앱을 종료하거나 브라우저를 이탈하면 대기 순서가 초기화될 수 있으니 주의해 주세요.
• 동일 경기에 대한 동시 Hold는 1건만 가능합니다.

2026년 3월 28일
플레이볼 팀 드림`
    },
    {
        id: 3,
        isPinned: false,
        tag: "정책",
        tagColor: "purple",
        title: "[이용 안내] 좌석 Hold 및 결제 관련 정책",
        date: "2026.03.28",
        content: `[공지] 좌석 Hold 및 결제 정책 안내

안녕하세요, 플레이볼입니다.
플레이볼의 좌석 Hold(임시 배정) 및 결제 정책을 안내드립니다. 예매 전 반드시 확인해 주세요.

✅ 좌석 Hold(임시 배정)란?
Hold는 사용자가 좌석을 선택한 시점부터 결제 완료 전까지 해당 좌석을 일시적으로 점유하는 기능입니다. Hold가 성공해야 결제 단계로 진입할 수 있으며, Hold 성공 = 좌석 확보를 의미합니다.

✅ Hold 유효시간
• Hold 유효시간은 5분입니다.
• 유효시간 내 결제를 완료하지 않으면 Hold가 자동으로 해제되고, 해당 좌석은 다른 사용자에게 공개됩니다.
• 주문서 및 결제 화면 상단의 타이머를 반드시 확인하며 진행해 주세요.

✅ Hold 관련 유의사항
• 동일 경기에 대해 동시에 Hold할 수 있는 좌석은 1건입니다. 이미 Hold 중인 좌석이 있는 경우 새로운 Hold 요청이 제한됩니다.
• Hold 실패 시 다른 블록 카드를 선택하거나 새로고침 후 재시도할 수 있습니다.
• 4인 이상 구매 시 연석이 2인 단위 묶음으로 자동 배정될 수 있습니다(예: 4인 → 2+2). 이는 보다 많은 사용자가 연석을 확보할 수 있도록 하기 위한 정책입니다.

✅ 결제 수단
플레이볼은 아래 결제 수단을 지원합니다.
• 카카오페이 / 토스페이 (승인 즉시 완료)
• 무통장입금 (입금 확인 후 완료, 기한 내 미입금 시 자동 취소)

✅ 무통장입금 이용 시 유의사항
• 무통장입금 선택 시 주문 상태가 '입금 대기'로 전환되며, 안내된 가상계좌로 지정 기한 내에 입금해야 예매가 확정됩니다.
• 기한 내 입금이 완료되지 않을 경우 주문이 자동으로 취소되며, 해당 좌석은 다시 판매 가능 상태로 전환됩니다.
• 입금자명은 반드시 주문 시 입력한 예매자명과 동일하게 입력해 주세요.

✅ 결제 실패 또는 취소 시
• 결제 실패 또는 사용자 취소 시, Hold 유효시간이 남아있는 경우에 한해 동일 좌석으로 재결제를 시도할 수 있습니다.
• Hold 유효시간이 만료된 경우에는 좌석 선택 화면으로 돌아가 처음부터 다시 시도해야 합니다.

2026년 3월 28일
플레이볼 팀 드림`
    },
    {
        id: 4,
        isPinned: false,
        tag: "정책",
        tagColor: "purple",
        title: "[이용 안내] 취소 및 환불 정책 안내",
        date: "2026.03.28",
        content: `[공지] 예매 취소 및 환불 정책 안내

안녕하세요, 플레이볼입니다.
플레이볼의 예매 취소 및 환불 정책을 안내드립니다. 예매 전 반드시 확인해 주세요.

✅ 취소 수수료 기준
• 경기 7일 전: 취소 수수료 없음 (예매 당일 취소 시 예매 대행 수수료까지 전액 환불)
• 경기 6일 전 ~ 전일: 티켓 금액의 10% + 예매 대행 수수료 발생
• 당일 경기: 결제 이후 취소 불가

※ 경기 7일 전 취소는 밤 12시 이전까지만 수수료 없이 취소 가능합니다.

✅ 취소 방법
1. 마이페이지 > 티켓 관리에서 취소할 티켓을 선택합니다.
2. '예매 취소' 버튼을 클릭하고 취소 요청을 완료합니다.
3. 취소 완료 시 티켓 상태가 '취소 처리 중'으로 변경됩니다.

✅ 환불 처리 기간
• 카카오페이 / 토스페이: 취소 완료 후 3~5 영업일 이내
• 무통장입금: 취소 완료 후 3~7 영업일 이내 (계좌 확인 후 처리)

✅ 취소/환불 불가 사항
• 경기일자 및 좌석 변경은 불가합니다. (취소 후 재예매 필요)
• 부분 취소는 불가합니다.
• 당일 경기 티켓은 결제 완료 이후 취소가 불가합니다.
• 이미 사용(입장)한 티켓은 취소 및 환불이 불가합니다.

✅ 문의
취소 및 환불 관련 문의는 마이페이지 > 고객센터 > 1:1 문의를 통해 접수해 주세요.

2026년 3월 28일
플레이볼 팀 드림`
    },
    {
        id: 5,
        isPinned: false,
        tag: "보안",
        tagColor: "orange",
        title: "[보안 안내] 보안 인증(VQA) 시스템 도입 안내",
        date: "2026.03.28",
        content: `[공지] 예매 보안 인증(VQA) 시스템 도입 안내

안녕하세요, 플레이볼입니다.
플레이볼은 매크로 및 자동화 프로그램을 통한 비정상 예매를 방지하고, 실제 관람을 원하는 팬분들이 더 공정하게 좌석을 확보할 수 있도록 이미지 기반 보안 인증(VQA, Visual Question Answering) 시스템을 도입합니다.

✅ 보안 인증이란?
VQA(Visual Question Answering)는 예매 진행 중 이미지를 보여주고 해당 이미지에 대한 질문에 답변하는 방식의 보안 인증입니다. 자동화 프로그램(매크로·봇)은 이미지를 인식하고 정확히 응답하기 어렵기 때문에, 정상 사용자와 비정상 시도를 효과적으로 구분합니다.

✅ 인증 절차
1. 예매 진행 중 보안 인증 화면이 나타납니다.
2. 화면에 표시된 이미지를 보고 질문에 맞는 답을 선택합니다.
3. 최대 3회 이내에 정답을 맞히면 인증이 통과됩니다. 3회 모두 실패 시 실패 처리됩니다.

✅ 유의사항
• 보안 인증은 예매 과정 중 자동으로 진행됩니다.
• Hold 유효시간(5분)이 인증 중에도 함께 카운트다운되므로 신속하게 답변해 주세요.

✅ 사전 체험하기
예매가 처음이거나 보안 인증이 낯선 분들을 위해 사전 체험 기능을 제공합니다. 경기 상세 페이지 하단의 '보안 인증 체험하기' 버튼을 통해 미리 경험해 볼 수 있습니다.

✅ 인증 오류 발생 시
네트워크 오류 등으로 문제가 발생할 경우 화면 내 재시도 버튼을 통해 다시 불러올 수 있습니다.

2026년 3월 28일
플레이볼 팀 드림`
    },
    {
        id: 6,
        isPinned: false,
        tag: "업데이트",
        tagColor: "blue",
        title: "PlayBall 앱 v1.0.1 성능 개선 업데이트 안내",
        date: "2026.03.28",
        content: `[공지] PlayBall 앱 v1.0.1 성능 개선 업데이트 안내

안녕하세요, 플레이볼입니다.
보다 쾌적한 예매 환경을 위해 앱 성능 최적화 업데이트를 진행했습니다.

✅ 업데이트 내용
• 앱 구동 속도 및 페이지 로딩 성능 개선
• 좌석 추천 알고리즘 정밀도 향상
• 기타 알려진 마이너 버그 수정

최신 버전(v1.0.1)으로 업데이트하여 더욱 빠르고 안정적인 서비스를 이용해 보세요.`
    }
];

function NoticeItem({ notice, isOpen, onToggle, isLast }: {
    notice: typeof NOTICE_DATA[0],
    isOpen: boolean,
    onToggle: () => void,
    isLast: boolean
}) {
    return (
        <div className={cn(!isLast && "border-b border-[#F0F0F0]")}>
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-center justify-between py-[22px] text-left hover:bg-gray-50/50 transition-colors group px-8"
            >
                <div className="flex items-center">
                    {/* 핀 아이콘 영역 */}
                    <div className="w-7 flex-shrink-0 flex items-center justify-center">
                        {notice.isPinned && (
                            <svg
                                className="w-4 h-4 text-[var(--foundation-primary-500)]"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6h2v-6h5v-2l-2-2z" />
                            </svg>
                        )}
                    </div>

                    {/* 뱃지 */}
                    <span
                        className={cn(
                            "inline-flex items-center justify-center px-[10px] py-[3px] rounded-full border text-[11px] font-bold whitespace-nowrap bg-white",
                            notice.tag === '서비스 안내' && "text-[var(--foundation-primary-500)] border-[var(--foundation-primary-500)]",
                            notice.tag === '보안' && "text-[var(--foundation-orange-500)] border-[var(--foundation-orange-500)]",
                            notice.tag === '업데이트' && "text-[var(--foundation-blue-500)] border-[var(--foundation-blue-500)]",
                            notice.tag === '정책' && "text-[var(--foundation-purple-500)] border-[var(--foundation-purple-500)]"
                        )}
                    >
                        {notice.tag}
                    </span>

                    {/* 제목 */}
                    <span className={cn(
                        "ml-[14px] text-[15px] font-bold transition-colors",
                        isOpen ? "text-[var(--foundation-primary-600)]" : "text-[#1A1A1A] group-hover:text-[var(--foundation-primary-600)]"
                    )}>
                        {notice.title}
                    </span>
                </div>

                {/* 날짜 & 화살표 */}
                <div className="flex items-center gap-[22px] ml-4">
                    <span className="text-[13px] font-medium text-[#ADADAD]">
                        {notice.date}
                    </span>
                    {isOpen ? (
                        <ChevronUp className="w-[18px] h-[18px] text-[#1A1A1A]" />
                    ) : (
                        <ChevronDown className="w-[18px] h-[18px] text-[#ADADAD] group-hover:text-[#1A1A1A]" />
                    )}
                </div>
            </button>

            {isOpen && (
                <div className="bg-[#FAFAFA] px-10 py-8 border-t border-[#F0F0F0]">
                    <div className="text-[15px] leading-[26px] text-[#3D3D3D] whitespace-pre-wrap font-medium">
                        {notice.content}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function NoticesPage() {
    const router = useRouter();
    const [openId, setOpenId] = useState<number | null>(null);

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
                        <span className="text-[#1A1A1A] font-medium">공지사항</span>
                    </nav>
                </div>
            </div>

            {/* ─── 본문 ─── */}
            <div className="max-w-[1200px] mx-auto px-4 py-8">
                {/* 이전으로 돌아가기 */}
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="mb-8 text-[13px] font-medium text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors flex items-center gap-1"
                >
                    <ChevronLeft className="w-4 h-4" />
                    이전으로 돌아가기
                </button>

                <div className="mb-8 ml-2">
                    <h1 className="flex items-baseline gap-3">
                        <span className="text-[32px] font-black tracking-tight text-[#1A1A1A]">공지사항</span>
                        <span className="text-[15px] font-medium text-[#9E9E9E]">총 {NOTICE_DATA.length}건</span>
                    </h1>
                </div>

                <div className="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden">
                    {NOTICE_DATA.map((item, idx) => (
                        <NoticeItem
                            key={item.id}
                            notice={item}
                            isOpen={openId === item.id}
                            onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                            isLast={idx === NOTICE_DATA.length - 1}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
