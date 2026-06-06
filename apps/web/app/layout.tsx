import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono, Lora } from "next/font/google";

import "./globals.css";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-lora",
});

export const metadata: Metadata = {
  title: "Deep Focus | Resume Analyzer",
  description: "Guide users through role targeting, document upload, and resume template selection.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={cn(geistSans.variable, geistMono.variable, lora.variable)}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
