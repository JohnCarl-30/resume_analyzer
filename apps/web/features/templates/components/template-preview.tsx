import React from "react";
import { sampleTemplates } from "../model/template";

interface TemplatePreviewProps {
  variant: (typeof sampleTemplates)[number]["previewVariant"];
}

export function TemplatePreview({ variant }: TemplatePreviewProps) {
  if (variant === "minimalist-grid") {
    return (
      <div className="relative h-full w-full rounded-[12px] bg-[#f7f9fc] p-3 shadow-[0_18px_34px_rgba(34,55,102,0.16)]">
        <div className="absolute -left-3 top-4 h-10 w-10 rounded-full border border-white/60 bg-[#d9e0ea]" />
        <div className="grid h-full grid-cols-[0.42fr_0.58fr] gap-3">
          <div className="space-y-2 rounded-[10px] bg-[#e8edf5] p-2.5">
            <div className="h-6 w-6 rounded-full bg-[#8797ab]" />
            <div className="h-1.5 w-4/5 rounded-full bg-[#9daabc]" />
            <div className="h-1.5 w-full rounded-full bg-[#bac4d2]" />
            <div className="h-1.5 w-3/4 rounded-full bg-[#bac4d2]" />
          </div>
          <div className="space-y-2 pt-1">
            <div className="h-2 w-2/3 rounded-full bg-[#8a95ac]" />
            <div className="h-1.5 w-full rounded-full bg-[#d0d8e5]" />
            <div className="h-1.5 w-5/6 rounded-full bg-[#d0d8e5]" />
            <div className="mt-4 h-2 w-1/2 rounded-full bg-[#8a95ac]" />
            <div className="h-1.5 w-full rounded-full bg-[#d0d8e5]" />
            <div className="h-1.5 w-4/5 rounded-full bg-[#d0d8e5]" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "executive-clean") {
    return (
      <div className="h-full w-full rounded-[12px] bg-[#dae6e8] p-3 shadow-[0_18px_34px_rgba(34,55,102,0.15)]">
        <div className="grid h-full grid-cols-[0.48fr_0.52fr] overflow-hidden rounded-[10px] bg-white">
          <div className="space-y-2 bg-[#6f8f95] px-3 py-3">
            <div className="h-2 w-2/3 rounded-full bg-white/55" />
            <div className="h-1.5 w-full rounded-full bg-white/35" />
            <div className="h-1.5 w-4/5 rounded-full bg-white/35" />
          </div>
          <div className="space-y-2 px-3 py-3">
            <div className="h-1.5 w-full rounded-full bg-[#d8dde6]" />
            <div className="h-1.5 w-5/6 rounded-full bg-[#d8dde6]" />
            <div className="mt-3 h-8 rounded-[8px] bg-[#d9e8ea]" />
            <div className="h-8 rounded-[8px] bg-[#d9e8ea]" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "standard-technical") {
    return (
      <div className="h-full w-full rounded-[12px] bg-[#32404b] p-3 shadow-[0_18px_34px_rgba(18,25,39,0.28)]">
        <div className="space-y-2 rounded-[10px] border border-white/8 bg-[#2c3842] p-3">
          <div className="h-1.5 w-3/5 rounded-full bg-white/35" />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="h-14 rounded-[8px] bg-white/8" />
              <div className="h-14 rounded-[8px] bg-white/8" />
            </div>
            <div className="space-y-2">
              <div className="h-14 rounded-[8px] bg-white/8" />
              <div className="h-14 rounded-[8px] bg-white/8" />
            </div>
          </div>
          <div className="h-[3px] w-full rounded-full bg-[#ef7656]" />
        </div>
      </div>
    );
  }

  if (variant === "modern-hybrid") {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-[12px] bg-[#dbe4df] p-3 shadow-[0_18px_34px_rgba(34,55,102,0.14)]">
        <div className="w-[76%] rounded-[10px] bg-white p-3 shadow-[0_12px_26px_rgba(50,70,120,0.18)]">
          <div className="flex items-start gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[#bfc8d1]" />
            <div className="flex-1 space-y-1.5">
              <div className="h-2 w-2/5 rounded-full bg-[#7e8b9b]" />
              <div className="h-1.5 w-full rounded-full bg-[#d8dde7]" />
              <div className="h-1.5 w-4/5 rounded-full bg-[#d8dde7]" />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-[0.42fr_0.58fr] gap-2.5">
            <div className="space-y-1.5">
              <div className="h-8 rounded-[8px] bg-[#eef1f6]" />
              <div className="h-8 rounded-[8px] bg-[#eef1f6]" />
            </div>
            <div className="space-y-1.5">
              <div className="h-1.5 w-full rounded-full bg-[#d8dde7]" />
              <div className="h-1.5 w-5/6 rounded-full bg-[#d8dde7]" />
              <div className="h-1.5 w-full rounded-full bg-[#d8dde7]" />
              <div className="h-1.5 w-4/5 rounded-full bg-[#d8dde7]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "academic-cv") {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-[12px] bg-[#d9edf5] p-3 shadow-[0_18px_34px_rgba(34,55,102,0.14)]">
        <div className="w-[80%] rounded-[8px] bg-white p-3 shadow-[0_12px_26px_rgba(50,70,120,0.16)]">
          <div className="grid grid-cols-4 gap-1.5">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="h-3 rounded-[4px] bg-[#eff4fa]" />
            ))}
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="h-1.5 w-full rounded-full bg-[#d8dde7]" />
            <div className="h-1.5 w-11/12 rounded-full bg-[#d8dde7]" />
            <div className="h-1.5 w-10/12 rounded-full bg-[#d8dde7]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center rounded-[12px] bg-[linear-gradient(145deg,#f29d82_0%,#55637c_78%)] p-3 shadow-[0_18px_34px_rgba(34,55,102,0.18)]">
      <div className="flex h-full w-[44%] flex-col items-center justify-between rounded-[12px] bg-[#404c63] px-3 py-4 text-center text-white shadow-[0_12px_28px_rgba(18,25,39,0.28)]">
        <div className="space-y-1">
          <div className="h-1.5 w-12 rounded-full bg-white/60" />
          <div className="h-1.5 w-8 rounded-full bg-white/35" />
        </div>
        <div className="space-y-2">
          <div className="mx-auto h-1.5 w-16 rounded-full bg-white/50" />
          <div className="mx-auto h-1.5 w-12 rounded-full bg-white/35" />
          <div className="mx-auto h-1.5 w-14 rounded-full bg-white/35" />
        </div>
        <div className="h-4 w-12 rounded-full bg-[#ef8a69]" />
      </div>
    </div>
  );
}
