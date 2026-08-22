import Link from "next/link";
import { ArrowRightIcon } from "@radix-ui/react-icons";

import { ScrollReveal } from "@/components/scroll-reveal";
import { Button } from "@/components/ui/button";

/**
 * Repeats the hero's offer at the end of the page, for readers who scrolled
 * past it to decide.
 */
export function ClosingCta() {
  return (
    <section className="border-t border-border bg-muted/40">
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <ScrollReveal>
          <h2 className="display-serif text-2xl text-foreground sm:text-3xl">
            See what your resume is missing.
          </h2>
          <p className="mx-auto mt-3 max-w-[46ch] text-sm leading-6 text-muted-foreground sm:text-base">
            One free AI check per account. Building a resume from scratch stays free and needs no
            sign-in.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="cta-sheen h-11 gap-2 px-5 text-base">
              <Link href="/analysis/new">
                Check my resume
                <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 gap-2 px-5 text-base">
              <Link href="/create-resume">Build a resume first</Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
