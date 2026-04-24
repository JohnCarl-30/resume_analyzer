import { DeepFocusWizard } from "@/features/onboarding/views/deep-focus-wizard";

interface AnalysisPageProps {
  params: Promise<{ analysisId: string }>;
}

export default async function AnalysisPage({ params }: AnalysisPageProps) {
  const { analysisId } = await params;

  return <DeepFocusWizard initialAnalysisId={analysisId} />;
}
