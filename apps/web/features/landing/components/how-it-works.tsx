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
    <section className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <ScrollReveal as="header" className="max-w-[42ch] pb-10">
          <p className="app-section-label">How it works</p>
          <h2 className="display-serif mt-2 text-2xl text-foreground sm:text-3xl">
            Three steps, about two minutes.
          </h2>
        </ScrollReveal>

        <ol className="grid gap-8 sm:grid-cols-3 sm:gap-6">
          {STEPS.map((step, index) => (
            <ScrollReveal as="li" key={step.number} delay={index * 80}>
              <span className="step-pill" aria-hidden="true">
                {step.number}
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 max-w-[38ch] text-sm leading-6 text-muted-foreground">
                {step.body}
              </p>
            </ScrollReveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
