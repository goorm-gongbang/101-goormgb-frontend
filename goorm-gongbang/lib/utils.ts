import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 수수료율 문자열에서 숫자만 추출하여 비율로 변환합니다. (예: "10%" -> 0.1, "무료" -> 0)
 */
export function parseFeeRate(feeRate: string | null | undefined): number {
  if (!feeRate) return 0;
  const cleaned = feeRate.replace(/[^0-9.]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed / 100;
}

/** 취소 수수료 고정 금액 (원) */
export const CANCEL_FIXED_FEE = 2000;

/**
 * 취소 수수료를 계산합니다.
 * totalAmount가 0이거나 feeRate가 0이면 0을 반환합니다.
 */
export function calculateCancelFee(
  totalAmount: number,
  feeRate: string | null | undefined
): number {
  if (totalAmount <= 0) return 0;
  const rate = parseFeeRate(feeRate);
  return rate > 0 ? Math.round(totalAmount * rate) + CANCEL_FIXED_FEE : 0;
}
