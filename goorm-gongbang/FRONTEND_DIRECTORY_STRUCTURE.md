# 프론트엔드 디렉터리 구조 정리

이 문서는 현재 `goorm-gongbang` 프론트엔드 프로젝트가 어떤 기준으로 디렉터리를 나누고 있는지 소개하기 위한 문서다.
실제 코드 기준으로 정리했으며, "어디에 무엇을 넣는지"를 빠르게 파악할 수 있도록 구성했다.

## 1. 프로젝트 개요

- 프레임워크: Next.js 16 App Router
- 언어: TypeScript
- 스타일링: Tailwind CSS 4
- 상태 관리: Zustand
- 공통 UI: `components/ui`
- API/비즈니스 로직: `lib`

현재 구조는 크게 다음 네 층으로 읽을 수 있다.

1. `app`: 페이지와 라우팅을 담당하는 진입 계층
2. `components`: 화면 조립에 쓰는 UI 컴포넌트 계층
3. `lib`: API 호출, 서비스, 유틸리티를 모아 둔 로직 계층
4. `stores`, `hooks`, `types`: 전역 상태와 재사용 타입/훅 보조 계층

## 2. 최상위 디렉터리

```text
goorm-gongbang/
|-- app/
|-- components/
|-- feature/
|-- hooks/
|-- lib/
|-- public/
|-- stores/
|-- types/
|-- instrumentation.ts
|-- next.config.ts
|-- package.json
|-- tsconfig.json
```

각 디렉터리의 역할은 아래와 같다.

### `app`

Next.js App Router 기준의 페이지 진입점이다.

- `layout.tsx`: 전체 앱 공통 레이아웃
- `providers.tsx`: 앱 부팅 시 인증 복구, 유저 정보 초기화 등 클라이언트 Provider 역할
- `page.tsx`: 홈 화면
- `loading.tsx`, `error.tsx`, `not-found.tsx`: 공통 상태 페이지
- 라우트 그룹을 이용해 인증/공개/보호/개발용 페이지를 분리하고 있다

### `components`

실제 화면을 구성하는 재사용 컴포넌트 모음이다.
공용 UI와 도메인 UI가 함께 존재하지만, 폴더명으로 어느 정도 관심사를 구분하고 있다.

### `feature`

현재는 사실상 비어 있는 상태다.
이름상으로는 기능 단위(feature-first) 구조를 수용하려는 의도가 보이지만, 실제 운영 코드는 아직 `app`, `components`, `lib` 중심으로 배치되어 있다.

### `hooks`

커스텀 훅을 두기 위한 위치다.
현재 프로젝트에서는 사용 흔적이 크지 않으며, 앞으로 공통 훅이 늘어나면 이 디렉터리 활용도가 커질 수 있다.

### `lib`

API 호출, 서버/클라이언트 유틸, 서비스 로직, 타입 재수출 등을 모아 둔 폴더다.
현재 구조상 비즈니스 로직의 중심축에 가깝다.

### `public`

정적 에셋을 보관한다.

- 폰트
- 로그인 관련 이미지
- 경기/결제/티켓팅 관련 SVG, 이미지

### `stores`

Zustand 전역 스토어 위치다.

- `authStore.ts`: 인증 토큰, 사용자 정보, 부트스트랩 상태 관리
- `onboardingPrefStore.ts`: 온보딩 선호 정보 관리

### `types`

루트 레벨 공용 타입 폴더다.
현재는 대부분의 도메인 타입이 `lib/types` 쪽에 더 많이 모여 있다.

## 3. `app` 디렉터리 구조

`app`은 이 프로젝트의 URL 구조와 거의 1:1로 대응한다.

```text
app/
|-- layout.tsx
|-- page.tsx
|-- providers.tsx
|-- (auth)/
|   |-- login/page.tsx
|   `-- kakao/callback/page.tsx
|-- (public)/
|   |-- clubs/[clubId]/page.tsx
|   `-- matches/[matchId]/page.tsx
|-- (protected)/
|   |-- onboarding/
|   |-- pay/[matchId]/
|   |-- recommend/[matchId]/
|   `-- my/
`-- (dev)/
    `-- design/
```

### 라우트 그룹별 의미

### `(auth)`

로그인과 소셜 로그인 콜백 같은 인증 진입 화면이다.

- `/login`
- `/kakao/callback`

### `(public)`

비로그인 상태에서도 접근 가능한 공개 페이지다.

- `/clubs/[clubId]`: 구단 상세
- `/matches/[matchId]`: 경기 상세

### `(protected)`

로그인 이후 사용자 행동과 연결되는 보호 영역이다.

- `/onboarding`
- `/pay/[matchId]`
- `/recommend/[matchId]`
- `/my/*`

특히 `my` 아래는 마이페이지 성격의 하위 화면이 모여 있다.

- `faq`
- `preferences`
- `privacy`
- `profile`
- `reservations`
- `terms`
- `tickets`

`app/(protected)/my/layout.tsx`는 현재 children만 그대로 통과시키는 얇은 passthrough 레이아웃으로 작성되어 있다.
즉, 하위 페이지는 URL 기준으로 묶여 있지만 실제 UI 레이아웃 통합은 각 페이지나 `components/my` 쪽에서 담당하는 구조에 가깝다.

### `(dev)`

디자인 시스템이나 아이콘, 파운데이션 확인용 내부 개발 페이지다.

- `design/components`
- `design/foundation`
- `design/icon`

운영 사용자용 기능보다 "디자인 확인/가이드" 성격에 더 가깝다.

## 4. `components` 디렉터리 구조

`components`는 공통 UI와 도메인 화면 조각을 함께 담고 있다.

```text
components/
|-- club-detail/
|-- common/
|-- forms/
|-- layout/
|-- login/
|-- my/
`-- ui/
```

### `components/ui`

가장 작은 단위의 재사용 UI 컴포넌트다.
shadcn/ui 스타일의 베이스 컴포넌트 역할을 한다.

예시:

- `button.tsx`
- `input.tsx`
- `checkbox.tsx`
- `calendar.tsx`
- `switch.tsx`
- `sonner.tsx`
- `skeleton.tsx`

새로운 화면을 만들 때 가장 먼저 조합 대상이 되는 공통 UI 계층이다.

### `components/layout`

앱 전체에 걸쳐 재사용되는 레이아웃 컴포넌트를 둔다.

- `Header.tsx`

현재 루트 레이아웃에서 `Header`를 직접 사용하고 있어, 전역 레이아웃 책임이 이 폴더에 모인다.

### `components/login`

로그인 화면 전용 컴포넌트다.

- `KakaoButton.tsx`
- `GoogleButton.tsx`

### `components/my`

마이페이지 관련 화면 조각이 모여 있다.

- `MyPageLayout.tsx`
- `ProfileEditForm.tsx`
- `PreferenceForm.tsx`
- `ReservationItem.tsx`
- `TicketCard.tsx`
- 각종 모달 컴포넌트

`app/(protected)/my/*` 페이지들이 실제 UI를 구성할 때 이 폴더에 많이 의존하는 형태다.

### `components/common`

도메인 공용 컴포넌트가 가장 많이 모여 있는 폴더다.
현재 프로젝트에서 실질적인 "업무형 UI 모음" 역할을 한다.

예시:

- 경기 카드: `MatchCard.tsx`
- 팀 정보 카드: `TeamInfoCard.tsx`
- 좌석/추천 관련 모달 및 카드
- 결제/추천/티켓팅 플로우에서 재사용되는 조합형 컴포넌트
- `common/Button/*`처럼 버튼 변형군도 별도 하위 폴더로 관리

이 프로젝트는 `components/ui`가 원자 단위라면, `components/common`은 화면 기능 단위에 가까운 중간 계층이라고 볼 수 있다.

### `components/club-detail`

구단 상세 화면에서 쓰는 도메인 컴포넌트다.

### `components/forms`

이름상 폼 공통화 영역이지만, 현재 구조에서는 비중이 크지 않다.

## 5. `lib` 디렉터리 구조

`lib`는 로직 계층으로 사용하는 것이 가장 자연스럽다.

```text
lib/
|-- api/
|-- client/
|-- server/
|-- services/
|-- types/
|-- datetime.ts
`-- utils.ts
```

### `lib/api`

HTTP 호출의 공통 기반을 둔다.

- `config.ts`: API 기본 설정
- `fetch.ts`: 공통 fetch 래퍼
- `error.ts`: API 에러 모델
- `index.ts`: 재수출

즉, 외부 API와 통신하는 가장 하위 공통 계층이다.

### `lib/services`

화면에서 직접 가져다 쓰는 서비스 레이어다.

- `auth-guard.service.ts`
- `order-core.service.ts`
- `queue.service.ts`
- `recommendation.service.ts`
- `seat.service.ts`

`app/page.tsx` 같은 화면 코드가 `@/lib/services`를 통해 데이터를 가져오는 패턴이 보인다.
그래서 페이지는 서비스 호출, 서비스는 API 래퍼 호출이라는 흐름으로 이해하면 된다.

### `lib/server`

서버 사이드에서만 필요한 유틸과 관측성 코드를 둔다.

- `backendFetch.ts`
- `metrics.ts`
- `customMetrics.ts`

`next.config.ts`, `instrumentation.ts`와 함께 운영/관측성 대응 성격이 강하다.

### `lib/client`

클라이언트 전용 유틸 위치다.

- `analytics.ts`

### `lib/types`

도메인 타입이 가장 체계적으로 모여 있는 폴더다.

- `auth-guard.types.ts`
- `order-core.types.ts`
- `queue.types.ts`
- `recommendation.types.ts`
- `seat.types.ts`
- `common.types.ts`

현재 프로젝트에서는 루트 `types`보다 `lib/types` 쪽이 실사용 중심에 가깝다.

### `lib/utils.ts`, `lib/datetime.ts`

여러 화면에서 공통으로 쓰는 범용 유틸 함수들이다.

## 6. 상태 관리와 앱 부팅 흐름

현재 전역 상태와 초기화 흐름은 다음처럼 정리할 수 있다.

1. `app/layout.tsx`에서 전체 레이아웃과 Provider를 감싼다.
2. `app/providers.tsx`에서 클라이언트 부팅 시 인증 복구를 수행한다.
3. `stores/authStore.ts`에 access token, user, bootstrapped 상태를 저장한다.
4. 각 페이지는 `lib/services`를 통해 데이터를 조회하고 화면을 구성한다.

즉, 구조적으로는 다음 흐름이다.

```text
app(page/layout)
  -> components
  -> lib/services
  -> lib/api
  -> stores
```

## 7. 현재 구조의 특징

이 프로젝트는 완전히 feature-first 구조도 아니고, 완전히 layer-only 구조도 아니다.
현재는 다음 성격이 섞여 있다.

- 라우팅은 `app` 중심
- 화면 조립은 `components` 중심
- 비즈니스 로직은 `lib/services` 중심
- 전역 상태는 `stores` 중심
- 일부 도메인별 묶음은 `components/my`, `components/club-detail`처럼 폴더 단위로 분리

즉, "App Router + 공용 컴포넌트 + 서비스 레이어" 조합의 실무형 구조라고 보는 것이 가장 정확하다.

## 8. 새 코드를 어디에 둘지 기준

현재 구조를 기준으로 새 파일을 추가할 때는 아래 원칙으로 두는 것이 자연스럽다.

- 새 페이지: `app/.../page.tsx`
- 페이지 전용 레이아웃: `app/.../layout.tsx`
- 범용 UI primitive: `components/ui`
- 여러 화면에서 재사용되는 업무형 UI: `components/common`
- 특정 도메인 화면 전용 UI: `components/my`, `components/club-detail` 같은 도메인 폴더
- API 호출 공통 처리: `lib/api`
- 화면에서 직접 사용하는 서비스 함수: `lib/services`
- 전역 상태: `stores`
- 공통 유틸: `lib/utils.ts`, `lib/datetime.ts`

## 9. 한 줄 요약

현재 프론트엔드는 `app`에서 라우팅을 관리하고, `components`에서 화면을 조립하며, `lib/services`와 `lib/api`에서 데이터/비즈니스 로직을 처리하는 구조다.
즉, 페이지, UI, 서비스, 상태를 느슨하게 분리한 Next.js App Router 기반 구조로 이해하면 된다.
