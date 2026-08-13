"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

const DEFAULT_WORDS = ["resume", "bullets", "layout", "keywords"] as const;

type RotatingWordProps = {
  words?: readonly string[];
  className?: string;
  intervalMs?: number;
};

export function RotatingWord({
  words = DEFAULT_WORDS,
  className,
  intervalMs = 2800,
}: RotatingWordProps) {
  const [index, setIndex] = useState(0);
  const [widths, setWidths] = useState<readonly number[]>([]);
  const measureRef = useRef<HTMLSpanElement>(null);
  const motionEnabled = !useReducedMotion();

  const widestWord = useMemo(
    () => words.reduce((longest, word) => (word.length > longest.length ? word : longest), words[0]),
    [words],
  );

  useLayoutEffect(() => {
    const node = measureRef.current;

    if (!node) {
      return;
    }

    const measure = () => {
      setWidths(
        Array.from(node.children).map((child) => child.getBoundingClientRect().width),
      );
    };

    measure();

    // Webfonts land after first paint and change every measurement.
    document.fonts?.ready.then(measure).catch(() => {});
    window.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("resize", measure);
    };
  }, [words]);

  useEffect(() => {
    if (!motionEnabled || words.length < 2) {
      return;
    }

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, intervalMs);

    return () => {
      window.clearInterval(id);
    };
  }, [intervalMs, motionEnabled, words.length]);

  const activeIndex = motionEnabled ? index : 0;
  const activeWidth = widths[activeIndex];

  const offsetFor = (wordIndex: number) => {
    if (wordIndex === activeIndex) {
      return "0%";
    }

    // Parked words sit clear of the clip box; at exactly 100% a descender
    // still pokes into view above the active word.
    if (wordIndex === (activeIndex - 1 + words.length) % words.length) {
      return "-130%";
    }

    return "130%";
  };

  return (
    <span className="relative inline-grid align-baseline">
      <span className="sr-only">{words[activeIndex]}</span>

      <span
        aria-hidden="true"
        ref={measureRef}
        className="pointer-events-none invisible absolute top-0 left-0 flex"
      >
        {words.map((word) => (
          <span key={word} className="whitespace-nowrap">
            {word}
          </span>
        ))}
      </span>

      <span aria-hidden="true" className="inline-grid align-baseline">
        {/* Reserves the widest word until measurement lands, so nothing jumps on first paint. */}
        <span
          className={cn("col-start-1 row-start-1 whitespace-nowrap", activeWidth && "hidden")}
          style={{ visibility: "hidden" }}
        >
          {widestWord}
        </span>

        <span
          className={cn(
            "rotating-word relative col-start-1 row-start-1 inline-block overflow-hidden align-baseline",
            motionEnabled && activeWidth ? "is-sized" : undefined,
          )}
          style={{ height: "1.12em", width: activeWidth ? `${activeWidth}px` : undefined }}
        >
          {words.map((word, wordIndex) => (
            <span
              key={word}
              className={cn(
                "absolute top-0 left-0 whitespace-nowrap text-primary",
                motionEnabled && "transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                className,
              )}
              style={{ transform: `translateY(${offsetFor(wordIndex)})` }}
            >
              {word}
            </span>
          ))}
        </span>
      </span>
    </span>
  );
}
