import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon, GearIcon, Pencil1Icon, PlusIcon } from "@radix-ui/react-icons";

import type { AnalysisQuotaNavigationState } from "@/lib/analysis-quota-navigation";
import { cn } from "@/lib/utils";

interface HomeActionTilesProps {
  quotaNav: AnalysisQuotaNavigationState;
  onNewAnalysis: () => void;
  onScratchBuilder: () => void;
  className?: string;
}

const TILE_CLASS =
  "motion-lift group flex min-h-28 flex-col justify-between rounded-[var(--radius-xl)] border border-border bg-card p-4 text-left transition-colors hover:border-foreground/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60";

function TileBody({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <>
      <span className="text-muted-foreground" aria-hidden="true">
        {icon}
      </span>
      <span className="mt-3 block">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          {title}
          <ArrowRightIcon
            className="opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden="true"
          />
        </span>
        <span className="mt-1 block text-caption leading-5 text-muted-foreground">
          {description}
        </span>
      </span>
    </>
  );
}

/**
 * The primary entry points, given the most visual weight on the page.
 *
 * Which tiles appear depends on the account's quota: an unused check offers a
 * new upload, a spent one points at the saved result instead.
 */
export function HomeActionTiles({
  quotaNav,
  onNewAnalysis,
  onScratchBuilder,
  className,
}: HomeActionTilesProps) {
  return (
    <nav
      aria-label="Start something"
      className={cn("grid gap-3 sm:grid-cols-3", className)}
    >
      {quotaNav.canUpload ? (
        <button type="button" onClick={onNewAnalysis} disabled={quotaNav.hasError} className={TILE_CLASS}>
          <TileBody
            icon={<PlusIcon />}
            title="Check my resume"
            description="Match a resume against a job post"
          />
        </button>
      ) : quotaNav.savedCheckPath ? (
        <Link href={quotaNav.savedCheckPath} className={TILE_CLASS}>
          <TileBody
            icon={<PlusIcon />}
            title="Open saved check"
            description="Your free check has been used"
          />
        </Link>
      ) : null}

      {quotaNav.canUseScratchBuilder ? (
        <button type="button" onClick={onScratchBuilder} className={TILE_CLASS}>
          <TileBody
            icon={<Pencil1Icon />}
            title="Build from scratch"
            description="Free, no sign-in needed"
          />
        </button>
      ) : null}

      <Link href="/account" className={TILE_CLASS}>
        <TileBody
          icon={<GearIcon />}
          title="Account settings"
          description="Plan, profile and sign-out"
        />
      </Link>
    </nav>
  );
}
