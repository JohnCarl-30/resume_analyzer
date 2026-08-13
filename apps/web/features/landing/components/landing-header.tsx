"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { HeaderAuthActions } from "@/features/auth/components/header-auth-actions";
import { BrandMark } from "@/features/onboarding/components/wizard-icons";
import { cn } from "@/lib/utils";

const LIFT_AFTER_PX = 8;

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
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="brand-logo inline-flex items-center gap-2 text-base font-semibold tracking-tight"
        >
          <BrandMark />
          <span className="font-brand">Resumae</span>
        </Link>
        <HeaderAuthActions />
      </div>
    </header>
  );
}
