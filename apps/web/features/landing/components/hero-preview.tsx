import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons";

const MATCHED = ["TypeScript", "Postgres", "CI/CD"];
const MISSING = ["Kubernetes", "gRPC"];

function ResumeLine({ width, tone }: { width: string; tone?: "keyword" | "bullet" }) {
  const background =
    tone === "keyword"
      ? "color-mix(in oklab, var(--primary) 18%, transparent)"
      : tone === "bullet"
        ? "color-mix(in oklab, var(--tag-bullet) 20%, transparent)"
        : "color-mix(in oklab, var(--foreground) 11%, transparent)";

  return <span className="block h-2 rounded-full" style={{ width, background }} />;
}

/**
 * A static rendering of an analysis result, used as the hero's product shot.
 *
 * Built as markup rather than a screenshot so it stays sharp at any width,
 * follows the active theme, and never goes stale when the real UI changes.
 */
export function HeroPreview() {
  return (
    <div
      role="img"
      aria-label="A resume check in progress: a match score of 78, matched keywords, missing keywords, and a suggestion to add an outcome to a bullet."
      className="motion-lift overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-card shadow-[var(--shadow-lg)]"
    >
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-muted-foreground/25" />
          <span className="size-2.5 rounded-full bg-muted-foreground/25" />
          <span className="size-2.5 rounded-full bg-muted-foreground/25" />
        </span>
        <span className="ml-2 truncate text-caption text-muted-foreground">
          Senior Backend Engineer · resume check
        </span>
      </div>

      <div className="grid gap-px bg-border sm:grid-cols-[1.35fr_1fr]">
        <div className="bg-card p-5 sm:p-6" aria-hidden="true">
          <p className="text-sm font-semibold tracking-tight text-foreground">Alex Chen</p>
          <p className="mt-0.5 text-caption text-muted-foreground">Backend Engineer</p>

          <div className="mt-4 space-y-2">
            <ResumeLine width="92%" />
            <ResumeLine width="72%" tone="keyword" />
          </div>

          <p className="mt-5 text-caption font-medium tracking-wide text-muted-foreground">
            EXPERIENCE
          </p>
          <div className="mt-2 space-y-2">
            <ResumeLine width="88%" />
            <ResumeLine width="80%" tone="bullet" />
            <ResumeLine width="64%" />
            <ResumeLine width="84%" />
            <ResumeLine width="58%" />
          </div>

          <p className="mt-5 text-caption font-medium tracking-wide text-muted-foreground">
            SKILLS
          </p>
          <div className="mt-2 space-y-2">
            <ResumeLine width="76%" />
            <ResumeLine width="62%" tone="keyword" />
          </div>

          <p className="mt-5 text-caption font-medium tracking-wide text-muted-foreground">
            EDUCATION
          </p>
          <div className="mt-2 space-y-2">
            <ResumeLine width="70%" />
            <ResumeLine width="48%" />
          </div>
        </div>

        <div className="space-y-5 bg-card p-5 sm:p-6">
          <div>
            <p className="text-caption text-muted-foreground">Match score</p>
            <p className="display-serif mt-1 text-5xl leading-none text-foreground">78</p>
          </div>

          <div className="space-y-2">
            <p className="text-caption text-muted-foreground">Found in your resume</p>
            <ul className="flex flex-wrap gap-1.5">
              {MATCHED.map((keyword) => (
                <li
                  key={keyword}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs"
                  style={{
                    background: "color-mix(in oklab, var(--success) 14%, transparent)",
                    color: "var(--success)",
                  }}
                >
                  <CheckIcon aria-hidden="true" />
                  {keyword}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-caption text-muted-foreground">Missing from your resume</p>
            <ul className="flex flex-wrap gap-1.5">
              {MISSING.map((keyword) => (
                <li
                  key={keyword}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs"
                  style={{
                    background: "color-mix(in oklab, var(--primary) 14%, transparent)",
                    color: "var(--primary)",
                  }}
                >
                  <Cross2Icon aria-hidden="true" />
                  {keyword}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-border bg-muted/40 p-3">
            <p className="text-caption text-muted-foreground">Bullet note</p>
            <p className="mt-1 text-sm leading-6 text-foreground">
              &ldquo;Maintained the billing service&rdquo; — what changed because you did?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
