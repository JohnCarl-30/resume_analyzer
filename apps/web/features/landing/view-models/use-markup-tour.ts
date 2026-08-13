"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/lib/use-reduced-motion";

export type MarkupTourPhase = "idle" | "scanning" | "touring" | "settled";

const SCAN_MS = 1500;
const STEP_MS = 2600;
const HOLD_MS = 2200;

export function useMarkupTour(count: number) {
  const reducedMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<MarkupTourPhase>("idle");
  const [step, setStep] = useState(0);
  const [pinned, setPinned] = useState<number | null>(null);

  useEffect(() => {
    if (reducedMotion) {
      setPhase("settled");
      return;
    }

    const element = stageRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        observer.disconnect();
        setPhase((current) => (current === "idle" ? "scanning" : current));
      },
      { threshold: 0.35 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (phase !== "scanning") {
      return;
    }

    const id = window.setTimeout(() => {
      setStep(0);
      setPhase("touring");
    }, SCAN_MS);

    return () => {
      window.clearTimeout(id);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "touring" || pinned !== null) {
      return;
    }

    const isLastStep = step >= count - 1;

    const id = window.setTimeout(
      () => {
        if (isLastStep) {
          setPhase("settled");
          return;
        }

        setStep((current) => current + 1);
      },
      isLastStep ? HOLD_MS : STEP_MS,
    );

    return () => {
      window.clearTimeout(id);
    };
  }, [count, phase, pinned, step]);

  const pin = useCallback((index: number) => {
    setPinned(index);
    setStep(index);
  }, []);

  const unpin = useCallback(() => {
    setPinned(null);
  }, []);

  const activeIndex = pinned ?? step;
  const isHighlighting = pinned !== null || phase === "touring";

  return {
    stageRef,
    phase,
    activeIndex,
    isHighlighting,
    isScanning: phase === "scanning",
    reducedMotion,
    pin,
    unpin,
  };
}
