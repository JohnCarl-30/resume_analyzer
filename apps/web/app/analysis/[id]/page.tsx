import { DeepFocusWizard } from "@/features/onboarding/views/deep-focus-wizard";

interface AnalysisDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AnalysisDetailPage({ params }: AnalysisDetailPageProps) {
  const { id } = await params;

  return <DeepFocusWizard initialAnalysisId={id} />;
}
