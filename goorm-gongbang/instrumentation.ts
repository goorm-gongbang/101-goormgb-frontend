/* ===========================
   -용도
   Next.js(서버 런타임)에서 OpenTelemetry(OTel) Trace를 자동 수집해서,
   OTLP(HTTP)로 Collector에 보내는 부트스트랩 파일.
=========================== */
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_DEPLOYMENT_ENVIRONMENT } from "@opentelemetry/semantic-conventions";

let sdk: NodeSDK | null = null; // SDK 인스턴스

export async function register() {

  if (process.env.NEXT_RUNTIME === "edge") return; // Edge 런타임 제외

  const exporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  });

  // NodeSDK 구성
  sdk = new NodeSDK({
    traceExporter: exporter,
    resource: resourceFromAttributes({
      [SEMRESATTRS_SERVICE_NAME]: "ticketing-frontend",
      [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]:
        process.env.NEXT_PUBLIC_ENV ?? "development",
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  await sdk.start();
}

export async function unregister() {
  await sdk?.shutdown();
}
