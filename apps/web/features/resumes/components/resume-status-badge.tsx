import type { ResumeSummary } from "../model/resume";

const statusClasses: Record<ResumeSummary["status"], string> = {
  uploaded: "border-slate-700 bg-slate-900 text-slate-200",
  processing: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  analyzed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
};

export function ResumeStatusBadge({ status }: { status: ResumeSummary["status"] }) {
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusClasses[status]}`}>
      {status}
    </span>
  );
}
