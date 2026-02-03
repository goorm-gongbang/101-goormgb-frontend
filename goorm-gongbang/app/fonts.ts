// app/fonts.ts
import localFont from "next/font/local";

export const pretendard = localFont({
  variable: "--font-pretendard",
  display: "swap",
  src: [
    { path: "../public/fonts/pretendard/Pretendard-Light.otf", weight: "300", style: "normal" },
    { path: "../public/fonts/pretendard/Pretendard-Regular.otf", weight: "400", style: "normal" },
    { path: "../public/fonts/pretendard/Pretendard-Medium.otf", weight: "500", style: "normal" },
    { path: "../public/fonts/pretendard/Pretendard-SemiBold.otf", weight: "600", style: "normal" },
    { path: "../public/fonts/pretendard/Pretendard-ExtraBold.otf", weight: "800", style: "normal" },
  ],
});
