"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

export default function Page() {
  const router = useRouter();

  const accessToken = useAuthStore((s) => s.accessToken);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/logout`, { // ★ 이부분 auth/logout 으로 추후 변경 
        method: "POST",
        credentials: "include",
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}), // accessToken 없으면 보내지 않음(401 유도)
          Accept: "application/json",
        },
      });

      /* 백엔드 예외처리 */
      if (res.status === 401) {
        const json = await res.json().catch(() => null);
        toast.error(json?.message ?? "인증이 만료되었습니다. 다시 로그인해주세요.");
      } else if (!res.ok) {
        const json = await res.json().catch(() => null);
        toast.error(json?.message ?? `로그아웃 실패 (HTTP ${res.status})`);
      } else {
        const json = await res.json().catch(() => null);
        toast.success(json?.message ?? "로그아웃 완료");
      }
    } catch (e) {
      console.error("⚠️ LOGOUT ERROR:", e);
      toast.error("네트워크 오류로 로그아웃 요청에 실패했습니다.");
    } finally {
      logout(); // access 토큰 삭제
      router.replace("/auth/login"); // 로그인 창 이동
    }
  };

  return (
    <div className="p-6">
      <button
        type="button"
        onClick={handleLogout}
        className="h-10 px-4 rounded-md bg-black text-white"
      >
        로그아웃
      </button>
    </div>
  );
}
