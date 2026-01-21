## 🛠 Tech Stack

### Language & Framework
- **Language**: TypeScript
- **Framework**: Next.js 16 (App Router)

### Styling & UI
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: lucide-react

### State Management
- **Global State**: Zustand

### API / Network
- **HTTP Client**: fetch, axios

### Development Environment
- **IDE**: VS Code

### Code Quality & Productivity
- **Linting**: ESLint
- **Formatting**: Prettier

### Deployment
- **Hosting**: AWS Cloudfront + S3

## 📁 Project Structure
```bash
my-project/
├─ app/
│  ├─ layout.tsx        # 전체 레이아웃 (Header / Footer)
│  ├─ page.tsx          # 메인 페이지 (/)
│  ├─ globals.css       # 전역 스타일
│  ├─ not-found.tsx     # 404 페이지
│  ├─ error.tsx         # 에러 바운더리
│  ├─ loading.tsx       # 로딩 UI
│  ├─ (auth)/           # 라우트 그룹 (URL 미노출)
│  │   ├─ login/
│  │   │   └─ page.tsx
│  │   └─ signup/
│  │       └─ page.tsx
│  ├─ eventpage/
│  │   ├─ page.tsx      # /eventpage (예시)
│  │   └─ [id]/
│  │       └─ page.tsx  # /eventpage/123 (예시)
│  └─ api/
│      └─ events/
│          └─ route.ts  # API Route (예시)
│
├─ components/
│  ├─ ui/               # shadcn/ui (Button, Dialog 등)
│  ├─ layout/           # Header, Footer
│  ├─ common/           # 공통 컴포넌트
│  └─ event/            # 도메인 컴포넌트 (예시)
│
├─ feature/             # 기능 단위 UI + 로직 (예시)
│  └─ event/
│      ├─ EventCard.tsx
│      ├─ EventList.tsx
│      └─ hooks.ts
│
├─ lib/
│  ├─ utils.ts          # 공용 유틸
│  ├─ fetcher.ts        # API fetch wrapper
│  ├─ auth.ts           # 인증 로직
│  └─ supabase.ts
│
├─ stores/              # 상태관리 (Zustand) (예시)
│  ├─ panelstore.ts
│  └─ eventFilterStore.ts
│
├─ types/               # 타입 정의 (예시)
│  └─ event.ts
│
├─ hooks/               # 전역 커스텀 훅 (예시)
│  └─ useDebounce.ts
│
├─ public/              # 정적 파일
│  └─ images/
│
├─ styles/              # 선택 (CSS 분리 시)
│
├─ middleware.ts        # 인증/리다이렉트
├─ tailwind.config.ts
├─ tsconfig.json
└─ package.json
```

## 🧠 Architecture Overview

- `app/` : 라우팅 및 페이지 책임만 담당
- `feature/` : 기능 단위 UI + 로직 결합
- `components/` : 재사용 가능한 UI 컴포넌트
- `stores/` : 전역 UI 상태 관리 (Zustand)
- `lib/` : 공통 유틸 및 외부 서비스 연동

## ▶️ Getting Started

```bash
npm install
npm run dev
