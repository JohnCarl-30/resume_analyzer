import type { Metadata } from "next";

import { LandingPageView } from "@/features/landing/views/landing-page-view";

export const metadata: Metadata = {
  title: "Resumae — Resume Analyzer and Resume Checker",
  description:
    "Create a clean resume, check it against a job description, or use our resume analyzer for AI-powered improvement tips.",
  keywords: [
    "resume analyzer",
    "resume checker",
    "resumae",
    "resume builder",
    "job match",
    "ATS checker",
  ],
  alternates: {
    canonical: "/",
  },
};

export default function LandingPage() {
  return <LandingPageView />;
}
