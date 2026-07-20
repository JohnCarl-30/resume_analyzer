import type { Metadata } from "next";

import { LandingPageView } from "@/features/landing/views/landing-page-view";

export const metadata: Metadata = {
  title: "Resume Builder and Job Match Checker",
  description:
    "Create a clean resume or check an existing resume against a job description with plain-language guidance.",
  alternates: {
    canonical: "/",
  },
};

export default function LandingPage() {
  return <LandingPageView />;
}
