import type { ResumeTemplateVariant } from "../model/template";
import { ResumeRenderer } from "../../editor/components/resume-renderer";
import { defaultResumeForm } from "../../editor/model/resume-form";

interface TemplatePreviewProps {
  variant: ResumeTemplateVariant;
}

export function TemplatePreview({ variant }: TemplatePreviewProps) {
  return (
    <div className="relative h-full w-full overflow-hidden flex items-center justify-center">
      <div className="absolute origin-top transform-gpu" style={{ width: "1000px", height: "1414px", transform: "scale(0.24)" }}>
        <div className="h-full w-full bg-white shadow-2xl rounded-sm overflow-hidden">
          <ResumeRenderer form={defaultResumeForm} variantId={variant} />
        </div>
      </div>
    </div>
  );
}
export function TemplateRealPreview({ variantId }: { variantId: ResumeTemplateVariant }) {
  const imageMap: Partial<Record<ResumeTemplateVariant, string>> = {
    "harvard-classic": "/templates/harvard-classic.png",
    "modern-sans": "/templates/modern-sans.png",
    "ruby-accent": "/templates/ruby-accent.png",
  };

  const imageUrl = imageMap[variantId];

  if (imageUrl) {
    return (
      <div className="relative h-full w-full overflow-hidden flex items-center justify-center p-2">
        <div className="h-full w-full bg-white shadow-lg rounded-sm overflow-hidden border border-black/5">
          <img 
            src={imageUrl} 
            alt={`Preview of ${variantId}`}
            className="h-full w-full object-cover object-top"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden pointer-events-none select-none flex items-center justify-center">
      <div
        className="absolute origin-top transform-gpu"
        style={{
          width: "1000px",
          height: "1414px",
          transform: "scale(0.24)",
        }}
      >
        <div className="h-full w-full bg-white shadow-2xl rounded-sm overflow-hidden">
          <ResumeRenderer form={defaultResumeForm} variantId={variantId} />
        </div>
      </div>
    </div>
  );
}
