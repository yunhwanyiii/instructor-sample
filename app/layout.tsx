import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "강사관리 프로그램 — 예시",
  description: "수강생의 실제 작품을 가볍게 재현한 예시 프로그램입니다.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
