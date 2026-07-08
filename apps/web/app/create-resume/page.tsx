import type { Metadata } from "next";
import { CreateResumePageClient } from "./create-resume-page-client";

export const metadata: Metadata = {
  title: "Create Resume",
  description:
    "Build a local scanner-friendly resume with guided sections, live preview, autosave, and print-ready export.",
  alternates: {
    canonical: "/create-resume",
  },
};

export default function CreateResumePage() {
  return <CreateResumePageClient />;
}
