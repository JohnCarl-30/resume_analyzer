import type { CSSProperties } from "react";

const LABELS = [
  { text: "job words flagged", top: "14%", left: "4%", delay: "0s" },
  { text: "bullet strength", top: "34%", right: "3%", delay: "-6s" },
  { text: "six-second skim", top: "58%", left: "10%", delay: "-11s" },
  { text: "missing keywords", top: "72%", right: "8%", delay: "-16s" },
  { text: "layout scan", top: "22%", right: "18%", delay: "-3s" },
] as const;

export function HeroAtmosphere() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {LABELS.map((label) => (
        <span
          key={label.text}
          className="atmosphere-label absolute font-mono text-[0.62rem] tracking-[0.14em] uppercase"
          style={
            {
              top: label.top,
              left: "left" in label ? label.left : undefined,
              right: "right" in label ? label.right : undefined,
              "--drift-delay": label.delay,
            } as CSSProperties
          }
        >
          {label.text}
        </span>
      ))}
    </div>
  );
}
