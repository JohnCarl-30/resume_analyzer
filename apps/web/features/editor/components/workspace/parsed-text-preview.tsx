import React from "react";

function isLikelyHeading(line: string) {
  const normalizedLine = line.trim();

  if (!normalizedLine) {
    return false;
  }

  return /^(summary|objective|education|experience|work experience|leadership|projects|skills|awards|honors|publications|certifications)$/i.test(
    normalizedLine,
  );
}

function normalizeResumeBlocks(text: string) {
  return text
    .split(/\n{2,}/)
    .map((block) =>
      block
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    )
    .filter((block) => block.length > 0);
}

interface ParsedTextPreviewProps {
  text: string;
}

export const ParsedTextPreview = React.memo(function ParsedTextPreview({ text }: ParsedTextPreviewProps) {
  const blocks = normalizeResumeBlocks(text).slice(0, 28);

  return (
    <div className="resume-document text-slate-800">
      {blocks.map((block, blockIndex) => {
        const firstLine = block[0] ?? "";
        const remainingLines = block.slice(1);

        if (isLikelyHeading(firstLine)) {
          return (
            <section key={`${firstLine}-${blockIndex}`} className="pt-7 first:pt-0">
              <div className="border-b border-slate-300 pb-2">
                <h3 className="text-[1.75rem] font-semibold uppercase tracking-[0.08em] text-slate-900">
                  {firstLine}
                </h3>
              </div>
              <div className="space-y-2 pt-4">
                {remainingLines.map((line, lineIndex) => (
                  <p key={`${line}-${lineIndex}`} className="whitespace-pre-wrap">
                    {line}
                  </p>
                ))}
              </div>
            </section>
          );
        }

        return (
          <div key={`${firstLine}-${blockIndex}`} className="mb-5 space-y-1 last:mb-0">
            {block.map((line, lineIndex) =>
              blockIndex === 0 && lineIndex === 0 ? (
                <h1
                  key={`${line}-${lineIndex}`}
                  className="text-center text-[2.65rem] font-semibold uppercase tracking-tight text-slate-950"
                >
                  {line}
                </h1>
              ) : (
                <p
                  key={`${line}-${lineIndex}`}
                  className={`${blockIndex === 0 ? "text-center text-[1.02rem] text-slate-500" : "whitespace-pre-wrap"}`}
                >
                  {line}
                </p>
              ),
            )}
          </div>
        );
      })}
    </div>
  );
});
