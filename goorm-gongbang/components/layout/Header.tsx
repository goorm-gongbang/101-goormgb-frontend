"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { User, Ticket } from "lucide-react";

type Props = {
  className?: string;

  /** 초기 로그인 상태(옵션). 외부에서 제어하고 싶으면 아래 controlled props 사용 추천 */
  defaultLoggedIn?: boolean;

  /** controlled로 쓰고 싶을 때 */
  loggedIn?: boolean;
  onLoginClick?: () => void;
  onMyInfoClick?: () => void;
  onMyTicketClick?: () => void;
};

export function Header({
  className,
  defaultLoggedIn = false,
  loggedIn,
  onLoginClick,
  onMyInfoClick,
  onMyTicketClick,
}: Props) {
  // uncontrolled fallback
  const [internalLoggedIn, setInternalLoggedIn] = React.useState(defaultLoggedIn);
  const isLoggedIn = loggedIn ?? internalLoggedIn;

  const handleLogin = () => {
    onLoginClick?.();
    if (loggedIn === undefined) setInternalLoggedIn(true);
  };

  return (
    <div
      className={cn(
        "w-full self-stretch h-12 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-[180px] bg-[var(--foundation-neutral-980)] inline-flex justify-between items-center",
        className
      )}
    >
      {/* Logo */}
      <div className="self-stretch flex justify-start items-center">
        <div className="justify-start text-gray-900 text-lg font-bold font-['Pretendard'] leading-9">
          Pyo
        </div>
        <div className="justify-start text-emerald-500 text-lg font-bold font-['Pretendard'] leading-9">
          Go
        </div>
      </div>

      {/* Right area */}
      {!isLoggedIn ? (
        // 로그인 버튼 상태
        <button
          type="button"
          onClick={handleLogin}
          className={cn(
            "h-6 min-w-14 p-2 bg-[var(--foundation-primary-500)] rounded-md",
            "flex justify-center items-center"
          )}
        >
          <span className="flex-1 text-center justify-center text-[var(--foundation-neutral-white)] text-xs font-medium font-['Pretendard'] leading-5 cursor-pointer">
            로그인
          </span>
        </button>
      ) : (
        // 로그인 후 메뉴 상태
        <div className="flex justify-start items-center gap-8">
          <button
            type="button"
            onClick={onMyInfoClick}
            className="w-20 h-6 flex justify-start items-center gap-2"
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
            onClick={onMyTicketClick}
            className="h-6 flex justify-start items-center gap-2"
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
