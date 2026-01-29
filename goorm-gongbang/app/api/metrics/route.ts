/* ===========================
   api/metrics

   -용도
   Prometheus가 긁어갈 
   매트릭 엔드포인트를 만드는 Route Handler.
=========================== */
import { NextResponse } from "next/server";
import { getRegistry, initMetrics } from "@/lib/server/metrics";

export const runtime = "nodejs"; // prom-client는 node 런타임 권장

export async function GET() {
    /*
        process cpu/mem
        nodejs heap/gc
        event loop lag
        기본 지표 수집 시작
    */
  initMetrics();
  const registry = getRegistry(); // 같은 레지스트리를 쓰게 해서 지표가 누적/일관되게 나옴.
  const metrics = await registry.metrics(); // 메트릭 문자열 만들기

  return new NextResponse(metrics, {
    status: 200,
    headers: {
      "Content-Type": registry.contentType,
      "Cache-Control": "no-store",
    },
  });
}
