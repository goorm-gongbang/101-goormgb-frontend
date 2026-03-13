/* ===========================
   [임시 패스스루 레이아웃]

   /my 하위 서브페이지(preferences, profile 등)가 
   공통 MyPageLayout을 통하지 않고 독립적으로 렌더링될 수 있도록
   단순 패스스루(Passthrough) 레이아웃으로 구성되어 있습니다.

   [통합 방법: 개발자 수동 작업 가이드]
   1. 이 layout.tsx 파일을 삭제합니다. (상위 layout이 MyPageLayout을 포함하도록 변경)
   2. app/(protected)/my/page.tsx 전체를 아래 코드로 교체합니다:
      ─────────────────────────────────────
      "use client";
      import { MyPageLayout } from "@/components/my/MyPageLayout";
      export default function MyPage() {
        return <MyPageLayout />;
      }
      ─────────────────────────────────────
   3. MyPageLayout.tsx는 내부적으로 {children} 프롭을 지원합니다.
      서브페이지들이 children으로 전달되면 마이페이지 프로필 하단 영역에 
      동적으로 카드 레이아웃으로 렌더링되게 설계되어 있습니다.
=========================== */

export default function MyLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
