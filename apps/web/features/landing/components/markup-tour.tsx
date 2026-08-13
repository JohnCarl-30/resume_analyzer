"use client";

import type { CSSProperties } from "react";

import { ScrollReveal } from "@/components/scroll-reveal";
import { ResumeRenderer } from "@/features/editor/components/resume-renderer";
import { defaultResumeForm } from "@/features/editor/model/resume-form";
import { MARKUP_CALLOUTS } from "@/features/landing/model/markup-callouts";
import { useMarkupTour } from "@/features/landing/view-models/use-markup-tour";
import { cn } from "@/lib/utils";

function pinDelay(ms: number): CSSProperties {
  return { "--pin-delay": `${ms}ms` } as CSSProperties;
}

export function MarkupTour() {
  const { stageRef, phase, activeIndex, isHighlighting, isScanning, pin, unpin } = useMarkupTour(
    MARKUP_CALLOUTS.length,
  );

  const active = MARKUP_CALLOUTS[activeIndex];
  const lastIndex = MARKUP_CALLOUTS.length - 1;
  const reachedIndex = phase === "settled" && !isHighlighting ? MARKUP_CALLOUTS.length : activeIndex;

  return (
    <div
      className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(16rem,1fr)] lg:items-start lg:gap-14"
      style={{ "--tour-color": active.color } as CSSProperties}
    >
      <ScrollReveal as="figure" className="min-w-0" delay={80}>
        <div
          ref={stageRef}
          className={cn(
            "tour-stage relative mx-auto aspect-[1/1.32] max-w-[26rem] overflow-hidden border border-border bg-card px-6 py-7",
            isScanning && "is-scanning",
          )}
        >
          <ResumeRenderer form={defaultResumeForm} variantId="minimalist-grid" />

          <span
            aria-hidden="true"
            className={cn("tour-band", isHighlighting && "is-visible")}
            style={{
              transform: `translateY(${active.band.top}%) scaleY(${active.band.height / 100})`,
            }}
          />

          {isScanning ? <span aria-hidden="true" className="tour-scanline" /> : null}

          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-card to-transparent"
          />

          {MARKUP_CALLOUTS.map((callout, index) => {
            const isActive = isHighlighting && index === activeIndex;

            return (
              <span
                key={callout.number}
                aria-hidden="true"
                className="callout-pin absolute z-10"
                style={{
                  top: callout.pin.top,
                  left: callout.pin.left,
                  ...pinDelay(220 + index * 120),
                }}
              >
                <span
                  className="callout-pin-face"
                  data-active={isActive || undefined}
                  data-dim={(isHighlighting && !isActive) || undefined}
                >
                  {callout.number}
                </span>
                {isActive ? (
                  <span key={activeIndex} className="callout-pin-halo" />
                ) : null}
              </span>
            );
          })}
        </div>
        <figcaption className="mt-3 text-xs text-muted-foreground">
          Sample check on Resumae&rsquo;s own placeholder resume.
        </figcaption>
      </ScrollReveal>

      <ol className="flex flex-col gap-7">
        {MARKUP_CALLOUTS.map((callout, index) => {
          const isActive = isHighlighting && index === activeIndex;

          return (
            <ScrollReveal
              as="li"
              key={callout.number}
              className="tour-step relative flex gap-3"
              delay={140 + index * 90}
              data-active={isActive || undefined}
              data-dim={(isHighlighting && !isActive) || undefined}
              onMouseEnter={() => pin(index)}
              onMouseLeave={unpin}
            >
              {index < lastIndex ? (
                <span aria-hidden="true" className="tour-connector">
                  <span
                    className="tour-connector-fill"
                    style={{ transform: `scaleY(${index < reachedIndex ? 1 : 0})` }}
                  />
                </span>
              ) : null}

              <span
                aria-hidden="true"
                className="tour-step-marker mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-background font-mono text-[0.62rem] font-semibold text-foreground"
              >
                {callout.number}
              </span>
              <div className="tour-step-body min-w-0">
                <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                  <span
                    aria-hidden="true"
                    className="tour-step-dot size-1.5 shrink-0 rounded-full"
                    style={{ background: callout.color }}
                  />
                  {callout.label}
                </p>
                <p className="mt-1.5 text-sm leading-6 text-foreground">{callout.insight}</p>
              </div>
            </ScrollReveal>
          );
        })}
      </ol>
    </div>
  );
}
