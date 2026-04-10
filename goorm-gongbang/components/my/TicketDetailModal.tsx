"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { getTicketQr } from "@/lib/services";
import { ApiError } from "@/lib/api/error";
import type { TicketQrData } from "@/lib/types";

export interface TicketInfo {
    matchTitle: string;
    count: number;
    type: string;
    zone: string;
    seat: string;
    date: string;
    location: string;
    time: string;
    dateStr?: string; // e.g., "2026. 03. 28 (토) 14:00"
    status?: "PAYMENT_PENDING" | "PAYMENT_WAITING" | "PAID" | "RESERVED" | "UNDER_REVIEW";
}

interface TicketDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticketInfo: TicketInfo | null;
    ticketId?: number;
}

export function TicketDetailModal({ isOpen, onClose, ticketInfo, ticketId }: TicketDetailModalProps) {
    const [timeLeft, setTimeLeft] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);
    const [qrData, setQrData] = useState<TicketQrData | null>(null);
    const [qrLoading, setQrLoading] = useState(false);
    const [qrUnavailableMessage, setQrUnavailableMessage] = useState<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // QR 데이터 fetch + 닫힐 때 초기화
    useEffect(() => {
        if (!isOpen) {
            if (timerRef.current) clearInterval(timerRef.current);
            setQrData(null);
            setTimeLeft(0);
            setQrUnavailableMessage(null);
            setQrLoading(false);
            return;
        }
        if (!ticketId || ticketInfo?.status === "UNDER_REVIEW" || ticketInfo?.status === "PAYMENT_WAITING") return;

        setQrData(null);
        setQrUnavailableMessage(null);
        setTimeLeft(0);
        setQrLoading(true);

        let cancelled = false;
        getTicketQr(ticketId)
            .then((data) => {
                if (cancelled) return;
                setQrData(data);
                const remaining = Math.max(0, Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000));
                setTimeLeft(remaining);
            })
            .catch((err) => {
                if (cancelled) return;
                if (err instanceof ApiError && err.status === 400) {
                    setQrUnavailableMessage(err.message || "아직 입장 가능 시간이 아닙니다.");
                }
            })
            .finally(() => { if (!cancelled) setQrLoading(false); });
        return () => { cancelled = true; };
    }, [isOpen, ticketId, ticketInfo?.status, refreshKey]);

    // 카운트다운
    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (!qrData?.qrToken || timeLeft <= 0) return;
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
        }, 1000);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [qrData?.qrToken, timeLeft > 0]);

    if (!ticketInfo) return null;

    // "2026. 03. 29 (일) 14:00" -> "2026년 3월 29일 14:00" 변환 (단순화)
    const formatFullDate = (dateStr?: string) => {
        if (!dateStr) return `${ticketInfo.date} ${ticketInfo.time}`;
        const parts = dateStr.split(" ");
        if (parts.length >= 4) {
            const y = parts[0].replace(".", "");
            const m = parts[1].replace(".", "").replace(/^0+/, '');
            const d = parts[2].replace(".", "").replace(/^0+/, '');
            const time = parts[4] || ticketInfo.time;
            return `${y}년 ${m}월 ${d}일 ${time}`;
        }
        return dateStr;
    };

    const formatTimeLeft = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    const formatExpiresAt = (iso: string) => {
        const d = new Date(iso);
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Dimmed Background */}
            <div
                className="absolute inset-0 bg-black/60 animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative animate-in zoom-in-95 fade-in duration-200 w-full max-w-[340px]">

                {/* 메인 초록색 카드 영역 */}
                <div className="bg-[var(--foundation-primary-500)] w-full rounded-xl p-4 flex flex-col shadow-xl">

                    {/* 상단 텍스트 영역 */}
                    <div className="px-2 pt-2 pb-5 flex flex-col gap-2">
                        <h2 className="text-white text-[24px] font-bold tracking-tight">
                            {ticketInfo.matchTitle}
                        </h2>
                        {ticketInfo.status === "UNDER_REVIEW" ? (
                            <div className="flex flex-col gap-1 mt-1">
                                <span className="text-white text-[15px] font-bold">
                                    예매 정보 정밀 확인 중
                                </span>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1 mt-1">
                                <span className="text-white text-[15px] font-medium opacity-90">
                                    {formatFullDate(ticketInfo.dateStr)}
                                </span>
                                <span className="text-white text-[15px] font-medium opacity-90">
                                    {ticketInfo.location}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* 흰색 티켓 내부 카드 */}
                    <div className="bg-white rounded-[12px] w-full flex flex-col pt-6 pb-6 shadow-sm">

                        {/* 상단: QR & 유효시간 */}
                        <div className="flex flex-col items-center px-6">
                            {ticketInfo.status === "UNDER_REVIEW" ? (
                                <div className="w-full flex flex-col items-center py-6 gap-4">
                                    <p className="text-[#333] text-[15px] font-bold text-center leading-relaxed">
                                        비정상 예매 시도가 감지되어<br />
                                        정밀 확인을 진행하고 있습니다.
                                    </p>
                                    <p className="text-[#888] text-[13px] text-center">
                                        본인이 직접 진행한 예매라면<br />
                                        고객센터로 문의해 주세요.
                                    </p>
                                    <button
                                        onClick={() => window.location.href = "/my/support"}
                                        className="mt-4 px-6 py-2.5 rounded-[12px] border border-[#DEDEDE] text-[14px] font-bold text-[#666] hover:bg-gray-50 transition-colors"
                                    >
                                        고객센터 문의하기
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* QR 코드 영역 */}
                                    <div className="w-[240px] h-[190px] mb-4 flex items-center justify-center relative">
                                        {qrLoading ? (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <div className="w-10 h-10 border-4 border-[#E8E8E8] border-t-[var(--foundation-primary-500)] rounded-full animate-spin" />
                                            </div>
                                        ) : ticketInfo.status === "PAYMENT_WAITING" ? (
                                            <div className="w-[240px] flex flex-col items-center justify-center gap-2 text-center">
                                                <p className="text-[#333] text-[15px] font-bold text-center leading-relaxed">
                                                    무통장입금이 완료되지 않았습니다.
                                                </p>
                                                <p className="text-[#888] text-[13px] text-center">
                                                    입금 완료 후 티켓을 확인할 수 있습니다.
                                                </p>
                                            </div>
                                        ) : qrUnavailableMessage ? (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-center">
                                                <p className="text-[13px] font-bold text-[#888]">{qrUnavailableMessage}</p>
                                            </div>
                                        ) : qrData ? (
                                            <>
                                                <div className={`transition-opacity duration-300 ${timeLeft === 0 ? "opacity-20" : ""}`}>
                                                    <QRCodeSVG value={qrData.qrToken} size={190} />
                                                </div>
                                                {timeLeft === 0 && (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                        <button
                                                            onClick={handleRefresh}
                                                            className="flex flex-col items-center gap-2 group"
                                                        >
                                                            <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                                                                <RotateCcw className="text-[#333]" size={24} strokeWidth={2} />
                                                            </div>
                                                            <span className="text-[14px] font-bold text-[#333]">새로고침</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        ) : null}
                                    </div>
                                    {qrData && timeLeft > 0 && (
                                        <p className="text-[#999] text-[15px] font-medium">
                                            유효 시간 <span className="font-medium text-[#999] ml-1">{formatTimeLeft(timeLeft)}</span>
                                        </p>
                                    )}
                                    {qrData && (
                                        <p className="text-[#bbb] text-[12px] mt-1">
                                            만료: {formatExpiresAt(qrData.expiresAt)}
                                        </p>
                                    )}
                                </>
                            )}
                        </div>

                        {/* 점선 구분자 */}
                        <div className="w-full relative py-6">
                            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 border-t-[1.5px] border-dashed border-[#DFDFDF] opacity-80"></div>
                        </div>

                        {/* 하단: 구역/블럭/좌석 */}
                        <div className="px-6 flex flex-col gap-5">
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[14px] font-bold text-[#888]">구역/블럭</span>
                                <span className="text-[18px] font-bold text-[#1A1A1A]">
                                    {ticketInfo.type} {ticketInfo.zone}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[14px] font-bold text-[#888]">좌석</span>
                                <span className="text-[18px] font-bold text-[#1A1A1A]">
                                    {ticketInfo.seat}
                                </span>
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
}
