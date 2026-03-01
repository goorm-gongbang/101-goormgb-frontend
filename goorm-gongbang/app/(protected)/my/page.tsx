"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { logout as logoutApi } from "@/lib/services";
import { ApiError } from "@/lib/api";

export default function Page() {
  const router = useRouter();
  const logoutStore = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    try {
      await logoutApi();
      toast.success("로그아웃 완료");
    } catch (e) {
      if (e instanceof ApiError) {
        toast.error(e.message);
      } else {
        console.error("⚠️ LOGOUT ERROR:", e);
        toast.error("네트워크 오류로 로그아웃 요청에 실패했습니다.");
      }
    } finally {
      logoutStore();
      router.replace("/login");
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
