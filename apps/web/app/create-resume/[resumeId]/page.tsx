import { DeepFocusWizard } from "@/features/onboarding/views/deep-focus-wizard";

interface CreateResumePageProps {
  params: Promise<{ resumeId: string }>;
}

export default async function ResumeDetailPage({ params }: CreateResumePageProps) {
  const { resumeId } = await params;

  return <DeepFocusWizard initialAnalysisId={resumeId} />;
}
