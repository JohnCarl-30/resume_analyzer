import React from "react";
import {
  FileIcon,
  TargetIcon,
  CodeBracketsIcon,
  ResearchIcon,
  BadgeIcon,
  BookOpenIcon,
  SparklesIcon,
  CloseIcon,
} from "../../../onboarding/components/wizard-icons";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type ContentOptionId =
  | "summary"
  | "objective"
  | "projects"
  | "research"
  | "certifications"
  | "publications"
  | "skills";

interface ContentOption {
  id: ContentOptionId;
  title: string;
  description: string;
  icon: "file" | "target" | "projects" | "research" | "badge" | "book" | "skills";
  interactive?: boolean;
}

const addContentOptions: ContentOption[] = [
  {
    id: "summary",
    title: "Professional Summary",
    description: "Brief overview of your experience and strengths",
    icon: "file",
  },
  {
    id: "objective",
    title: "Career Objective",
    description: "Your career goals and target role",
    icon: "target",
  },
  {
    id: "projects",
    title: "Projects",
    description: "Showcase notable projects and technologies",
    icon: "projects",
    interactive: true,
  },
  {
    id: "research",
    title: "Research",
    description: "Research papers, theses, and academic work",
    icon: "research",
  },
  {
    id: "certifications",
    title: "Certifications",
    description: "Professional credentials, certifications, and licenses",
    icon: "badge",
  },
  {
    id: "publications",
    title: "Publications",
    description: "Published papers, articles, and books",
    icon: "book",
  },
  {
    id: "skills",
    title: "Skills",
    description: "List your technical and professional skills",
    icon: "skills",
  },
];

function contentOptionIcon(icon: ContentOption["icon"]) {
  if (icon === "file") return <FileIcon />;
  if (icon === "target") return <TargetIcon />;
  if (icon === "projects") return <CodeBracketsIcon />;
  if (icon === "research") return <ResearchIcon />;
  if (icon === "badge") return <BadgeIcon />;
  if (icon === "book") return <BookOpenIcon />;
  return <SparklesIcon />;
}

interface ContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectOption: (optionId: ContentOptionId) => void;
  onOpenProjectModal: () => void;
}

export function ContentModal({ open, onOpenChange, onSelectOption, onOpenProjectModal }: ContentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[92vh] max-w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-xl border border-[color:var(--page-line)] bg-white p-0 text-[color:var(--page-text)] shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:max-w-5xl"
      >
        <div className="flex items-center justify-between border-b border-[color:var(--page-line)] px-5 py-4 sm:px-6">
          <DialogTitle className="text-xl font-semibold tracking-tight text-[color:var(--page-text)]">
            Add Content
          </DialogTitle>
          <DialogDescription className="sr-only">
            Choose optional resume sections or content blocks to add to your resume.
          </DialogDescription>
            <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-surface)] text-[color:var(--page-muted)] transition-all duration-140 ease-out hover:text-[color:var(--page-text)] hover:border-[color:var(--page-line-strong)] hover:bg-[color:var(--page-bg)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] active:scale-95"
            aria-label="Close add content"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="px-5 py-5 sm:px-6 sm:py-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {addContentOptions.map((option) =>
              option.interactive ? (
                <button
                  key={option.id}
                  type="button"
                  onClick={onOpenProjectModal}
                  className="rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-surface)] p-4 text-left transition-all duration-140 ease-out hover:border-[color:var(--brand)] hover:bg-[color:var(--brand-soft)] hover:shadow-[0_2px_8px_rgba(21,93,252,0.12)] active:scale-95"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[color:var(--page-line)] bg-white text-[color:var(--page-muted)]">
                      {contentOptionIcon(option.icon)}
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-[color:var(--page-text)]">
                        {option.title}
                      </p>
                      <p className="text-sm leading-5 text-[color:var(--page-muted)]">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              ) : (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onSelectOption(option.id)}
                  className="rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-surface)] p-4 text-left transition hover:border-[color:var(--brand)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[color:var(--page-line)] bg-white text-[color:var(--page-muted)]">
                      {contentOptionIcon(option.icon)}
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-[color:var(--page-text)]">
                        {option.title}
                      </p>
                      <p className="text-sm leading-5 text-[color:var(--page-muted)]">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              ),
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
