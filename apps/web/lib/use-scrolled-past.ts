"use client";

import { useEffect, useState } from "react";

/**
 * Tracks whether the window is scrolled past `threshold`, throttled to one
 * read per frame. Used to materialize sticky chrome once content slides under it.
 */
export function useScrolledPast(threshold: number) {
  const [scrolledPast, setScrolledPast] = useState(false);

  useEffect(() => {
    let frame = 0;

    const sync = () => {
      frame = 0;
      setScrolledPast(window.scrollY > threshold);
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
  }, [threshold]);

  return scrolledPast;
}
