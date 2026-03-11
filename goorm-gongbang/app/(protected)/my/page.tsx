/* ===========================
   마이페이지 루트
   Route: /my
   - MyPageLayout 컴포넌트를 렌더링
   - 실제 UI/로직은 components/my/MyPageLayout.tsx 참조

   [TODO] API 연동 시
   - 현재 MyPageLayout 내 MOCK_USER → 실제 유저 정보 교체
   - SECTIONS 내 href가 껍데기인 페이지들 구현 필요
     (/my/notices, /my/faq, /my/support, /my/terms, /my/privacy)
=========================== */

"use client";

import { MyPageLayout } from "@/components/my/MyPageLayout";

export default function MyPage() {
  return <MyPageLayout />;
}
