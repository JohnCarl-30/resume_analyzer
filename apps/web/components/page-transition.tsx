"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const transitionDuration = 180;

function isInternalNavigation(anchor: HTMLAnchorElement, event: MouseEvent) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    anchor.target === "_blank" ||
    anchor.hasAttribute("download")
  ) {
    return false;
  }

  const url = new URL(anchor.href, window.location.href);

  return url.origin === window.location.origin && url.pathname !== window.location.pathname;
}

export function PageTransition() {
  const pathname = usePathname();
  const originPathname = useRef<string | null>(null);
  const startedAt = useRef<number | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest<HTMLAnchorElement>("a[href]");

      if (!anchor || !isInternalNavigation(anchor, event)) {
        return;
      }

      originPathname.current = window.location.pathname;
      startedAt.current = performance.now();
      setIsNavigating(true);
    };

    document.addEventListener("click", handleClick);

    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    if (!isNavigating || pathname === originPathname.current) {
      return;
    }

    const elapsed = startedAt.current ? performance.now() - startedAt.current : 0;
    const timeout = window.setTimeout(
      () => {
        setIsNavigating(false);
        originPathname.current = null;
        startedAt.current = null;
      },
      Math.max(0, transitionDuration - elapsed),
    );

    return () => window.clearTimeout(timeout);
  }, [isNavigating, pathname]);

  return <div aria-hidden="true" className={`page-transition ${isNavigating ? "is-active" : ""}`} />;
}
