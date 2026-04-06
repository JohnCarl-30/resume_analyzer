import React from "react";
import type { ResumeForm } from "../model/resume-form";
import type { ResumeTemplateVariant } from "../../templates/model/template";

interface ResumeRendererProps {
  form: ResumeForm;
  variantId: ResumeTemplateVariant;
}

export function ResumeRenderer({ form, variantId }: ResumeRendererProps) {
  if (variantId === "minimalist-grid") {
    return <MinimalistGridLayout form={form} />;
  }

  if (variantId === "harvard-classic") {
    return <HarvardClassicLayout form={form} />;
  }

  if (variantId === "modern-sans") {
    return <ModernSansLayout form={form} />;
  }

  if (variantId === "ruby-accent") {
    return <RubyAccentLayout form={form} />;
  }

  return <MinimalistGridLayout form={form} />;
}

function HarvardClassicLayout({ form }: { form: ResumeForm }) {
  return (
    <div className="font-serif text-[#0f172a] h-full">
      <header className="text-center mb-8 border-b border-gray-300 pb-6">
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-3">
          {form.personalInfo.fullName}
        </h1>
        <div className="flex justify-center gap-4 text-[0.95rem] text-gray-600">
          <span>{form.personalInfo.phone}</span>
          <span className="opacity-40">|</span>
          <span>{form.personalInfo.email}</span>
        </div>
      </header>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-bold uppercase border-b border-gray-900 mb-4 pb-0.5">Education</h2>
          <div className="space-y-4">
            {form.education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-start">
                <div>
                  <div className="font-bold">{edu.institution}</div>
                  <div className="italic">{edu.degree}</div>
                </div>
                <div className="text-right text-[0.95rem]">
                  <div className="font-medium">{edu.location}</div>
                  <div>{edu.dateRange}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold uppercase border-b border-gray-900 mb-4 pb-0.5">Experience</h2>
          <div className="space-y-6">
            {form.experience.map((exp) => (
              <div key={exp.id} className="flex justify-between items-start">
                <div>
                  <div className="font-bold">{exp.role}</div>
                </div>
                <div className="text-right text-[0.95rem]">
                  <div className="font-medium">{exp.location}</div>
                  <div>{exp.dateRange}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {form.leadership.length > 0 && (
          <section>
            <h2 className="text-lg font-bold uppercase border-b border-gray-900 mb-4 pb-0.5">Leadership</h2>
            <div className="space-y-4">
              {form.leadership.map((lead) => (
                <div key={lead.id} className="flex justify-between items-start">
                  <div>
                    <div className="font-bold">{lead.role}</div>
                    <div className="italic text-gray-600">{lead.organization}</div>
                  </div>
                  <div className="text-right text-[0.95rem]">
                    <div className="font-medium">{lead.location}</div>
                    <div>{lead.dateRange}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {form.projects.length > 0 && (
          <section>
            <h2 className="text-lg font-bold uppercase border-b border-gray-900 mb-4 pb-0.5">Projects</h2>
            <div className="space-y-5">
              {form.projects.map((project) => (
                <div key={project.id}>
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <span className="font-bold">{project.name}</span>
                      <span className="mx-2 opacity-40">|</span>
                      <span className="italic text-gray-600">{project.technologies}</span>
                    </div>
                    <div className="text-right text-sm">
                      {project.startDate} — {project.endDate}
                    </div>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[0.95rem] text-gray-700 ml-2">
                    {project.bullets.map((bullet, i) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {form.awards.length > 0 && (
          <section>
            <h2 className="text-lg font-bold uppercase border-b border-gray-900 mb-4 pb-0.5">Awards & Honors</h2>
            <ul className="list-disc list-inside space-y-1 text-[0.95rem] text-gray-700 ml-2">
              {form.awards.map((award, i) => (
                <li key={i}>{award}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

function ModernSansLayout({ form }: { form: ResumeForm }) {
  return (
    <div className="font-sans text-[#1e293b] h-full">
      <header className="mb-10 flex justify-between items-end border-b-2 border-slate-900 pb-8">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tighter uppercase leading-none mb-2">
            {form.personalInfo.fullName.split(" ")[0]}
            <br />
            <span className="text-slate-500">{form.personalInfo.fullName.split(" ").slice(1).join(" ")}</span>
          </h1>
        </div>
        <div className="text-right text-sm space-y-1 font-medium text-slate-600">
          <div>{form.personalInfo.phone}</div>
          <div>{form.personalInfo.email}</div>
        </div>
      </header>

      <div className="space-y-10">
        <section>
          <div className="flex items-center gap-4 mb-5">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] whitespace-nowrap">Education</h2>
            <div className="h-[2px] w-full bg-slate-100" />
          </div>
          <div className="space-y-6">
            {form.education.map((edu) => (
              <div key={edu.id} className="grid grid-cols-[1fr_auto] gap-4">
                <div>
                  <div className="font-bold text-lg">{edu.institution}</div>
                  <div className="text-slate-600 font-medium">{edu.degree}</div>
                </div>
                <div className="text-right text-sm font-bold text-slate-400 uppercase tracking-wider">
                  {edu.dateRange}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-4 mb-5">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] whitespace-nowrap">Experience</h2>
            <div className="h-[2px] w-full bg-slate-100" />
          </div>
          <div className="space-y-8">
            {form.experience.map((exp) => (
              <div key={exp.id} className="grid grid-cols-[1fr_auto] gap-4">
                <div>
                  <div className="font-bold text-lg">{exp.role}</div>
                  <div className="text-slate-500 font-medium">{exp.location}</div>
                </div>
                <div className="text-right text-sm font-bold text-slate-400 uppercase tracking-wider">
                  {exp.dateRange}
                </div>
              </div>
            ))}
          </div>
        </section>

        {form.leadership.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-5">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] whitespace-nowrap">Leadership</h2>
              <div className="h-[2px] w-full bg-slate-100" />
            </div>
            <div className="space-y-6">
              {form.leadership.map((lead) => (
                <div key={lead.id} className="grid grid-cols-[1fr_auto] gap-4">
                  <div>
                    <div className="font-bold text-lg">{lead.role}</div>
                    <div className="text-slate-500 font-medium">{lead.organization}</div>
                  </div>
                  <div className="text-right text-sm font-bold text-slate-400 uppercase tracking-wider">
                    {lead.dateRange}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {form.projects.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-5">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] whitespace-nowrap">Key Projects</h2>
              <div className="h-[2px] w-full bg-slate-100" />
            </div>
            <div className="space-y-8">
              {form.projects.map((project) => (
                <div key={project.id} className="grid grid-cols-[1fr_auto] gap-4">
                  <div>
                    <div className="font-bold text-lg">{project.name}</div>
                    <div className="text-slate-500 text-sm mb-3 font-mono">{project.technologies}</div>
                    <ul className="space-y-2 ml-1">
                      {project.bullets.map((bullet, i) => (
                        <li key={i} className="flex gap-3 text-[0.95rem] text-slate-700">
                          <span className="text-slate-300 font-black">/</span>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-right text-sm font-bold text-slate-400 uppercase tracking-wider">
                    {project.endDate}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {form.awards.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-5">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] whitespace-nowrap">Awards & Honors</h2>
              <div className="h-[2px] w-full bg-slate-100" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {form.awards.map((award, i) => (
                <div key={i} className="flex gap-3 text-[0.95rem] text-slate-700">
                  <span className="text-slate-400 font-bold">•</span>
                  {award}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function RubyAccentLayout({ form }: { form: ResumeForm }) {
  const accentColor = "#991b1b"; // ruby-800
  
  return (
    <div className="font-serif text-[#1a1a1a] h-full">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-4" style={{ color: accentColor }}>
          {form.personalInfo.fullName.toUpperCase()}
        </h1>
        <div className="flex justify-center gap-6 text-sm font-medium text-gray-500">
          <span>{form.personalInfo.phone}</span>
          <span>{form.personalInfo.email}</span>
        </div>
      </header>

      <div className="space-y-8">
        <section>
          <div className="flex items-baseline gap-3 mb-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.15em]" style={{ color: accentColor }}>Education</h2>
            <div className="h-[1px] flex-1" style={{ backgroundColor: `${accentColor}20` }} />
          </div>
          <div className="space-y-4">
            {form.education.map((edu) => (
              <div key={edu.id} className="grid grid-cols-[1fr_auto] gap-4">
                <div>
                  <div className="font-bold">{edu.institution}</div>
                  <div className="italic text-gray-600">{edu.degree}</div>
                </div>
                <div className="text-right text-sm font-medium">
                  {edu.dateRange}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-baseline gap-3 mb-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.15em]" style={{ color: accentColor }}>Experience</h2>
            <div className="h-[1px] flex-1" style={{ backgroundColor: `${accentColor}20` }} />
          </div>
          <div className="space-y-6">
            {form.experience.map((exp) => (
              <div key={exp.id} className="grid grid-cols-[1fr_auto] gap-4">
                <div className="font-bold">{exp.role}</div>
                <div className="text-right text-sm font-medium">
                  {exp.dateRange}
                </div>
              </div>
            ))}
          </div>
        </section>

        {form.leadership.length > 0 && (
          <section>
            <div className="flex items-baseline gap-3 mb-4">
              <h2 className="text-sm font-bold uppercase tracking-[0.15em]" style={{ color: accentColor }}>Leadership</h2>
              <div className="h-[1px] flex-1" style={{ backgroundColor: `${accentColor}20` }} />
            </div>
            <div className="space-y-4">
              {form.leadership.map((lead) => (
                <div key={lead.id} className="grid grid-cols-[1fr_auto] gap-4">
                  <div>
                    <div className="font-bold">{lead.role}</div>
                    <div className="italic text-gray-600">{lead.organization}</div>
                  </div>
                  <div className="text-right text-sm font-medium">
                    {lead.dateRange}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {form.projects.length > 0 && (
          <section>
            <div className="flex items-baseline gap-3 mb-4">
              <h2 className="text-sm font-bold uppercase tracking-[0.15em]" style={{ color: accentColor }}>Selected Projects</h2>
              <div className="h-[1px] flex-1" style={{ backgroundColor: `${accentColor}20` }} />
            </div>
            <div className="space-y-6">
              {form.projects.map((project) => (
                <div key={project.id}>
                  <div className="flex justify-between items-baseline mb-2">
                    <div className="font-bold text-[1.05rem]">{project.name}</div>
                    <div className="text-sm font-medium">{project.startDate} — {project.endDate}</div>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider mb-2 opacity-60">Tech: {project.technologies}</div>
                  <ul className="space-y-1.5 ml-4">
                    {project.bullets.map((bullet, i) => (
                      <li key={i} className="text-[0.92rem] text-gray-700 list-disc">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {form.awards.length > 0 && (
          <section>
            <div className="flex items-baseline gap-3 mb-4">
              <h2 className="text-sm font-bold uppercase tracking-[0.15em]" style={{ color: accentColor }}>Awards & Honors</h2>
              <div className="h-[1px] flex-1" style={{ backgroundColor: `${accentColor}20` }} />
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {form.awards.map((award, i) => (
                <div key={i} className="text-[0.92rem] text-gray-700 flex gap-2">
                  <span style={{ color: accentColor }}>•</span>
                  {award}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function MinimalistGridLayout({ form }: { form: ResumeForm }) {
  return (
    <div className="h-full space-y-10">
      <header className="space-y-4 border-b border-[color:var(--page-line)] pb-8">
        <h1 className="text-4xl font-bold tracking-tight text-[color:var(--page-text)] uppercase text-center">
          {form.personalInfo.fullName}
        </h1>
        <div className="flex justify-center gap-5 text-sm text-[color:var(--page-muted)]">
          <span>{form.personalInfo.phone}</span>
          <span className="opacity-40">•</span>
          <span>{form.personalInfo.email}</span>
        </div>
      </header>

      <div className="grid gap-10">
        <section className="space-y-5">
          <h2 className="text-xl font-bold text-[color:var(--brand)] uppercase tracking-widest border-b border-[color:var(--page-line)] pb-2">
            Education
          </h2>
          <div className="space-y-6">
            {form.education.map((edu) => (
              <div key={edu.id} className="grid grid-cols-[1fr_auto] gap-2">
                <div className="space-y-1">
                  <h3 className="font-bold text-[color:var(--page-text)]">{edu.institution}</h3>
                  <p className="text-sm italic text-[color:var(--page-muted)]">{edu.degree}</p>
                </div>
                <div className="text-right text-sm text-[color:var(--page-muted)]">
                  <p className="font-medium">{edu.location}</p>
                  <p>{edu.dateRange}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="text-xl font-bold text-[color:var(--brand)] uppercase tracking-widest border-b border-[color:var(--page-line)] pb-2">
            Professional Experience
          </h2>
          <div className="space-y-6">
            {form.experience.map((exp) => (
              <div key={exp.id} className="grid grid-cols-[1fr_auto] gap-2">
                <div className="space-y-1">
                  <h3 className="font-bold text-[color:var(--page-text)]">{exp.role}</h3>
                </div>
                <div className="text-right text-sm text-[color:var(--page-muted)]">
                  <p className="font-medium">{exp.location}</p>
                  <p>{exp.dateRange}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="text-xl font-bold text-[color:var(--brand)] uppercase tracking-widest border-b border-[color:var(--page-line)] pb-2">
            Leadership & Volunteers
          </h2>
          <div className="space-y-6">
            {form.leadership.map((lead) => (
              <div key={lead.id} className="grid grid-cols-[1fr_auto] gap-2">
                <div className="space-y-1">
                  <h3 className="font-bold text-[color:var(--page-text)]">{lead.role}</h3>
                  <p className="text-sm italic text-[color:var(--page-muted)]">{lead.organization}</p>
                </div>
                <div className="text-right text-sm text-[color:var(--page-muted)]">
                  <p className="font-medium">{lead.location}</p>
                  <p>{lead.dateRange}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="text-xl font-bold text-[color:var(--brand)] uppercase tracking-widest border-b border-[color:var(--page-line)] pb-2">
            Awards & Honors
          </h2>
          <ul className="list-inside list-disc space-y-2 text-[color:var(--page-muted)]">
            {form.awards.map((award, index) => (
              <li key={index}>{award}</li>
            ))}
          </ul>
        </section>

        {form.projects.length > 0 ? (
          <section className="space-y-5">
            <h2 className="text-xl font-bold text-[color:var(--brand)] uppercase tracking-widest border-b border-[color:var(--page-line)] pb-2">
              Projects
            </h2>
            <div className="space-y-6">
              {form.projects.map((project) => (
                <div key={project.id} className="space-y-3">
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <div className="space-y-1">
                      <h3 className="font-bold text-[color:var(--page-text)]">
                        {project.name}
                      </h3>
                      <p className="text-sm text-[color:var(--page-muted)]">
                        {project.technologies}
                      </p>
                      {project.link ? (
                        <p className="text-sm text-[color:var(--brand)]">{project.link}</p>
                      ) : null}
                    </div>
                    <div className="text-right text-sm text-[color:var(--page-muted)]">
                      <p>{project.startDate}</p>
                      <p>{project.endDate}</p>
                    </div>
                  </div>
                  {project.bullets.length > 0 ? (
                    <ul className="list-inside list-disc space-y-1.5 text-[color:var(--page-muted)]">
                      {project.bullets.map((bullet, index) => (
                        <li key={`${project.id}-${index}`}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
