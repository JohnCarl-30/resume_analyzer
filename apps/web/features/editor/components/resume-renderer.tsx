import React from "react";
import type { ResumeForm } from "../model/resume-form";
import type { ResumeTemplateVariant } from "../../templates/model/template";

interface ResumeRendererProps {
  form: ResumeForm;
  variantId: ResumeTemplateVariant;
  showPlaceholders?: boolean;
}

function contactItems(form: ResumeForm) {
  return [form.personalInfo.phone, form.personalInfo.email].filter((item) => item.trim().length > 0);
}

function ContactLine({
  items,
  className,
  separator = "|",
}: {
  items: string[];
  className: string;
  separator?: string;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {items.map((item, index) => (
        <React.Fragment key={`${item}-${index}`}>
          {index > 0 ? <span className="opacity-40">{separator}</span> : null}
          <span>{item}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

export function ResumeRenderer({ form, variantId, showPlaceholders = false }: ResumeRendererProps) {
  if (variantId === "minimalist-grid") {
    return <MinimalistGridLayout form={form} showPlaceholders={showPlaceholders} />;
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
          {form.personalInfo.fullName || "Your Name"}
        </h1>
        <ContactLine
          items={contactItems(form)}
          className="flex flex-wrap justify-center gap-3 text-[0.95rem] text-gray-600"
        />
        {form.personalInfo.summary && (
          <p className="mt-4 text-[0.95rem] text-gray-700 leading-relaxed max-w-2xl mx-auto">{form.personalInfo.summary}</p>
        )}
        {form.personalInfo.skills && (
          <div className="mt-3 text-sm text-gray-600">
            <span className="font-semibold">Skills: </span>{form.personalInfo.skills}
          </div>
        )}
      </header>

      <div className="space-y-8">
        {form.education.length > 0 && (
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
        )}

        {form.experience.length > 0 && (
          <section>
            <h2 className="text-lg font-bold uppercase border-b border-gray-900 mb-4 pb-0.5">Experience</h2>
            <div className="space-y-6">
              {form.experience.map((exp) => (
                <div key={exp.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-bold">{exp.role}</div>
                    {exp.bullets.length > 0 && (
                      <ul className="mt-2 ml-4 list-disc text-sm text-gray-700 space-y-1">
                        {exp.bullets.map((bullet, i) => (
                          <li key={i}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="text-right text-[0.95rem] ml-4 shrink-0">
                    <div className="font-medium">{exp.location}</div>
                    <div>{exp.dateRange}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

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
          <h1 className="text-5xl font-extrabold tracking-tighter uppercase leading-none mb-2 text-slate-900">
            {form.personalInfo.fullName || "Your Name"}
          </h1>
        </div>
        <div className="text-right text-sm font-medium text-slate-600">
          {contactItems(form).map((item) => (
            <div key={item}>{item}</div>
          ))}
        </div>
      </header>

      {(form.personalInfo.summary || form.personalInfo.skills) && (
        <section className="mb-8">
          {form.personalInfo.summary && (
            <p className="text-[0.95rem] text-slate-700 leading-relaxed">{form.personalInfo.summary}</p>
          )}
          {form.personalInfo.skills && (
            <div className="mt-2 text-sm text-slate-600">
              <span className="font-semibold">Skills: </span>{form.personalInfo.skills}
            </div>
          )}
        </section>
      )}

      <div className="space-y-10">
        {form.education.length > 0 && (
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
        )}

        {form.experience.length > 0 && (
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
                    {exp.bullets.length > 0 && (
                      <ul className="mt-2 ml-4 list-disc text-sm text-slate-600 space-y-1">
                        {exp.bullets.map((bullet, i) => (
                          <li key={i}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="text-right text-sm font-bold text-slate-400 uppercase tracking-wider">
                    {exp.dateRange}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

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
              <h2 className="text-sm font-black uppercase tracking-[0.2em] whitespace-nowrap">Projects</h2>
              <div className="h-[2px] w-full bg-slate-100" />
            </div>
            <div className="space-y-8">
              {form.projects.map((project) => (
                <div key={project.id} className="grid grid-cols-[1fr_auto] gap-4">
                  <div>
                    <div className="font-bold text-lg">{project.name}</div>
                    <div className="text-slate-500 text-sm mb-3 font-mono">{project.technologies}</div>
                    <ul className="mt-2 ml-4 list-disc space-y-2">
                      {project.bullets.map((bullet, i) => (
                        <li key={i} className="text-[0.95rem] text-slate-700">
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
          {(form.personalInfo.fullName || "Your Name").toUpperCase()}
        </h1>
        <ContactLine
          items={contactItems(form)}
          className="flex flex-wrap justify-center gap-3 text-sm font-medium text-gray-500"
        />
        {form.personalInfo.summary && (
          <p className="mt-4 text-[0.95rem] text-gray-700 leading-relaxed max-w-2xl mx-auto">{form.personalInfo.summary}</p>
        )}
        {form.personalInfo.skills && (
          <div className="mt-3 text-sm text-gray-600">
            <span className="font-semibold">Skills: </span>{form.personalInfo.skills}
          </div>
        )}
      </header>

      <div className="space-y-8">
        {form.education.length > 0 && (
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
        )}

        {form.experience.length > 0 && (
          <section>
            <div className="flex items-baseline gap-3 mb-4">
              <h2 className="text-sm font-bold uppercase tracking-[0.15em]" style={{ color: accentColor }}>Experience</h2>
              <div className="h-[1px] flex-1" style={{ backgroundColor: `${accentColor}20` }} />
            </div>
            <div className="space-y-6">
              {form.experience.map((exp) => (
                <div key={exp.id} className="grid grid-cols-[1fr_auto] gap-4">
                  <div>
                    <div className="font-bold">{exp.role}</div>
                    {exp.bullets.length > 0 && (
                      <ul className="mt-2 ml-4 list-disc text-sm space-y-1" style={{ color: `${accentColor}cc` }}>
                        {exp.bullets.map((bullet, i) => (
                          <li key={i}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="text-right text-sm font-medium">
                    {exp.dateRange}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

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
              <h2 className="text-sm font-bold uppercase tracking-[0.15em]" style={{ color: accentColor }}>Projects</h2>
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

function PlaceholderText({ children }: { children: React.ReactNode }) {
  return <p className="text-sm italic leading-6 text-slate-500">{children}</p>;
}

function MinimalistGridLayout({
  form,
  showPlaceholders = false,
}: {
  form: ResumeForm;
  showPlaceholders?: boolean;
}) {
  const placeholderContactItems = showPlaceholders
    ? [form.personalInfo.phone || "(123) 456-7890", form.personalInfo.email || "you@example.com"]
    : contactItems(form);
  const shouldShowSummaryPlaceholder = showPlaceholders && !form.personalInfo.summary;
  const shouldShowSkillsPlaceholder = showPlaceholders && !form.personalInfo.skills;
  const shouldShowEducationPlaceholder = showPlaceholders && form.education.length === 0;
  const shouldShowExperiencePlaceholder = showPlaceholders && form.experience.length === 0;
  const shouldShowProjectsPlaceholder = showPlaceholders && form.projects.length === 0;

  return (
    <div className="h-full space-y-10">
      <header className="space-y-4 border-b border-[color:var(--page-line)] pb-8">
        <h1 className="text-4xl font-bold tracking-tight text-[color:var(--page-text)] uppercase text-center">
          {form.personalInfo.fullName || "Your Name"}
        </h1>
        <ContactLine
          items={placeholderContactItems}
          separator="•"
          className="flex flex-wrap justify-center gap-3 text-sm text-[color:var(--page-muted)]"
        />
        {form.personalInfo.summary && (
          <p className="text-center text-[0.95rem] text-[color:var(--page-muted)] leading-relaxed max-w-2xl mx-auto">{form.personalInfo.summary}</p>
        )}
        {form.personalInfo.skills && (
          <div className="text-center text-sm text-[color:var(--page-muted)]">
            <span className="font-semibold">Skills: </span>{form.personalInfo.skills}
          </div>
        )}
      </header>

      <div className="grid gap-10">
        {shouldShowSummaryPlaceholder ? (
          <section className="space-y-4">
            <h2 className="border-b border-[color:var(--page-line)] pb-2 text-xl font-bold uppercase tracking-widest text-[color:var(--brand)]">
              Summary
            </h2>
            <PlaceholderText>
              Add 2-3 lines about your target role, strongest skills, and the type of impact you make.
            </PlaceholderText>
          </section>
        ) : null}

        {form.education.length > 0 && (
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
        )}
        {shouldShowEducationPlaceholder ? (
          <section className="space-y-4">
            <h2 className="border-b border-[color:var(--page-line)] pb-2 text-xl font-bold uppercase tracking-widest text-[color:var(--brand)]">
              Education
            </h2>
            <PlaceholderText>
              Add your school, degree, location, and graduation date.
            </PlaceholderText>
          </section>
        ) : null}

        {form.experience.length > 0 && (
          <section className="space-y-5">
            <h2 className="text-xl font-bold text-[color:var(--brand)] uppercase tracking-widest border-b border-[color:var(--page-line)] pb-2">
              Experience
            </h2>
            <div className="space-y-6">
              {form.experience.map((exp) => (
                <div key={exp.id} className="grid grid-cols-[1fr_auto] gap-2">
                  <div className="space-y-1">
                    <h3 className="font-bold text-[color:var(--page-text)]">{exp.role}</h3>
                    {exp.bullets.length > 0 && (
                      <ul className="mt-2 ml-4 list-disc text-sm text-[color:var(--page-muted)] space-y-1">
                        {exp.bullets.map((bullet, i) => (
                          <li key={i}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="text-right text-sm text-[color:var(--page-muted)]">
                    <p className="font-medium">{exp.location}</p>
                    <p>{exp.dateRange}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {shouldShowExperiencePlaceholder ? (
          <section className="space-y-4">
            <h2 className="border-b border-[color:var(--page-line)] pb-2 text-xl font-bold uppercase tracking-widest text-[color:var(--brand)]">
              Work Experience
            </h2>
            <PlaceholderText>
              Add your job title, company, dates, and 2-4 bullet points that show measurable results.
            </PlaceholderText>
          </section>
        ) : null}

        {shouldShowSkillsPlaceholder ? (
          <section className="space-y-4">
            <h2 className="border-b border-[color:var(--page-line)] pb-2 text-xl font-bold uppercase tracking-widest text-[color:var(--brand)]">
              Skills
            </h2>
            <PlaceholderText>
              Add tools, technologies, and strengths that match the jobs you want.
            </PlaceholderText>
          </section>
        ) : null}

        {form.leadership.length > 0 && (
          <section className="space-y-5">
            <h2 className="text-xl font-bold text-[color:var(--brand)] uppercase tracking-widest border-b border-[color:var(--page-line)] pb-2">
              Leadership
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
        )}

        {form.awards.length > 0 && (
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
        )}

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
        ) : shouldShowProjectsPlaceholder ? (
          <section className="space-y-4">
            <h2 className="border-b border-[color:var(--page-line)] pb-2 text-xl font-bold uppercase tracking-widest text-[color:var(--brand)]">
              Projects
            </h2>
            <PlaceholderText>
              Optional: add projects that show your work, tools, and outcomes.
            </PlaceholderText>
          </section>
        ) : null}
      </div>
    </div>
  );
}
