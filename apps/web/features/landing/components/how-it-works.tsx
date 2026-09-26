import { ScrollReveal } from "@/components/scroll-reveal";

const STEPS = [
  {
    number: "01",
    title: "Paste the job post",
    body: "The posting is the yardstick. Every note we make is measured against it, not against a generic template.",
  },
  {
    number: "02",
    title: "Upload your resume",
    body: "PDF or DOCX. We pull the text out and read it the way a recruiter skims it — in about six seconds.",
  },
  {
    number: "03",
    title: "Read the markup",
    body: "Missing words, bullets that undersell you, and layout that slows a skim. Each note says what to change.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16 border-t border-border bg-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-12 lg:gap-12 lg:px-8">
        <ScrollReveal as="header" className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <p className="app-section-label">How it works</p>
            <h2 className="display-serif mt-2 text-3xl text-foreground sm:text-4xl">
              Three steps, about two minutes.
            </h2>
          </div>
        </ScrollReveal>

        <ol className="divide-y divide-border border-y border-border lg:col-span-8">
          {STEPS.map((step, index) => (
            <ScrollReveal
              as="li"
              key={step.number}
              delay={index * 80}
              className="grid gap-3 py-7 sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-6 sm:py-8"
            >
              <span className="step-numeral" aria-hidden="true">
                {step.number}
              </span>
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-[52ch] text-base leading-7 text-pretty text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
