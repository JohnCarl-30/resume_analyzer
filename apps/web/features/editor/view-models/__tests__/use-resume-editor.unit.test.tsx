import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { emptyResumeForm, type ResumeForm } from "../../model/resume-form";
import { useResumeEditor } from "../use-resume-editor";

function formWithName(fullName: string): ResumeForm {
  return {
    ...emptyResumeForm,
    personalInfo: {
      ...emptyResumeForm.personalInfo,
      fullName,
    },
  };
}

function EditorHarness({ storageKey }: { storageKey?: string | null }) {
  const { form, updatePersonalInfo, resetForm, undo, canUndo } = useResumeEditor(emptyResumeForm, {
    storageKey,
    autosave: Boolean(storageKey),
  });

  return (
    <div>
      <output data-testid="name">{form.personalInfo.fullName}</output>
      <button type="button" onClick={() => updatePersonalInfo({ fullName: "Jane Builder" })}>
        Set name
      </button>
      <button type="button" onClick={() => resetForm(emptyResumeForm)}>
        Reset
      </button>
      <button type="button" onClick={undo} disabled={!canUndo}>
        Undo
      </button>
    </div>
  );
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

describe("useResumeEditor autosave options", () => {
  beforeEach(() => {
    installLocalStorageMock();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("uses only the configured autosave key and ignores the legacy analysis draft key", () => {
    localStorage.setItem("resume-editor:auto-save", JSON.stringify(formWithName("Leaked Analysis Draft")));

    render(<EditorHarness storageKey="resume-editor:create-resume:draft" />);

    expect(screen.getByTestId("name")).toHaveTextContent("");

    fireEvent.click(screen.getByRole("button", { name: /set name/i }));
    act(() => {
      vi.advanceTimersByTime(850);
    });

    expect(JSON.parse(localStorage.getItem("resume-editor:create-resume:draft") ?? "{}")).toMatchObject(
      formWithName("Jane Builder"),
    );
    expect(JSON.parse(localStorage.getItem("resume-editor:auto-save") ?? "{}")).toMatchObject(
      formWithName("Leaked Analysis Draft"),
    );
  });

  it("does not load or write browser storage when autosave is disabled", () => {
    localStorage.setItem("resume-editor:auto-save", JSON.stringify(formWithName("Leaked Analysis Draft")));

    render(<EditorHarness storageKey={null} />);
    fireEvent.click(screen.getByRole("button", { name: /set name/i }));

    act(() => {
      vi.advanceTimersByTime(850);
    });

    expect(screen.getByTestId("name")).toHaveTextContent("Jane Builder");
    expect(localStorage.getItem("resume-editor:create-resume:draft")).toBeNull();
    expect(JSON.parse(localStorage.getItem("resume-editor:auto-save") ?? "{}")).toMatchObject(
      formWithName("Leaked Analysis Draft"),
    );
  });

  it("resetForm clears autosave storage and undo history", () => {
    render(<EditorHarness storageKey="resume-editor:create-resume:draft" />);

    fireEvent.click(screen.getByRole("button", { name: /set name/i }));
    expect(screen.getByRole("button", { name: /undo/i })).not.toBeDisabled();

    act(() => {
      vi.advanceTimersByTime(850);
    });
    expect(localStorage.getItem("resume-editor:create-resume:draft")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /reset/i }));
    expect(screen.getByTestId("name")).toHaveTextContent("");
    expect(screen.getByRole("button", { name: /undo/i })).toBeDisabled();
    expect(localStorage.getItem("resume-editor:create-resume:draft")).toBeNull();

    act(() => {
      vi.advanceTimersByTime(850);
    });
    expect(localStorage.getItem("resume-editor:create-resume:draft")).toBeNull();
  });
});
