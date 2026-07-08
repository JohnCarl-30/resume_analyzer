import type { Metadata } from "next";
import { redirect } from "next/navigation";

interface ResumeDetailPageProps {
  params: Promise<{ resumeId: string }>;
}

export async function generateMetadata({ params }: ResumeDetailPageProps): Promise<Metadata> {
  const { resumeId } = await params;

  return {
    title: "Resume Draft",
    description: "Open this resume draft in the resume analysis workspace.",
    alternates: {
      canonical: `/create-resume/${resumeId}`,
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ResumeDetailPage({ params }: ResumeDetailPageProps) {
  const { resumeId } = await params;
  redirect(`/analysis/${resumeId}`);
}
