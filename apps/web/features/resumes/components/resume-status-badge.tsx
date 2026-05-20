import type React from "react";
import type { ResumeSummary } from "../model/resume";
import { Badge } from "@/components/ui/badge";

const statusVariant: Record<ResumeSummary["status"], React.ComponentProps<typeof Badge>["variant"]> = {
  uploaded: "outline",
  processing: "secondary",
  analyzed: "default",
};

export function ResumeStatusBadge({ status }: { status: ResumeSummary["status"] }) {
  const label = {
    uploaded: "Uploaded",
    processing: "Processing",
    analyzed: "Analyzed",
  } satisfies Record<ResumeSummary["status"], string>;

  return <Badge variant={statusVariant[status]}>{label[status]}</Badge>;
}
