import type { CSSProperties } from "react";

const CALLOUTS = [
  {
    label: "Job words",
    dot: "var(--brand)",
    cx: 168,
    cy: 44,
    labelAnchor: "start" as const,
    labelX: 14,
    pinDelay: "200ms",
  },
  {
    label: "Bullets",
    dot: "var(--tag-bullet)",
    cx: 36,
    cy: 148,
    labelAnchor: "end" as const,
    labelX: -12,
    pinDelay: "320ms",
  },
  {
    label: "Layout",
    dot: "var(--success)",
    cx: 168,
    cy: 198,
    labelAnchor: "start" as const,
    labelX: 14,
    pinDelay: "440ms",
  },
] as const;

/** Annotated resume vignette for auth — echoes landing callout vocabulary. */
export function ResumeDocumentArt() {
  return (
    <figure
      aria-hidden="true"
      className="auth-document-art mx-auto w-full max-w-[17.5rem] text-foreground"
    >
      <svg viewBox="0 0 220 280" fill="none" className="h-auto w-full" role="presentation">
        <rect
          x="34"
          y="16"
          width="152"
          height="236"
          rx="2"
          fill="var(--card)"
          stroke="var(--border)"
          strokeWidth="1.2"
        />
        <rect x="50" y="36" width="72" height="8" rx="1" fill="var(--page-line)" />
        <rect
          x="50"
          y="52"
          width="112"
          height="4"
          rx="1"
          fill="color-mix(in srgb, var(--page-line) 70%, transparent)"
        />
        <rect
          x="50"
          y="62"
          width="96"
          height="4"
          rx="1"
          fill="color-mix(in srgb, var(--page-line) 70%, transparent)"
        />

        <rect x="50" y="82" width="40" height="3" rx="1" fill="var(--page-muted)" opacity="0.45" />
        <rect x="50" y="94" width="108" height="3" rx="1" fill="var(--page-line)" />
        <rect x="50" y="104" width="100" height="3" rx="1" fill="var(--page-line)" />
        <rect x="50" y="114" width="92" height="3" rx="1" fill="var(--page-line)" />

        <rect x="50" y="134" width="40" height="3" rx="1" fill="var(--page-muted)" opacity="0.45" />
        <rect x="50" y="146" width="108" height="3" rx="1" fill="var(--page-line)" />
        <rect x="50" y="156" width="104" height="3" rx="1" fill="var(--page-line)" />
        <rect x="50" y="166" width="88" height="3" rx="1" fill="var(--page-line)" />

        <rect x="50" y="186" width="40" height="3" rx="1" fill="var(--page-muted)" opacity="0.45" />
        <rect x="50" y="198" width="96" height="3" rx="1" fill="var(--page-line)" />
        <rect x="50" y="208" width="80" height="3" rx="1" fill="var(--page-line)" />

        {CALLOUTS.map((callout) => (
          <g
            key={callout.label}
            className="auth-callout-pin"
            style={
              {
                transformBox: "fill-box",
                transformOrigin: "center",
                "--pin-delay": callout.pinDelay,
              } as CSSProperties
            }
            transform={`translate(${callout.cx} ${callout.cy})`}
          >
            <circle cx="0" cy="0" r="5" fill={callout.dot} />
            <text
              x={callout.labelX}
              y="3"
              textAnchor={callout.labelAnchor}
              fontSize="8"
              fontFamily="var(--font-ui)"
              fontWeight="600"
              fill="var(--page-muted)"
            >
              {callout.label}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  );
}
