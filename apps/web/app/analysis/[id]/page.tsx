import type { Metadata } from "next";
import { AnalysisWizard } from "@/features/onboarding/views/analysis-wizard";

interface AnalysisDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: AnalysisDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: "Resume Improvement Plan",
    description:
      "Review plain-language resume suggestions, missing job words, and editor shortcuts for this saved check.",
    alternates: {
      canonical: `/analysis/${id}`,
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function AnalysisDetailPage({ params }: AnalysisDetailPageProps) {
  const { id } = await params;

  return <AnalysisWizard initialAnalysisId={id} />;
}
