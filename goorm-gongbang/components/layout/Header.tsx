"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { User, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { PrimaryButton } from "@/components/common/Button";
import Image from "next/image";

type Props = {
  className?: string;
  onMyInfoClick?: () => void;
  onMyTicketClick?: () => void;
};

export function Header({ className, onMyInfoClick, onMyTicketClick }: Props) {
  const router = useRouter();
  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  const isLoggedIn = bootstrapped && !!accessToken && !!user;

  const handleLogin = () => {
    const next =
      typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : "/"; // 로그인 후 돌아오도록
    router.push(`/login?next=${encodeURIComponent(next)}`);
  };

  return (
    <div
      className={cn(
        "sticky top-0 z-50 w-full self-stretch h-12 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-[120px] bg-[var(--foundation-neutral-980)] inline-flex justify-between items-center",
        className,
      )}
    >
      {/* Logo */}
      <div
        onClick={() => router.push("/")}
        className="cursor-pointer self-stretch flex justify-start items-center"
      >
        <div className="p-2 flex items-center">
          <div className="w-16 h-10 overflow-hidden flex items-center relative">
            <Image
              src="/logo.png"
              alt="logo"
              fill
              sizes="64px"
              loading="eager"
              fetchPriority="high"
              className="object-contain"
              quality={60}
            />
          </div>
        </div>
      </div>

      {/* Right area */}
      {!isLoggedIn ? (
        // 로그인 버튼 상태
        <PrimaryButton
          type="button"
          size="sm"
          tone="base"
          onClick={handleLogin}
          className=""
        >
          로그인
        </PrimaryButton>
      ) : (
        // 로그인 후 메뉴 상태
        <div className="flex justify-start items-center gap-8">
          <button
            type="button"
            onClick={onMyInfoClick ?? (() => router.push("/my"))}
            className="cursor-pointer w-20 h-6 flex justify-start items-center gap-2"
          >
            <User className="w-5 h-5 text-gray-700" aria-hidden="true" />
            <div className="flex-1 flex justify-center items-center gap-2">
              <div className="justify-start text-gray-700 text-sm font-medium font-['Pretendard'] leading-6">
                내 정보
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={onMyTicketClick ?? (() => router.push("/my/tickets"))}
            className="cursor-pointer h-6 flex justify-start items-center gap-2"
          >
            <Ticket className="w-5 h-5 text-gray-700" aria-hidden="true" />
            <div className="flex justify-center items-center gap-2">
              <div className="justify-start text-gray-700 text-sm font-medium font-['Pretendard'] leading-6">
                내 티켓
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
