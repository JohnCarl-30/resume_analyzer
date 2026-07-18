import type { CSSProperties } from "react";
import Link from "next/link";

import { BrandMark } from "@/features/onboarding/components/wizard-icons";

import { ResumeDocumentArt } from "./resume-document-art";

const STAGE_KEYWORDS = ["Job words", "Bullet strength", "Layout scan"] as const;

const STAGE_COPY =
  "Run one AI resume check against any job post you paste in. We mark the missing words, weak bullets, and layout issues — tied to the posting.";

export function SignInBrandPanel() {
  return (
    <aside className="app-auth-stage relative hidden h-full min-h-0 flex-col justify-between gap-8 overflow-y-auto overscroll-y-contain px-8 py-10 lg:flex lg:px-12 lg:py-12">
      <div className="relative z-10">
        <Link
          href="/"
          className="brand-logo inline-flex min-h-11 items-center gap-2 text-base font-semibold tracking-tight text-foreground focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
        >
          <BrandMark />
          <span className="font-brand">Resumae</span>
        </Link>
      </div>

      <div className="relative z-10 max-w-[36ch]">
        <p
          className="animate-enter-up-safe display-serif text-[clamp(1.75rem,2vw+1rem,2.5rem)] text-foreground"
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
        className="animate-enter-up-safe relative z-10 flex justify-center pb-2"
        style={{ "--enter-delay": "160ms" } as CSSProperties}
      >
        <ResumeDocumentArt />
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {STAGE_KEYWORDS.map((word, index) => (
          <span
            key={word}
            className="app-auth-stage-keywords absolute atmosphere-label"
            style={
              {
                "--drift-delay": `${index * 3}s`,
                top: `${18 + index * 22}%`,
                left: index % 2 === 0 ? "8%" : "72%",
              } as CSSProperties
            }
          >
            {word}
          </span>
        ))}
      </div>
    </aside>
  );
}
