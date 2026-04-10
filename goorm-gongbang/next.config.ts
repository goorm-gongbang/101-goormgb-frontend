/** @type {import('next').NextConfig} */
const isProd = process.env.NEXT_PUBLIC_ENV === "production";
// 운영 환경일 때만 CDN 주소를 할당합니다.
const CDN_URL = "https://cdn.your-domain.com/";
const AI_RUNTIME_API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_API_URL ||
  ""
).replace(/\/$/, "");

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
      {
        protocol: "http",
        hostname: "k.kakaocdn.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "k.kakaocdn.net",
        pathname: "/**",
      },
    ],
  },

  // 기존 OTel 및 권장 설정 유지
  compress: true,
  poweredByHeader: false,
  // 브라우저 소스 맵 비활성화
  productionBrowserSourceMaps: false,

  // 보안 헤더 유지
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            // Report-Only: 위반 시 차단하지 않고 브라우저 콘솔에 로그만 출력
            // 검증 완료 후 "Content-Security-Policy"로 변경하여 강제 적용
            key: "Content-Security-Policy-Report-Only",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.your-domain.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.your-domain.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://assets.playball.one https://*.kakaocdn.net https://cdn.your-domain.com https://goormgb-assets.s3.ap-northeast-2.amazonaws.com",
              "connect-src 'self' https://api.playball.one https://api.staging.playball.one https://api.goormgb.space https://*.faro-collector.grafana.net",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
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
    NEXT_PUBLIC_API_BASE: AI_RUNTIME_API_BASE,
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV || "development",
    // Grafana Faro (프론트엔드 관측성)
    NEXT_PUBLIC_FARO_URL: process.env.NEXT_PUBLIC_FARO_URL || "",
    NEXT_PUBLIC_RELEASE: process.env.NEXT_PUBLIC_RELEASE || "1.0.0",
  },

  // API 프록시 설정 (로컬 개발 환경)
  async rewrites() {
    if (!AI_RUNTIME_API_BASE) {
      return [];
    }

    return [
      // AI Runtime API (/ai/*)
      {
        source: "/ai/:path*",
        destination: `${AI_RUNTIME_API_BASE}/ai/:path*`,
      },
    ];
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
