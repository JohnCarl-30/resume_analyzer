import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

interface SectionEditorHeaderProps {
  title: string;
  onBack: () => void;
}

export function SectionEditorHeader({ title, onBack }: SectionEditorHeaderProps) {
  return (
    <div className="flex items-center gap-3 border-b border-[color:var(--page-line)] px-4 py-3 sm:px-6 sm:py-4">
      <Button
        type="button"
        onClick={onBack}
        aria-label="Back to resume sections"
        variant="outline"
        size="sm"
        className="shrink-0"
      >
        <ArrowLeftIcon data-icon="inline-start" aria-hidden="true" />
        Sections
      </Button>
      <h3 className="min-w-0 truncate text-lg font-semibold tracking-tight text-[color:var(--page-text)] sm:text-xl">
        {title}
      </h3>
    </div>
  );
}
