import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSignOut = vi.fn();
const mockUseAuth = vi.fn();
const mockUseSearchParams = vi.fn();

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockUseSearchParams(),
}));

import { SessionExpiredRecovery } from "../session-expired-recovery";

describe("SessionExpiredRecovery", () => {
  beforeEach(() => {
    mockSignOut.mockReset();
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      signOut: mockSignOut,
    });
    mockUseSearchParams.mockReturnValue(new URLSearchParams("reason=session-expired&next=/analysis/new"));
  });

  it("signs out automatically when session-expired and still signed in", async () => {
    render(<SessionExpiredRecovery />);

    expect(
      screen.getByText(/signing you out so you can sign in again/i),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledWith({
        redirectUrl: "/auth/sign-in?next=%2Fanalysis%2Fnew",
      });
    });
  });

  it("does nothing when reason is not session-expired", () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("next=/analysis/new"));

    render(<SessionExpiredRecovery />);

    expect(mockSignOut).not.toHaveBeenCalled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
