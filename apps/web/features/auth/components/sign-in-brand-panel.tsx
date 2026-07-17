import type { CSSProperties } from "react";
import Link from "next/link";

import { BrandMark } from "@/features/onboarding/components/wizard-icons";

import { ResumeDocumentArt } from "./resume-document-art";

export function SignInBrandPanel() {
  return (
    <aside className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-secondary px-8 py-10 lg:flex lg:px-12 lg:py-12">
      <div className="relative z-10">
        <Link
          href="/"
          className="brand-logo inline-flex items-center gap-2 text-base font-semibold tracking-tight text-foreground transition-transform duration-280"
        >
          <BrandMark />
          <span className="font-brand">Deep Focus</span>
        </Link>
      </div>

      <div className="relative z-10 max-w-[36ch]">
        <h1
          className="animate-enter-up display-serif text-[clamp(1.75rem,2vw+1rem,2.5rem)] leading-[1.15] text-foreground"
          style={{ "--enter-delay": "0ms" } as CSSProperties}
        >
          Line your resume up against the job.
        </h1>
        <p
          className="animate-enter-up mt-5 text-base leading-[1.65] text-muted-foreground"
          style={{ "--enter-delay": "80ms" } as CSSProperties}
        >
          Sign in to run your one AI check. We mark the missing words, weak bullets, and layout
          issues — tied to the posting you paste in.
        </p>
      </div>

      <div
        className="animate-enter-up relative z-10 flex justify-center pb-4 transition-transform duration-500 hover:scale-[1.02]"
        style={{ "--enter-delay": "160ms" } as CSSProperties}
      >
        <ResumeDocumentArt />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,color-mix(in_srgb,var(--brand)_12%,transparent),transparent_55%)] transition-opacity duration-700"
      />
    </aside>
  );
}
