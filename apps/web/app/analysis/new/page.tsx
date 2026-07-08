import type { Metadata } from "next";
import { DeepFocusWizard } from "@/features/onboarding/views/deep-focus-wizard";

export const metadata: Metadata = {
  title: "Check a Resume",
  description:
    "Upload a resume, choose a clean resume style, and compare it against a target role and job description.",
  alternates: {
    canonical: "/analysis/new",
  },
};

export default function NewAnalysisPage() {
  return <DeepFocusWizard />;
}
