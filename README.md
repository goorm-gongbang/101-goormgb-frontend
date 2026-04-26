# Playball Frontend

> Traffic-Master: 대규모 티켓팅 플랫폼  
> 15,000석 규모의 트래픽 폭주 상황을 제어하고 AI 매크로를 능동적으로 차단하는 야구 티켓팅 서비스입니다.

## 프로젝트 개요

| 항목 | 내용 |
| --- | --- |
| 프로젝트 명 | Playball |
| 주제 | Traffic-Master: 대규모 티켓팅 플랫폼 |
| 개발 기간 | 2026.03.03 ~ 2026.04.21 |
| 배포 사이트 | https://dev.playball.one/ |
| 프로젝트 인원 | 총 16명 |
| 프론트엔드 담당자 | 최광혁 |

Playball은 사용자가 날짜별 경기 일정을 확인하고, 구단 및 경기 상세 정보를 탐색한 뒤, 선호 좌석 추천과 결제 흐름까지 이어갈 수 있도록 구성된 야구 티켓팅 서비스입니다. 단순 예매 화면을 넘어, 대규모 동시 접속과 매크로 공격 상황을 기술적으로 통제하는 것을 목표로 합니다.

핵심 가치는 **뚫으려는 AI 매크로와 막으려는 AI 방패의 대규모 트래픽 전쟁**입니다. 프론트엔드는 사용자가 자연스럽게 예매를 진행할 수 있는 UI를 제공하면서, SVG 기반 좌석 렌더링, 생성형 보안 퀴즈(VQA), 대기열 및 결제 흐름, 관측성 연동을 통해 전체 티켓팅 전쟁의 사용자 접점을 담당합니다.

## 핵심 목표

- 15,000석 규모의 티켓팅 트래픽 폭주 상황 제어
- AI 매크로 및 비정상 접근을 능동적으로 탐지하고 차단
- 대규모 동시 접속 환경에서도 안정적인 예매 경험 제공
- 좌석 탐색, 추천, 결제까지 이어지는 티켓팅 퍼널 구현
- 프론트엔드 관측성 데이터를 기반으로 사용자 흐름과 장애 상황 추적

## 주요 기술 키워드

- Extreme Concurrency: 대규모 동시성 제어
- In-memory 컴퓨팅
- Canvas/WebGL 좌석 렌더링
- 생성형 보안 퀴즈(VQA)
- KEDA 기반 예측형 오토스케일링
- 대기열 기반 트래픽 제어
- 프론트엔드 관측성 및 사용자 행동 추적

## 팀 구성

| 역할 | 담당자 |
| --- | --- |
| PM | 김제현, 유현석 |
| Design | 윤정빈, 박세영 |
| Frontend | 최광혁 |
| Backend | 강슬기, 유의진 |
| Fullstack | 황시연 |
| AI | 장지현, 최동훈 |
| Infra | 이원이, 정지혜, 정재형 |
| Security | 정민욱, 정완우, 안지서 |

## 프로젝트 운영 방식

- Jira를 활용해 티켓 기반으로 작업을 관리했습니다.
- 기능 구현, 버그 수정, 인프라/보안/AI 연동 작업을 티켓 단위로 분리해 담당자와 진행 상태를 추적했습니다.
- PR 템플릿을 사용해 변경 목적, 작업 내용, 확인 사항을 기록하며 코드 리뷰 흐름을 유지했습니다.
- Gemini 기반 PR 코드리뷰를 도입해 변경 코드에 대한 자동 리뷰와 품질 점검을 병행했습니다.

## 프론트엔드 주요 기능

- 날짜별 경기 일정 조회
- 구단 목록 및 구단 상세 정보 확인
- 경기 상세 정보, 환불 안내, 추천 탭 제공
- 로그인 및 카카오 OAuth 콜백 처리
- 온보딩 기반 사용자 선호 정보 수집
- 선호 구역과 가격대를 반영한 좌석 추천
- 경기별 결제, 입금 계좌 안내, 결제 완료 화면
- 예매 내역, 티켓, 결제 내역, 프로필, 문의 관리
- 디자인 시스템 확인용 개발 페이지
- Grafana Faro, OpenTelemetry 기반 프론트엔드 관측성 연동

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| UI | React 19, Tailwind CSS 4 |
| Component | Radix UI, shadcn 스타일 공통 컴포넌트 |
| State | Zustand |
| Date | date-fns, Intl API |
| Observability | Grafana Faro, OpenTelemetry, Prometheus client |
| Mocking | MSW |
| Build | Next standalone output, javascript-obfuscator |

## 프로젝트 구조

```text
101-goormgb-frontend/
├─ README.md
├─ PR_template.md
├─ 개인정보 처리방침.md
├─ 이용 약관.md
└─ goorm-gongbang/
   ├─ app/
   │  ├─ (auth)/
   │  ├─ (public)/
   │  ├─ (protected)/
   │  ├─ (dev)/
   │  ├─ layout.tsx
   │  ├─ page.tsx
   │  └─ providers.tsx
   ├─ components/
   ├─ hooks/
   ├─ lib/
   ├─ public/
   ├─ stores/
   ├─ instrumentation.ts
   ├─ next.config.ts
   └─ package.json
```

### 주요 디렉터리

- `app`: Next.js App Router 기반 페이지와 라우트 그룹을 관리합니다.
- `components`: 공통 UI, 레이아웃, 로그인, 마이페이지, 경기/좌석 관련 컴포넌트를 관리합니다.
- `hooks`: 분석 이벤트 등 재사용 가능한 React Hook을 관리합니다.
- `lib/api`: API base URL, fetch 래퍼, 에러 타입을 관리합니다.
- `lib/services`: 인증 가드, 주문, 대기열, 좌석, 추천, 마이페이지 API 호출 로직을 관리합니다.
- `lib/types`: 서비스 응답과 도메인 타입을 관리합니다.
- `lib/telemetry`: 관측성 수집, 런타임 컨텍스트, VQA 챌린지 관련 로직을 관리합니다.
- `stores`: 인증 상태와 온보딩 선호 정보를 Zustand store로 관리합니다.
- `public`: 로고, 구단 이미지, 결제 이미지, 폰트, MSW worker 등 정적 자산을 관리합니다.

## 라우팅 개요

| Route Group | 경로 | 설명 |
| --- | --- | --- |
| Root | `/` | 날짜별 경기 목록과 구단 목록 |
| `(auth)` | `/login`, `/kakao/callback` | 로그인 및 OAuth 콜백 |
| `(public)` | `/matches/[matchId]`, `/clubs/[clubId]` | 경기 상세, 구단 상세 등 공개 페이지 |
| `(public)` | `/faq`, `/notices`, `/privacy`, `/refund`, `/terms` | 안내 및 정책 페이지 |
| `(protected)` | `/onboarding/*` | 로그인 후 선호 정보 온보딩 |
| `(protected)` | `/recommend/[matchId]` | 경기별 좌석 추천 |
| `(protected)` | `/pay/[matchId]/*` | 결제, 입금 안내, 결제 완료 |
| `(protected)` | `/my/*` | 마이페이지, 예매, 티켓, 결제, 프로필, 문의 |
| `(dev)` | `/design/*`, `/exp` | 디자인 시스템과 실험용 개발 화면 |

## 시작하기

### 요구 사항

- Node.js 20 이상 권장
- npm

### 설치

```bash
cd goorm-gongbang
npm install
```

### 환경 변수

`goorm-gongbang/.env.local` 파일을 생성하고 아래 값을 프로젝트 환경에 맞게 설정합니다.

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_API_BASE=
NEXT_PUBLIC_CDN_CLUBS_BASE_URL=
NEXT_PUBLIC_FARO_URL=
NEXT_PUBLIC_ENV=development
OTEL_EXPORTER_OTLP_ENDPOINT=
```

주요 변수 설명:

- `NEXT_PUBLIC_API_URL`: 프론트엔드에서 호출할 백엔드 API 주소
- `NEXT_PUBLIC_API_BASE`: `/ai/*` rewrite 대상이 되는 API 주소
- `NEXT_PUBLIC_CDN_CLUBS_BASE_URL`: 구단 로고 등 정적 자산 CDN 주소
- `NEXT_PUBLIC_FARO_URL`: Grafana Faro 수집 엔드포인트
- `NEXT_PUBLIC_ENV`: `development`, `dev`, `production` 등 실행 환경 구분
- `OTEL_EXPORTER_OTLP_ENDPOINT`: OpenTelemetry trace export 주소

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

## 스크립트

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 빌드 결과 실행 |
| `npm run lint` | ESLint 검사 |
| `npm run obfuscate` | Next 정적 chunk 난독화 |
| `npm run build:prod` | 빌드 후 정적 chunk 난독화 |

## 개발 메모

- API 호출은 `lib/services`에서 도메인별로 분리되어 있습니다.
- 인증 정보는 `stores/authStore.ts`에서 관리합니다.
- Next 설정은 standalone 배포, 보안 헤더, 이미지 remote pattern, `/ai/*` rewrite를 포함합니다.
- `instrumentation.ts`와 `lib/telemetry`는 관측성 수집과 런타임 추적을 담당합니다.
- 디자인 시스템 확인용 화면은 `(dev)/design` 라우트 그룹에 있습니다.

## 문서

- [프론트엔드 디렉터리 구조](./goorm-gongbang/FRONTEND_DIRECTORY_STRUCTURE.md)
- [개인정보 처리방침](./개인정보%20처리방침.md)
- [이용 약관](./이용%20약관.md)
