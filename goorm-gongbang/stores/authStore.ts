/* ===========================
    사용자 정보 전역 관리 Zustand
=========================== */

import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = {
  id: string;
  status: string;
};

type AuthState = {
  accessToken: string | null; // accessToken
  user: User | null; // 로그인 된 사용자
  bootstrapped: boolean; // Provider에서 초기 인증 복구 절차 여부 플래그

  setBootstrapped: (v: boolean) => void;
  setAccessToken: (t: string | null) => void;
  setUser: (u: User | null) => void;
  logout: () => void;
};

/* Zustand store을 만드는 함수 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      bootstrapped: false,

      /* 액션 함수들 동작 방식 */
      setBootstrapped: (v) => set({ bootstrapped: v }), // 완료시 True로 변경
      setAccessToken: (t) => set({ accessToken: t }), // refresh 성공 시 호출
      setUser: (u) => set({ user: u }), // refresh 성공 시 호출
      logout: () => set({ accessToken: null, user: null }), // 로그아웃 시 초기화
    }),
    {
      name: "auth-storage", // localStorage 키 이름
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }), // bootstrapped는 persist 안 함
    }
  )
);
