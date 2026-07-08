import type { Metadata } from "next";
import { AnalysesPageClient } from "./analyses-page-client";

export const metadata: Metadata = {
  title: "Saved Resume Checks",
  description:
    "Review saved resume checks, match scores, missing job words, and improvement suggestions.",
  alternates: {
    canonical: "/analyses",
  },
};

export default function AnalysesPage() {
  return <AnalysesPageClient />;
}
