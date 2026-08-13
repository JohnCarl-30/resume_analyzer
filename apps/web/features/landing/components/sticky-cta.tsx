"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

const REVEAL_AFTER_PX = 220;

export function StickyCta() {
  const reducedMotion = useReducedMotion();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setRevealed(true);
      return;
    }

    let frame = 0;

    const sync = () => {
      frame = 0;
      // A viewport tall enough to show the whole page never scrolls, so the bar
      // would otherwise stay hidden and the page would lose its trailing CTA.
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight > REVEAL_AFTER_PX;
      setRevealed(!scrollable || window.scrollY > REVEAL_AFTER_PX);
    };

    const handleScroll = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);

      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [reducedMotion]);

  return (
    <aside
      className={cn(
        "sticky-cta sticky bottom-0 border-t border-border bg-background/95 backdrop-blur-sm",
        revealed && "is-revealed",
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">One AI check per account, free to start.</p>
        <Button asChild size="lg" className="h-11 justify-between gap-2 px-4 text-base sm:w-auto">
          <Link href="/analysis/new">
            Check my resume
            <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </aside>
  );
}
