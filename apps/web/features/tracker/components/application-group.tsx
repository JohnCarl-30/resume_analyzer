import type { ReactNode } from "react";
import { ChevronDownIcon } from "@radix-ui/react-icons";

import { Badge } from "@/components/ui/badge";
import { STATUS_META, type JobApplicationStatus } from "../model/job-application";

interface ApplicationGroupProps {
  status: JobApplicationStatus;
  count: number;
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * One status worth of applications, collapsible and counted.
 *
 * A native details element, so the open state survives without React and the
 * summary is reachable by keyboard for free.
 */
export function ApplicationGroup({
  status,
  count,
  defaultOpen = true,
  children,
}: ApplicationGroupProps) {
  const meta = STATUS_META[status];

  return (
    <details className="disclosure group" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center gap-3 py-3">
        <ChevronDownIcon
          className="disclosure-marker shrink-0 text-muted-foreground"
          data-marker="chevron"
          aria-hidden="true"
        />
        <span className="text-sm font-semibold text-foreground">{meta.label}</span>
        <Badge variant="secondary" className="text-caption">
          {count}
        </Badge>
      </summary>

      <div className="disclosure-panel">
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card">
          {children}
        </div>
      </div>
    </details>
  );
}
