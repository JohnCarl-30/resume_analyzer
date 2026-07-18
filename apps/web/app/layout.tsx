import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";
import { AuthSessionProvider } from "@/components/auth-session-provider";
import { PageTransition } from "@/components/page-transition";
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

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3001");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Deep Focus",
  alternates: {
    canonical: "/",
  },
  title: {
    default: "Deep Focus | Resume Builder",
    template: "%s | Deep Focus",
  },
  description:
    "Create a scanner-friendly resume, compare it to job posts, and get plain-language improvement tips.",
  keywords: [
    "resume checker",
    "scanner friendly resume",
    "resume builder",
    "job match",
    "career tools",
  ],
  authors: [{ name: "Deep Focus" }],
  creator: "Deep Focus",
  publisher: "Deep Focus",
  category: "career",
  openGraph: {
    type: "website",
    siteName: "Deep Focus",
    url: "/",
    title: "Deep Focus | Resume Builder",
    description:
      "Create a scanner-friendly resume, compare it to job posts, and get plain-language improvement tips.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Deep Focus resume builder and job match checker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Deep Focus | Resume Builder",
    description:
      "Create a scanner-friendly resume, compare it to job posts, and get plain-language improvement tips.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: "#155dfc",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/home"
      signUpFallbackRedirectUrl="/home"
    >
      <html lang="en" className={cn(geistSans.variable, geistMono.variable, lora.variable)}>
        <body className="antialiased">
          <AuthSessionProvider>
            <PageTransition />
            {children}
          </AuthSessionProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
