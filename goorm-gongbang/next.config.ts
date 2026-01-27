/** @type {import('next').NextConfig} */
const nextConfig = {
  // OTel instrumentation.ts 활성화
  // experimental: { instrumentationHook: true },

  // 기본 권장
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  // 보안 헤더
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
      // metrics는 캐시 금지 권장 (혹시 프록시가 캐시할 수도 있어서)
      {
        source: "/api/metrics",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV || "development",
    OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://otel-collector:4318/v1/traces",
  },
};

module.exports = nextConfig;
