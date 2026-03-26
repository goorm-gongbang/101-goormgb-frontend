/** @type {import('next').NextConfig} */
const isProd = process.env.NEXT_PUBLIC_ENV === "production";
// 운영 환경일 때만 CDN 주소를 할당합니다.
const CDN_URL = "https://cdn.your-domain.com/";

const nextConfig = {
  // 1. EKS 배포를 위한 독립 실행형 빌드 설정
  output: "standalone",

  // 2. 운영 환경(Prod)에서만 정적 자산을 CDN에서 불러오도록 설정
  // 개발(Dev) 환경에서는 undefined가 되어 서버(Pod)가 직접 서빙합니다.
  assetPrefix: isProd ? CDN_URL : undefined,

  // 외부 이미지 도메인 허용 (S3 클럽 로고)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.playball.one",
        pathname: "/static/clubs/**",
      },
    ],
  },

  // 기존 OTel 및 권장 설정 유지
  compress: true,
  poweredByHeader: false,
  // staging에서만 sourcemap 활성화 (디버깅용)
  productionBrowserSourceMaps: process.env.NEXT_PUBLIC_ENV === "staging",

  // 보안 헤더 유지
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
      {
        source: "/api/metrics",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },

  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV || "development",
    OTEL_EXPORTER_OTLP_ENDPOINT:
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
      "http://otel-collector:4318/v1/traces",
    // Grafana Faro (프론트엔드 관측성)
    NEXT_PUBLIC_FARO_URL: process.env.NEXT_PUBLIC_FARO_URL || "",
    NEXT_PUBLIC_RELEASE: process.env.NEXT_PUBLIC_RELEASE || "1.0.0",
  },
};

export default nextConfig;

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   // OTel instrumentation.ts 활성화
//   // experimental: { instrumentationHook: true },

//   // 기본 권장
//   compress: true,
//   poweredByHeader: false,
//   productionBrowserSourceMaps: false,

//   // 보안 헤더
//   async headers() {
//     return [
//       {
//         source: "/:path*",
//         headers: [
//           { key: "X-Content-Type-Options", value: "nosniff" },
//           { key: "X-Frame-Options", value: "SAMEORIGIN" },
//           { key: "X-XSS-Protection", value: "1; mode=block" },
//         ],
//       },
//       // metrics는 캐시 금지 권장 (혹시 프록시가 캐시할 수도 있어서)
//       {
//         source: "/api/metrics",
//         headers: [{ key: "Cache-Control", value: "no-store" }],
//       },
//     ];
//   },

//   env: {
//     NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
//     NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV || "development",
//     OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://otel-collector:4318/v1/traces",
//   },
// };

// module.exports = nextConfig;
