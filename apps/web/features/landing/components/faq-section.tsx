import { PlusIcon } from "@radix-ui/react-icons";

import { ScrollReveal } from "@/components/scroll-reveal";

const FAQS = [
  {
    question: "What does the free check include?",
    answer:
      "One full AI review per account: keyword match against the posting, a score, bullet-level suggestions and layout notes. The result is saved, so you can reopen it any time without spending another check.",
  },
  {
    question: "Do I need an account to build a resume?",
    answer:
      "No. The builder and all four templates are free and need no sign-in. Your draft stays in your browser until you choose to save it. Signing in is only needed to run an AI check.",
  },
  {
    question: "Which file types can I upload?",
    answer:
      "PDF and DOCX. The text is extracted server-side, so a resume exported from Word, Google Docs or another builder all work the same way.",
  },
  {
    question: "Will the templates pass an applicant tracking system?",
    answer:
      "They are built to. No multi-column tricks, no text inside images, and section headings a parser recognises. The layout notes in a check flag anything in your own resume that would slow a scanner down.",
  },
  {
    question: "Does it rewrite my resume for me?",
    answer:
      "Only when you ask. Suggestions appear next to the bullet they refer to, and nothing changes until you accept it. You can edit a suggestion before applying it, or ignore it entirely.",
  },
] as const;

export function FaqSection() {
  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <ScrollReveal as="header" className="pb-8 text-center">
          <p className="app-section-label">Questions</p>
          <h2 className="display-serif mt-2 text-2xl text-foreground sm:text-3xl">
            Before you upload anything.
          </h2>
        </ScrollReveal>

        <div className="divide-y divide-border border-y border-border">
          {FAQS.map((faq, index) => (
            <ScrollReveal key={faq.question} delay={index * 50}>
              {/* A native details element: keyboard and screen-reader behaviour
                  come for free, and it works before hydration. */}
              <details className="disclosure group">
                <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-4 py-5 text-left">
                  <span className="text-base font-medium text-foreground">{faq.question}</span>
                  <PlusIcon
                    className="disclosure-marker shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </summary>
                <div className="disclosure-panel">
                  <p className="max-w-[64ch] pb-5 text-sm leading-6 text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              </details>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
