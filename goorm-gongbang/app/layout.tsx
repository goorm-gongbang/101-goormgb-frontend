/* ===========================
   전체 레이아웃 (Header / Footer)
=========================== */
import { Toaster } from "@/components/ui/sonner";
import Providers from "./providers";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { pretendard } from "./fonts";
import { Header } from "@/components/layout/Header";
import { ConditionalFooter } from "@/components/layout/ConditionalFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Play ball | 쉽고 빠른 야구 티켓팅",
  description: "Play ball | 쉽고 빠른 야구 티켓팅",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <Header />
            <main className="overflow-x-clip">
              {children}
            </main>
            <ConditionalFooter />
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
