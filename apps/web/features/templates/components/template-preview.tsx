import type { ResumeTemplateVariant } from "../model/template";
import { ResumeRenderer } from "../../editor/components/resume-renderer";
import { defaultResumeForm } from "../../editor/model/resume-form";

const previewPageWidth = 1000;
const previewPageHeight = 1414;
const previewScale = 0.24;

interface TemplatePreviewProps {
  variant: ResumeTemplateVariant;
}

export function TemplatePreview({ variant }: TemplatePreviewProps) {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <div
        className="relative shrink-0 overflow-hidden rounded-sm shadow-2xl"
        style={{
          width: `${previewPageWidth * previewScale}px`,
          height: `${previewPageHeight * previewScale}px`,
        }}
      >
        <div
          className="origin-top-left transform-gpu bg-white"
          style={{
            width: `${previewPageWidth}px`,
            height: `${previewPageHeight}px`,
            transform: `scale(${previewScale})`,
          }}
        >
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
        className="relative shrink-0 overflow-hidden rounded-sm shadow-2xl"
        style={{
          width: `${previewPageWidth * previewScale}px`,
          height: `${previewPageHeight * previewScale}px`,
        }}
      >
        <div
          className="origin-top-left transform-gpu bg-white"
          style={{
            width: `${previewPageWidth}px`,
            height: `${previewPageHeight}px`,
            transform: `scale(${previewScale})`,
          }}
        >
          <ResumeRenderer form={defaultResumeForm} variantId={variantId} />
        </div>
      </div>
    </div>
  );
}
