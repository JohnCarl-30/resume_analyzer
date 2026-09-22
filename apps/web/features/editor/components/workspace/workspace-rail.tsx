"use client";

import {
  BackpackIcon,
  CubeIcon,
  FileTextIcon,
  IdCardIcon,
  ListBulletIcon,
  PersonIcon,
  PlusIcon,
  StarIcon,
} from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";

export interface RailSection {
  id: string;
  label: string;
  icon: string;
  complete?: boolean;
}

const ICONS: Record<string, React.ReactNode> = {
  personal: <PersonIcon aria-hidden="true" />,
  education: <BackpackIcon aria-hidden="true" />,
  experience: <IdCardIcon aria-hidden="true" />,
  leadership: <PersonIcon aria-hidden="true" />,
  awards: <StarIcon aria-hidden="true" />,
  projects: <CubeIcon aria-hidden="true" />,
};

interface WorkspaceRailProps {
  sections: readonly RailSection[];
  activeSectionId: string | null;
  panelOpen: boolean;
  onSelectSection: (id: string) => void;
  onToggleGuide: () => void;
  guideActive: boolean;
  onAddSection: () => void;
}

/**
 * The always-visible spine of the editor.
 *
 * Focus mode collapses the editing panel so the resume gets the width, which
 * only works if there is still something showing where the sections are and
 * which one is open -- otherwise collapsing hides the navigation along with
 * the form. The rail stays put whether the panel is open or shut.
 */
export function WorkspaceRail({
  sections,
  activeSectionId,
  panelOpen,
  onSelectSection,
  onToggleGuide,
  guideActive,
  onAddSection,
}: WorkspaceRailProps) {
  return (
    <nav
      aria-label="Resume sections"
      className="flex h-full w-14 shrink-0 flex-col items-center gap-1 border-r border-[color:var(--page-line)] bg-[color:var(--page-surface)] py-3"
    >
      <RailButton
        label="Checklist and guide"
        active={guideActive && panelOpen}
        onClick={onToggleGuide}
      >
        <ListBulletIcon aria-hidden="true" />
      </RailButton>

      <span aria-hidden="true" className="my-1 h-px w-6 bg-[color:var(--page-line)]" />

      {sections.map((section) => (
        <RailButton
          key={section.id}
          label={section.label}
          actionLabel={`Go to ${section.label}`}
          active={panelOpen && !guideActive && activeSectionId === section.id}
          complete={section.complete}
          onClick={() => onSelectSection(section.id)}
        >
          {ICONS[section.icon] ?? <FileTextIcon aria-hidden="true" />}
        </RailButton>
      ))}

      <span aria-hidden="true" className="my-1 h-px w-6 bg-[color:var(--page-line)]" />

      <RailButton label="New section" onClick={onAddSection}>
        <PlusIcon aria-hidden="true" />
      </RailButton>
    </nav>
  );
}

function RailButton({
  label,
  actionLabel,
  active = false,
  complete = false,
  onClick,
  children,
}: {
  label: string;
  /** Accessible name when the visible tooltip alone would collide with the
   *  section list's own button of the same name. */
  actionLabel?: string;
  active?: boolean;
  complete?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={actionLabel ?? label}
      aria-current={active ? "true" : undefined}
      title={actionLabel ?? label}
      className={cn(
        "group relative inline-flex size-10 items-center justify-center rounded-lg transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand)]",
        active
          ? "bg-[color:var(--brand-soft)] text-[color:var(--brand)]"
          : "text-[color:var(--page-muted)] hover:bg-[color:var(--page-bg)] hover:text-[color:var(--page-text)]",
      )}
    >
      {children}

      {/* A section with content gets a dot, so the rail still says what is
          filled in once the panel is closed. */}
      {complete ? (
        <span
          aria-hidden="true"
          className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[color:var(--success)]"
        />
      ) : null}

      {/* Shows the accessible name rather than the bare section label: a 40px
          icon needs a tooltip, but repeating "Education" here would put a
          second copy of that text in the document, and the section list below
          already owns it. */}
      <span
        role="presentation"
        className="pointer-events-none absolute left-full z-50 ml-2 hidden whitespace-nowrap rounded-md bg-[color:var(--page-text)] px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 xl:block"
      >
        {actionLabel ?? label}
      </span>
    </button>
  );
}
