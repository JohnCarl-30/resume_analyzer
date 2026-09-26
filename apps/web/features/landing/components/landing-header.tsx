"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { HeaderAuthActions } from "@/features/auth/components/header-auth-actions";
import { BrandMark } from "@/features/onboarding/components/wizard-icons";
import { cn } from "@/lib/utils";

const LIFT_AFTER_PX = 8;

// In-page anchors only: the landing page is the whole marketing site.
const SECTIONS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#markup", label: "The markup" },
  { href: "#features", label: "Features" },
  { href: "#faq", label: "FAQ" },
] as const;

export function LandingHeader() {
  const [lifted, setLifted] = useState(false);

  useEffect(() => {
    let frame = 0;

    const sync = () => {
      frame = 0;
      setLifted(window.scrollY > LIFT_AFTER_PX);
    };

    const handleScroll = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);

      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  return (
    <header className={cn("landing-header sticky top-0 z-30", lifted && "is-lifted")}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="brand-logo inline-flex items-center gap-2 text-base font-semibold tracking-tight"
        >
          <BrandMark />
          <span className="font-brand">Resumae</span>
        </Link>

        <nav aria-label="Page sections" className="hidden md:block">
          <ul className="flex items-center gap-1 text-sm text-muted-foreground">
            {SECTIONS.map((section) => (
              <li key={section.href}>
                <a
                  href={section.href}
                  className="rounded-md px-3 py-2 transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <HeaderAuthActions />
          <Button asChild size="sm" className="h-9 px-3">
            <Link href="/analysis/new">Check my resume</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
