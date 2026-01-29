/* ===========================
    API 서버 요청할 때 쓰는 래퍼
=========================== */

/* 백엔드 호출시간, 백엔드 호출 발생 총량, 라벨 카디널리티 폭발 방지 */
import { apiCallDuration, apiCallTotal, normalizePath } from "@/lib/server/metrics";

export async function backendFetch(
    url: string, // 호출할 백엔드 URL
    init?: RequestInit // Fetch 옵션 (메서드, 헤더, 바디)
) {
    /* 요청 타이머 시작 */
    const endpoint = normalizePath(url);
    const start = Date.now();

    let status = "0";

    try {
        const res = await fetch(url, {
            ...init,
            cache: "no-store",
        });

        status = String(res.status);
        return res;
    } catch (err) {
        status = "error";
        throw err;
    } finally {
        /* 성공/실패 상관없이 매트릭 기록 */
        const durationSec = (Date.now() - start) / 1000;

        apiCallTotal
            .labels({ endpoint, status })
            .inc();

        apiCallDuration
            .labels({ endpoint, status })
            .observe(durationSec);
    }
}
