import React from "react";

interface ScoreRingProps {
  score: number;
  size?: number;
}

export const ScoreRing = React.memo(function ScoreRing({ score, size = 44 }: ScoreRingProps) {
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score, 0), 100) / 100;
  const offset = circumference - progress * circumference;

  // Calm brand scale — avoid traffic-light red that reads as a failing grade.
  const color =
    score >= 75 ? "var(--brand)" : score >= 50 ? "var(--brand-strong)" : "var(--page-muted)";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--page-line)" strokeWidth="4" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="motion-safe:transition-[stroke-dashoffset] motion-safe:duration-700 motion-safe:ease-out"
        />
      </svg>
      <span className="absolute text-[0.65rem] font-bold" style={{ color }}>
        {Math.round(score)}%
      </span>
    </div>
  );
});
