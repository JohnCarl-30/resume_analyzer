import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ResumeTemplateVariant } from "../../../templates/model/template";
import { emptyResumeForm, type ResumeForm } from "../../model/resume-form";

vi.mock("../../components/resume-renderer", () => ({
  ResumeRenderer: ({ variantId, form }: { variantId: ResumeTemplateVariant; form: ResumeForm }) => (
    <div
      data-testid="resume-renderer"
      data-variant-id={variantId}
      data-full-name={form.personalInfo.fullName}
    />
  ),
}));

vi.mock("../../../templates/components/template-preview", () => ({
  TemplateRealPreview: ({ variantId }: { variantId: string }) => (
    <div data-testid={`template-preview-${variantId}`}>{variantId}</div>
  ),
}));

import { AnalysisWorkspace } from "../analysis-workspace";

const createAutosaveKey = "resume-editor:create-resume:draft";

const completeForm: ResumeForm = {
  personalInfo: {
    fullName: "Pat Rivera",
    phone: "",
    email: "pat@example.com",
    summary: "Builder-focused product engineer.",
    skills: "React, TypeScript, Design Systems",
  },
  education: [
    {
      id: "edu_1",
      institution: "State University",
      degree: "BS Computer Science",
      location: "Austin, TX",
      dateRange: "2020 - 2024",
    },
  ],
  experience: [
    {
      id: "exp_1",
      role: "Frontend Engineer",
      location: "Acme",
      dateRange: "2024 - Present",
      bullets: ["Improved resume completion rate by 22% with guided editing."],
    },
  ],
  leadership: [],
  awards: [],
  projects: [],
};

function renderCreateWorkspace(
  overrides: {
    initialForm?: ResumeForm;
    selectedTemplateId?: ResumeTemplateVariant;
    resumeFileName?: string;
    onTemplateChange?: (id: ResumeTemplateVariant) => void;
    onRename?: (name: string) => void;
  } = {},
) {
  return render(
    <AnalysisWorkspace
      targetRole=""
      selectedTemplateId={overrides.selectedTemplateId ?? "minimalist-grid"}
      resumeFileName={overrides.resumeFileName ?? "New Resume"}
      resumeSourceUrl={null}
      resumePreviewUrl={null}
      analysisResult={null}
      initialForm={overrides.initialForm ?? emptyResumeForm}
      createMode
      autosaveKey={createAutosaveKey}
      onBack={vi.fn()}
      onTemplateChange={overrides.onTemplateChange}
      onRename={overrides.onRename}
    />,
  );
}

function guideRow(label: string) {
  const labelNode = screen.getAllByText(label)[0];
  const row = labelNode.closest("div")?.parentElement;
  if (!row) {
    throw new Error(`Guide row not found for ${label}`);
  }
  return row;
}

function installLocalStorageMock() {
  const values = new Map<string, string>();
  const storage = {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    removeItem: (key: string) => {
      values.delete(key);
    },
    setItem: (key: string, value: string) => {
      values.set(key, String(value));
    },
  } as Storage;

  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: storage,
  });
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: storage,
  });
}

describe("AnalysisWorkspace create mode", () => {
  beforeEach(() => {
    installLocalStorageMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the builder guide, advisory suggestions, simple actions, and selected template name", () => {
    renderCreateWorkspace();

    expect(screen.getByText("Resume checklist")).toBeInTheDocument();
    expect(screen.getByText("0% complete")).toBeInTheDocument();
    expect(screen.getByText(/add your name plus an email or phone number/i)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /print \/ pdf/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /backup draft/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /export json/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /download source/i })).not.toBeInTheDocument();
    expect(screen.getByText("Minimalist Grid")).toBeInTheDocument();
  });

  it("renders completion progress from completed resume fields", () => {
    renderCreateWorkspace({ initialForm: completeForm });

    expect(screen.getByText("100% complete")).toBeInTheDocument();
    expect(screen.getByText(/core sections most reviewers expect/i)).toBeInTheDocument();
  });

  it("guide actions open the matching editor section and template modal", () => {
    const { unmount } = renderCreateWorkspace();

    fireEvent.click(within(guideRow("Personal Info")).getByRole("button", { name: /add/i }));
    expect(screen.getByRole("heading", { name: /personal info/i })).toBeInTheDocument();

    unmount();
    renderCreateWorkspace();

    fireEvent.click(within(guideRow("Template")).getByRole("button", { name: /choose/i }));
    expect(screen.getByRole("heading", { name: /switch template/i })).toBeInTheDocument();
  });

  it("section plus buttons create editable education and experience entries", () => {
    renderCreateWorkspace();

    const educationSection = screen.getByRole("button", { name: "Education" }).closest(".px-2");
    expect(educationSection).not.toBeNull();
    fireEvent.click(within(educationSection as HTMLElement).getByRole("button", { name: /add item/i }));

    expect(screen.getByRole("heading", { name: "Education" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Bulacan State University")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /back to resume sections/i }));
    const experienceSection = screen.getByRole("button", { name: "Work Experience" }).closest(".px-2");
    expect(experienceSection).not.toBeNull();
    fireEvent.click(within(experienceSection as HTMLElement).getByRole("button", { name: /add item/i }));

    expect(screen.getByRole("heading", { name: "Work Experience" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Senior Product Designer")).toBeInTheDocument();
  });

  it("add content credentials, publications, and research open contextual editors", () => {
    const { unmount } = renderCreateWorkspace();

    fireEvent.click(screen.getByRole("button", { name: /add section/i }));
    fireEvent.click(screen.getByRole("button", { name: /certifications/i }));
    expect(screen.getByRole("heading", { name: /credentials & certifications/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/aws certified cloud practitioner/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add credential/i })).toBeInTheDocument();

    unmount();
    renderCreateWorkspace();

    fireEvent.click(screen.getByRole("button", { name: /add section/i }));
    fireEvent.click(screen.getByRole("button", { name: /publications/i }));
    expect(screen.getByRole("heading", { name: /publications/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/article title/i)).toBeInTheDocument();

    unmount();
    renderCreateWorkspace();

    fireEvent.click(screen.getByRole("button", { name: /add section/i }));
    fireEvent.click(screen.getByRole("button", { name: /research/i }));
    expect(screen.getByRole("heading", { name: /^research$/i })).toBeInTheDocument();
    expect(screen.getByText("Research Title")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/human-computer interaction lab/i)).toBeInTheDocument();
  });

  it("reset draft requires confirmation and clears form, title, template, and local storage", async () => {
    const onTemplateChange = vi.fn();
    const onRename = vi.fn();
    localStorage.setItem(createAutosaveKey, JSON.stringify(completeForm));

    renderCreateWorkspace({
      initialForm: completeForm,
      selectedTemplateId: "ruby-accent",
      resumeFileName: "Senior Draft",
      onTemplateChange,
      onRename,
    });

    expect(screen.getByTestId("resume-renderer")).toHaveAttribute("data-full-name", "Pat Rivera");

    fireEvent.click(screen.getByRole("button", { name: /^reset draft$/i }));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: /^reset draft$/i }).at(-1)!);

    await waitFor(() => {
      expect(screen.getByTestId("resume-renderer")).toHaveAttribute("data-full-name", "");
    });
    expect(onRename).toHaveBeenCalledWith("New Resume");
    expect(onTemplateChange).toHaveBeenCalledWith("minimalist-grid");
    expect(localStorage.getItem(createAutosaveKey)).toBeNull();
    expect(screen.getByText("Minimalist Grid")).toBeInTheDocument();
  });

  it("exports a JSON backup with title, selected template, form, and timestamp", async () => {
    let exportedBlob: Blob | null = null;
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn((blob: Blob) => {
        exportedBlob = blob;
        return "blob:resume-draft";
      }),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    renderCreateWorkspace({
      initialForm: completeForm,
      selectedTemplateId: "harvard-classic",
      resumeFileName: "Pat Resume",
    });

    fireEvent.click(screen.getByRole("button", { name: /backup draft/i }));

    expect(exportedBlob).not.toBeNull();
    const payload = JSON.parse(await exportedBlob!.text());
    expect(payload).toMatchObject({
      title: "Pat Resume",
      selectedTemplateId: "harvard-classic",
      selectedTemplateName: "Harvard Classic",
      form: completeForm,
    });
    expect(new Date(payload.exportedAt).toString()).not.toBe("Invalid Date");
  });
});
