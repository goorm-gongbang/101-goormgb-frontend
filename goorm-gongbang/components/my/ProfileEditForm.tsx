"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { SquarePen, Check } from "lucide-react";
import { getAccountInfo, updateNickname } from "@/lib/services";

/* ===========================
   개인정보 수정 폼
   - 계정 정보: 이메일(조회), 닉네임(수정), 본인 인증(조회)
   - 닉네임: 클릭 → input 전환, Enter/체크 아이콘으로 저장, ESC로 취소
   - 저장 시: toast
=========================== */

export function ProfileEditForm() {
    const [email, setEmail] = useState("");
    const [profileImageUrl, setProfileImageUrl] = useState("");
    const [nickname, setNickname] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [tempNickname, setTempNickname] = useState(nickname);
    const fetchedRef = useRef(false);

    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;

        getAccountInfo()
            .then((data) => {
                setEmail(data.email);
                setNickname(data.nickname);
                setTempNickname(data.nickname);
                setProfileImageUrl(data.profileImageUrl);
            })
            .catch((err) => {
                toast.error(err.message || "계정 정보를 불러오지 못했습니다.");
            });
    }, []);

    const handleSave = async () => {
        if (!tempNickname.trim()) {
            toast.error("닉네임을 입력해주세요.");
            return;
        }

        try {
            await updateNickname({ nickname: tempNickname });
            setNickname(tempNickname);
            setIsEditing(false);
            toast.success("개인정보가 업데이트되었습니다");
        } catch (err: any) {
            toast.error(err.message || "닉네임 수정에 실패했습니다.");
        }
    };

    return (
        <div className="flex flex-col gap-5">
            {/* ─── 계정 정보 카드 ─── */}
            <div className="bg-white rounded-xl border border-[#E8E8E8] px-5 py-5">
                {/* 카드 헤더 */}
                <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-base font-bold text-[#1A1A1A]">계정 정보</h2>
                </div>
                <div className="h-px bg-[#F0F0F0] mb-5" />

                <div className="flex flex-col gap-7">
                    {/* 프로필 이미지 */}
                    {profileImageUrl && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-[#1A1A1A]">프로필 이미지</span>
                            <img
                                src={profileImageUrl}
                                alt="프로필 이미지"
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        </div>
                    )}

                    {/* 이메일 */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#1A1A1A]">이메일</span>
                        <span className="text-[15px] text-[#1A1A1A]">{email}</span>
                    </div>

                    {/* 닉네임 (수정 가능 스타일) */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#1A1A1A]">닉네임</span>
                        {isEditing ? (
                            <div className="flex items-center gap-1 border-b border-[var(--foundation-primary-500)] pb-0.5">
                                <input
                                    type="text"
                                    value={tempNickname}
                                    onChange={(e) => setTempNickname(e.target.value)}
                                    autoFocus
                                    className="text-[15px] text-[#1A1A1A] outline-none bg-transparent text-right w-[120px]"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSave();
                                        if (e.key === "Escape") {
                                            setTempNickname(nickname);
                                            setIsEditing(false);
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    className="p-0.5 text-black hover:text-[var(--foundation-primary-500)] transition-colors"
                                    aria-label="저장"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    setTempNickname(nickname);
                                    setIsEditing(true);
                                }}
                                className="group flex items-center gap-1 border-b border-[#ADADAD] pb-0.5 transition-colors hover:border-[#1A1A1A]"
                            >
                                <span className="text-[15px] text-[#ADADAD] group-hover:text-[#1A1A1A] transition-colors">
                                    {nickname}
                                </span>
                                <SquarePen className="w-4 h-4 text-[#ADADAD] group-hover:text-[#1A1A1A] transition-colors" />
                            </button>
                        )}
                    </div>

                    {/* 본인 인증 */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#1A1A1A]">본인 인증</span>
                        <span className="text-[15px] font-bold text-[#1A1A1A]">본인 인증 완료</span>
                    </div>
                </div>
            </div>

            {/* ─── 저장 버튼 ─── */}
            <button
                type="button"
                onClick={handleSave}
                className="w-full py-3.5 bg-[var(--foundation-primary-500)] hover:bg-[var(--foundation-primary-600)] active:scale-[0.99] text-white text-sm font-semibold rounded-[12px] transition-all"
            >
                저장하기
            </button>
        </div>
    );
}
