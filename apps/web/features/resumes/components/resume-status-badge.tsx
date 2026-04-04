import type { ResumeSummary } from "../model/resume";

const statusClasses: Record<ResumeSummary["status"], string> = {
  uploaded: "border-white/10 bg-white/[0.04] text-[color:var(--app-text)]",
  processing:
    "border-[rgba(217,255,181,0.22)] bg-[rgba(217,255,181,0.08)] text-[color:var(--app-accent-strong)]",
  analyzed:
    "border-[rgba(152,229,195,0.3)] bg-[rgba(152,229,195,0.1)] text-[color:var(--app-accent)]",
};

export function ResumeStatusBadge({ status }: { status: ResumeSummary["status"] }) {
  const label = {
    uploaded: "Uploaded",
    processing: "Processing",
    analyzed: "Analyzed",
  } satisfies Record<ResumeSummary["status"], string>;

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] ${statusClasses[status]}`}
    >
      {label[status]}
    </span>
  );
}
