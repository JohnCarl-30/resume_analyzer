"use client";

import { useEffect, useMemo, useState } from "react";

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
  const [motionEnabled, setMotionEnabled] = useState(true);

  const widestWord = useMemo(
    () => words.reduce((longest, word) => (word.length > longest.length ? word : longest), words[0]),
    [words],
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncMotion = () => {
      setMotionEnabled(!media.matches);
    };

    syncMotion();
    media.addEventListener("change", syncMotion);

    return () => {
      media.removeEventListener("change", syncMotion);
    };
  }, []);

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

  const offsetFor = (wordIndex: number) => {
    if (wordIndex === activeIndex) {
      return "0%";
    }

    if (wordIndex === (activeIndex - 1 + words.length) % words.length) {
      return "-100%";
    }

    return "100%";
  };

  return (
    <span className="relative inline-grid align-baseline">
      <span className="sr-only">{words[activeIndex]}</span>

      <span aria-hidden="true" className="inline-grid align-baseline">
        <span className="invisible col-start-1 row-start-1 whitespace-nowrap">{widestWord}</span>

        <span
          className="relative col-start-1 row-start-1 inline-block overflow-hidden align-baseline"
          style={{ height: "1.12em" }}
        >
          {words.map((word, wordIndex) => (
            <span
              key={word}
              className={cn(
                "absolute inset-x-0 top-0 whitespace-nowrap text-primary",
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
