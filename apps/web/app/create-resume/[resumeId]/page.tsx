import { redirect } from "next/navigation";

interface ResumeDetailPageProps {
  params: Promise<{ resumeId: string }>;
}

export default async function ResumeDetailPage({ params }: ResumeDetailPageProps) {
  const { resumeId } = await params;
  redirect(`/analysis/${resumeId}`);
}
