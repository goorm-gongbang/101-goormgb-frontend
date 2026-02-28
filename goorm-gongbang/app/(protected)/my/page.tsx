"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { logout as logoutApi } from "@/lib/services";

export default function Page() {
  const router = useRouter();

  const accessToken = useAuthStore((s) => s.accessToken);
  const logoutStore = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    try {
      const res = await logoutApi();

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
      logoutStore();
      router.replace("/auth/login");
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
