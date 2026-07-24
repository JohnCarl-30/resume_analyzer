import type { CSSProperties } from "react";
import Link from "next/link";

import { BrandMark } from "@/features/onboarding/components/wizard-icons";

import { ResumeDocumentArt } from "./resume-document-art";

const STAGE_COPY =
  "Paste any job post and run one AI resume check. We mark missing words, weak bullets, and layout issues — tied to that posting.";

export function SignInBrandPanel() {
  return (
    <aside className="app-auth-stage relative hidden h-full min-h-0 flex-col justify-between gap-10 overflow-y-auto overscroll-y-contain px-8 py-10 lg:flex lg:px-12 lg:py-12">
      <div className="relative z-10">
        <Link
          href="/"
          className="brand-logo inline-flex min-h-11 items-center gap-2 text-base font-semibold tracking-tight text-foreground focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
        >
          <BrandMark />
          <span className="font-brand">Resumae</span>
        </Link>
      </div>

      <div className="relative z-10 max-w-[34ch]">
        <p
          className="animate-enter-up-safe display-serif text-[clamp(1.75rem,2vw+1rem,2.375rem)] leading-[1.15] tracking-[-0.02em] text-foreground text-balance"
          style={{ "--enter-delay": "0ms" } as CSSProperties}
        >
          Line your resume up against the job.
        </p>
        <p
          className="animate-enter-up-safe mt-4 text-base leading-7 text-muted-foreground text-pretty"
          style={{ "--enter-delay": "80ms" } as CSSProperties}
        >
          {STAGE_COPY}
        </p>
      </div>

      <div
        className="animate-enter-up-safe relative z-10 flex justify-center pb-1"
        style={{ "--enter-delay": "160ms" } as CSSProperties}
      >
        <ResumeDocumentArt />
      </div>
    </aside>
  );
}
