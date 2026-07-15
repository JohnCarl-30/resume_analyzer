export function ResumeDocumentArt() {
  return (
    <figure
      aria-hidden="true"
      className="auth-document-art mx-auto w-full max-w-[15rem] text-foreground"
    >
      <svg viewBox="0 0 200 260" fill="none" className="h-auto w-full" role="presentation">
        <rect
          x="24"
          y="12"
          width="152"
          height="236"
          rx="2"
          fill="var(--card)"
          stroke="var(--border)"
          strokeWidth="1.2"
        />
        <rect x="40" y="32" width="72" height="8" rx="1" fill="var(--page-line)" />
        <rect x="40" y="48" width="112" height="4" rx="1" fill="color-mix(in srgb, var(--page-line) 70%, transparent)" />
        <rect x="40" y="58" width="96" height="4" rx="1" fill="color-mix(in srgb, var(--page-line) 70%, transparent)" />

        <rect x="40" y="78" width="40" height="3" rx="1" fill="var(--page-muted)" opacity="0.45" />
        <rect x="40" y="90" width="108" height="3" rx="1" fill="var(--page-line)" />
        <rect x="40" y="100" width="100" height="3" rx="1" fill="var(--page-line)" />
        <rect x="40" y="110" width="92" height="3" rx="1" fill="var(--page-line)" />

        <rect x="40" y="130" width="40" height="3" rx="1" fill="var(--page-muted)" opacity="0.45" />
        <rect x="40" y="142" width="108" height="3" rx="1" fill="var(--page-line)" />
        <rect x="40" y="152" width="104" height="3" rx="1" fill="var(--page-line)" />
        <rect x="40" y="162" width="88" height="3" rx="1" fill="var(--page-line)" />

        <rect x="40" y="182" width="40" height="3" rx="1" fill="var(--page-muted)" opacity="0.45" />
        <rect x="40" y="194" width="96" height="3" rx="1" fill="var(--page-line)" />
        <rect x="40" y="204" width="80" height="3" rx="1" fill="var(--page-line)" />

        <circle cx="168" cy="44" r="9" fill="var(--background)" stroke="var(--border)" strokeWidth="1" />
        <text
          x="168"
          y="47.5"
          textAnchor="middle"
          fontSize="7"
          fontFamily="var(--font-mono)"
          fontWeight="600"
          fill="var(--foreground)"
        >
          01
        </text>

        <circle cx="30" cy="148" r="9" fill="var(--background)" stroke="var(--border)" strokeWidth="1" />
        <text
          x="30"
          y="151.5"
          textAnchor="middle"
          fontSize="7"
          fontFamily="var(--font-mono)"
          fontWeight="600"
          fill="var(--foreground)"
        >
          02
        </text>

        <circle cx="168" cy="198" r="9" fill="var(--background)" stroke="var(--border)" strokeWidth="1" />
        <text
          x="168"
          y="201.5"
          textAnchor="middle"
          fontSize="7"
          fontFamily="var(--font-mono)"
          fontWeight="600"
          fill="var(--foreground)"
        >
          03
        </text>
      </svg>
    </figure>
  );
}
