/**
 * Property-Based Test — Property 15: Back button presence
 *
 * Feature: resume-editor-flow, Property 15: Back button presence
 *
 * For any wizard step value N in {2, 3, 4}, a back navigation control should
 * be rendered.
 *
 * - Steps 2 and 3: the back button lives in the DeepFocusWizard header
 *   (`{step > 1 && <button>...{backLabel}</button>}`).
 * - Step 4: the wizard header renders "Back to Upload".
 *
 * Testing strategy:
 * - Steps 2, 3, and 4 are tested by rendering DeepFocusWizard and navigating to
 *   those steps via userEvent, then asserting the header back button is present.
 *
 * Validates: Requirements 6.2
 * Tag format: Feature: resume-editor-flow, Property 15: Back button presence
 * Minimum 100 iterations (split across the three sub-properties)
 */

import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, within, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as fc from "fast-check";
import { DeepFocusWizard } from "../deep-focus-wizard";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

async function navigateToStep2(container: HTMLElement, user: ReturnType<typeof userEvent.setup>) {
  const targetRoleInput = within(container).getByPlaceholderText(/senior frontend engineer/i);
  await user.type(targetRoleInput, "Software Engineer");
  const nextButton = within(container).getByRole("button", { name: /next: job details/i });
  await user.click(nextButton);
}

async function navigateToStep3(container: HTMLElement, user: ReturnType<typeof userEvent.setup>) {
  await navigateToStep2(container, user);
  const jobDescriptionInput = within(container).getByRole("textbox");
  await user.type(jobDescriptionInput, "A".repeat(30));
  const continueButton = within(container).getByRole("button", {
    name: /continue to resume upload/i,
  });
  await user.click(continueButton);
}

async function navigateToStep4(container: HTMLElement, user: ReturnType<typeof userEvent.setup>) {
  await navigateToStep3(container, user);
  const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
  const pdfFile = new File(["pdf content"], "resume.pdf", { type: "application/pdf" });
  await user.upload(fileInput, pdfFile);
  const continueToTemplates = within(container).getByRole("button", {
    name: /continue to templates/i,
  });
  await user.click(continueToTemplates);
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Feature: resume-editor-flow, Property 15: Back button presence", () => {
  it(
    "renders a back navigation control on every step > 1",
    async () => {
      // --- Step 2: render DeepFocusWizard and navigate to step 2 ---
      const step2Container = document.createElement("div");
      document.body.appendChild(step2Container);
      const user2 = userEvent.setup();
      const { unmount: unmount2 } = render(<DeepFocusWizard />, { container: step2Container });
      await navigateToStep2(step2Container, user2);
      const step2BackButton = within(step2Container).getByRole("button", { name: /^back$/i });

      // --- Step 3: render DeepFocusWizard and navigate to step 3 ---
      const step3Container = document.createElement("div");
      document.body.appendChild(step3Container);
      const user3 = userEvent.setup();
      const { unmount: unmount3 } = render(<DeepFocusWizard />, { container: step3Container });
      await navigateToStep3(step3Container, user3);
      const step3BackButton = within(step3Container).getByRole("button", {
        name: /back to job description/i,
      });

      // --- Step 4: render DeepFocusWizard and navigate to step 4 ---
      const step4Container = document.createElement("div");
      document.body.appendChild(step4Container);
      const user4 = userEvent.setup();
      const { unmount: unmount4 } = render(<DeepFocusWizard />, { container: step4Container });
      await navigateToStep4(step4Container, user4);
      const step4BackButton = within(step4Container).getByRole("button", {
        name: /back to upload/i,
      });

      const backButtonByStep: Record<2 | 3 | 4, HTMLElement> = {
        2: step2BackButton,
        3: step3BackButton,
        4: step4BackButton,
      };

      fc.assert(
        fc.property(fc.constantFrom(2 as const, 3 as const, 4 as const), (step) => {
          const backButton = backButtonByStep[step];
          expect(backButton).toBeTruthy();
          expect(backButton.tagName.toLowerCase()).toBe("button");
        }),
        { numRuns: 100 },
      );

      unmount2();
      document.body.removeChild(step2Container);
      unmount3();
      document.body.removeChild(step3Container);
      unmount4();
      document.body.removeChild(step4Container);
    },
    30_000,
  );
});
