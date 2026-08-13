import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MarkupTour } from "@/features/landing/components/markup-tour";
import { MARKUP_CALLOUTS } from "@/features/landing/model/markup-callouts";

type ObserverCallback = (entries: Array<{ isIntersecting: boolean }>) => void;

let observerCallbacks: ObserverCallback[] = [];

class MockIntersectionObserver {
  constructor(private readonly callback: ObserverCallback) {
    observerCallbacks.push(callback);
  }

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

function enterViewport() {
  act(() => {
    for (const callback of [...observerCallbacks]) {
      callback([{ isIntersecting: true }]);
    }
  });
}

// Each chunk is its own act() so React flushes the effect that arms the next
// timer before the fake clock moves again.
async function advanceThroughTour() {
  for (const ms of [1600, 2700, 2700, 2300]) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ms);
    });
  }
}

function stepFor(label: string) {
  const step = screen.getByText(label).closest("li");
  expect(step).not.toBeNull();
  return step as HTMLLIElement;
}

describe("MarkupTour", () => {
  beforeEach(() => {
    observerCallbacks = [];
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("renders every callout's label and insight as plain readable text", () => {
    render(<MarkupTour />);

    for (const callout of MARKUP_CALLOUTS) {
      expect(screen.getByText(callout.label)).toBeInTheDocument();
      expect(screen.getByText(callout.insight)).toBeInTheDocument();
    }
  });

  it("highlights nothing until the tour starts, so no callout reads as chosen", () => {
    const { container } = render(<MarkupTour />);

    expect(container.querySelectorAll("[data-active]")).toHaveLength(0);
    expect(container.querySelectorAll("[data-dim]")).toHaveLength(0);
  });

  it("advances to the first callout once the figure is scrolled into view", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<MarkupTour />);

    enterViewport();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1600);
    });

    expect(stepFor(MARKUP_CALLOUTS[0].label)).toHaveAttribute("data-active");
    expect(stepFor(MARKUP_CALLOUTS[1].label)).toHaveAttribute("data-dim");
  });

  it("settles with no callout singled out once the tour has walked all three", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { container } = render(<MarkupTour />);

    enterViewport();
    await advanceThroughTour();

    expect(container.querySelectorAll("[data-active]")).toHaveLength(0);
    expect(container.querySelectorAll("[data-dim]")).toHaveLength(0);
  });

  it("lets hovering a callout take the highlight over from the tour", async () => {
    const user = userEvent.setup();
    render(<MarkupTour />);

    await user.hover(stepFor(MARKUP_CALLOUTS[2].label));

    expect(stepFor(MARKUP_CALLOUTS[2].label)).toHaveAttribute("data-active");
    expect(stepFor(MARKUP_CALLOUTS[0].label)).toHaveAttribute("data-dim");
    expect(stepFor(MARKUP_CALLOUTS[1].label)).toHaveAttribute("data-dim");

    await user.unhover(stepFor(MARKUP_CALLOUTS[2].label));

    expect(stepFor(MARKUP_CALLOUTS[2].label)).not.toHaveAttribute("data-active");
  });
});
