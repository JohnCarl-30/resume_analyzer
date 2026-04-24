import React from "react";
import type { ResumeAnalysisResult, AnalysisSuggestion } from "../../editor/model/resume-analysis";
import { ArrowRightIcon } from "./wizard-icons";

export interface StepSuggestionsProps {
  analysisResult: ResumeAnalysisResult;
  onEnterEditor: () => void;
  onBack: () => void;
}

function SeverityBadge({ severity }: { severity: AnalysisSuggestion["severity"] }) {
  if (severity === "high") {
    return (
      <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-rose-700">
        Critical
      </span>
    );
  }
  if (severity === "medium") {
    return (
      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-amber-700">
        Impact
      </span>
    );
  }
  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-600">
      Edit
    </span>
  );
}

function SuggestionCard({ suggestion }: { suggestion: AnalysisSuggestion }) {
  const accentClass =
    suggestion.severity === "high"
      ? "border-rose-300 bg-rose-50/70"
      : suggestion.severity === "medium"
        ? "border-amber-300 bg-amber-50/80"
        : "border-slate-200 bg-slate-50/80";

  return (
    <article
      className={`rounded-[18px] border px-4 py-4 shadow-[0_10px_24px_rgba(26,32,61,0.05)] ${accentClass}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-[color:var(--page-text)]">{suggestion.title}</h3>
        <SeverityBadge severity={suggestion.severity} />
      </div>
      <p className="mt-2 text-sm leading-7 text-[color:var(--page-muted)]">{suggestion.detail}</p>
    </article>
  );
}

export function StepSuggestions({ analysisResult, onEnterEditor, onBack }: StepSuggestionsProps) {
  const { suggestions, matchedKeywords, missingKeywords } = analysisResult;
  const totalCount = suggestions.length;
  const criticalCount = suggestions.filter((s) => s.severity === "high").length;

  return (
    <section className="section-reveal flex flex-1 flex-col px-5 py-8 sm:px-8 lg:px-12">
      <div className="w-full flex-1 flex flex-col">
        <div className="space-y-3 text-left sm:text-center">
          <div className="sm:flex sm:justify-center">
            <span className="step-pill">STEP 5 OF 5</span>
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-[color:var(--page-text)]">
            Your improvement suggestions
          </h1>
          <p className="max-w-[42rem] text-sm leading-6 text-[color:var(--page-muted)] sm:mx-auto">
            Review the AI-generated recommendations below. When you&apos;re ready, enter the editor to apply them.
          </p>
        </div>

        {/* Summary bar */}
        <div className="mx-auto mt-8 w-full max-w-2xl grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-[16px] border border-[color:var(--page-line)] bg-white px-4 py-3 text-center shadow-[0_4px_12px_rgba(26,32,61,0.05)]">
            <p className="text-2xl font-semibold text-[color:var(--page-text)]">{totalCount}</p>
            <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.12em] text-[color:var(--page-muted)]">
              Total
            </p>
          </div>
          <div className="rounded-[16px] border border-rose-200 bg-rose-50/60 px-4 py-3 text-center shadow-[0_4px_12px_rgba(26,32,61,0.05)]">
            <p className="text-2xl font-semibold text-rose-700">{criticalCount}</p>
            <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.12em] text-rose-500">
              Critical
            </p>
          </div>
          <div className="rounded-[16px] border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-center shadow-[0_4px_12px_rgba(26,32,61,0.05)]">
            <p className="text-2xl font-semibold text-emerald-700">{matchedKeywords.length}</p>
            <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.12em] text-emerald-600">
              Matched
            </p>
          </div>
          <div className="rounded-[16px] border border-amber-200 bg-amber-50/60 px-4 py-3 text-center shadow-[0_4px_12px_rgba(26,32,61,0.05)]">
            <p className="text-2xl font-semibold text-amber-700">{missingKeywords.length}</p>
            <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.12em] text-amber-600">
              Missing
            </p>
          </div>
        </div>

        {/* Suggestion list */}
        <div className="mx-auto mt-6 w-full max-w-2xl flex-1 overflow-y-auto">
          {suggestions.length === 0 ? (
            <div className="flex items-center justify-center rounded-[20px] border border-[color:var(--page-line)] bg-white px-6 py-12 text-center shadow-[0_4px_12px_rgba(26,32,61,0.04)]">
              <p className="text-sm leading-6 text-[color:var(--page-muted)]">
                No suggestions — your resume looks well-matched to this role.
              </p>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {suggestions.map((suggestion) => (
                <SuggestionCard key={suggestion.id} suggestion={suggestion} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="mt-auto border-t border-[color:var(--page-line)] pt-6">
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[color:var(--page-line)] bg-white px-5 py-3 text-sm font-semibold text-[color:var(--page-muted)] transition hover:border-[color:var(--page-line-strong)] hover:text-[color:var(--page-text)]"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onEnterEditor}
            className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[color:var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(79,107,255,0.22)] transition hover:bg-[color:var(--brand-strong)]"
          >
            Enter Editor
            <ArrowRightIcon />
          </button>
        </div>
      </div>
    </section>
  );
}
