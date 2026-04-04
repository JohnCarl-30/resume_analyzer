"use client";

import React from "react";
import { PlusIcon, SparklesIcon, BriefcaseOutlineIcon, ClockIcon, ArrowRightIcon } from "../../onboarding/components/wizard-icons";
import { ResumeStatusBadge } from "../components/resume-status-badge";
import { useResumeDashboard } from "../view-models/use-resume-dashboard";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function DashboardView({ onNewAnalysis }: { onNewAnalysis: () => void }) {
  const { resumes } = useResumeDashboard();
  
  const stats = [
    { label: "Total Resumes", value: resumes.length.toString().padStart(2, "0"), icon: <BriefcaseOutlineIcon /> },
    { label: "Avg. Match Rate", value: "84%", icon: <SparklesIcon /> },
    { label: "Optimized", value: "12", icon: <ClockIcon /> },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[color:var(--page-bg)]">
      {/* Hero Section */}
      <section className="relative border-b border-[color:var(--page-line)] bg-gradient-to-b from-[color:var(--brand-soft)] to-transparent px-6 py-12 sm:px-10 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="space-y-4">
              <h1 className="font-display text-4xl font-bold tracking-tight text-[color:var(--page-text)] sm:text-5xl">
                Ready to land your <span className="text-[color:var(--brand)]">next role</span>?
              </h1>
              <p className="max-w-xl text-lg text-[color:var(--page-muted)]">
                Analyze and optimize your resume against any job description in seconds.
                Start a focus session to see where you stand.
              </p>
            </div>
            <button
              onClick={onNewAnalysis}
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-[color:var(--brand)] px-8 py-4 text-lg font-semibold text-white shadow-[0_20px_40px_rgba(37,99,235,0.25)] transition hover:bg-[color:var(--brand-strong)] hover:shadow-[0_20px_40px_rgba(37,99,235,0.35)] active:scale-[0.98]"
            >
              <PlusIcon />
              New Analysis
              <span className="absolute inset-x-0 bottom-0 h-1 bg-white/20 transition-all group-hover:h-2" />
            </button>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-[24px] border border-[color:var(--page-line)] bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--brand-soft)] text-[color:var(--brand)] transition group-hover:scale-110">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[color:var(--page-muted)]">{stat.label}</p>
                    <p className="text-3xl font-bold tracking-tight text-[color:var(--page-text)]">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="mx-auto max-w-6xl px-6 py-12 sm:px-10">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-[color:var(--page-text)]">Recent Analyses</h2>
          <button className="text-sm font-semibold text-[color:var(--brand)] hover:underline">View all</button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="group flex flex-col justify-between overflow-hidden rounded-[24px] border border-[color:var(--page-line)] bg-white p-6 transition hover:border-[color:var(--brand-strong)] hover:shadow-lg"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 flex shrink-0 items-center justify-center rounded-xl bg-slate-50 text-[color:var(--page-muted)]">
                    <BriefcaseOutlineIcon />
                  </div>
                  <ResumeStatusBadge status={resume.status as any} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[color:var(--page-text)] group-hover:text-[color:var(--brand)]">
                    {resume.candidateName || "Untitled Analysis"}
                  </h3>
                  <p className="mt-1 text-sm text-[color:var(--page-muted)]">{resume.fileName}</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-[color:var(--page-line)] pt-4">
                <div className="flex items-center gap-2 text-xs text-[color:var(--page-muted)]">
                  <ClockIcon />
                  {dateFormatter.format(new Date(resume.uploadedAt))}
                </div>
                <button className="flex items-center gap-2 text-sm font-bold text-[color:var(--page-text)] opacity-0 transition group-hover:opacity-100">
                  Open
                  <ArrowRightIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
