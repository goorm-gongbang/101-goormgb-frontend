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
