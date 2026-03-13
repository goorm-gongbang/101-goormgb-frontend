/* ===========================
   티켓 상세 페이지 (껍데기)
   Route: /my/tickets/[id]
   - URL 파라미터 id로 특정 티켓 조회

   [TODO] 구현 시 작업 목록
   1. 티켓 상세 API 연동 (GET /api/tickets/:id)
   2. 티켓 정보 표시 (경기명, 날짜, 좌석, QR 등)
   3. 취소/환불 기능
   4. 브레드크럼: 마이페이지 > 티켓 관리 > 상세
=========================== */

type Props = {
    params: Promise<{ id: string }>;
};

export default async function TicketDetailPage({ params }: Props) {
    const { id } = await params;

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold">
                티켓 상세 — {id}
            </h1>
        </div>
    );
}
