import "@testing-library/jest-dom";
import { vi } from "vitest";

// jsdom ships no matchMedia; components that read prefers-reduced-motion need one.
if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

vi.mock("@clerk/nextjs", () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) => children,
  SignedOut: () => null,
  SignOutButton: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: true,
    getToken: vi.fn(),
    signOut: vi.fn(),
  }),
  useUser: () => ({
    isLoaded: true,
    user: {
      fullName: "Test User",
      primaryEmailAddress: { emailAddress: "test@example.com" },
    },
  }),
}));

const mockQueryClient = {
  invalidateQueries: vi.fn().mockResolvedValue(undefined),
  setQueryData: vi.fn(),
  getQueryData: vi.fn(),
  cancelQueries: vi.fn().mockResolvedValue(undefined),
};

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQueryClient: () => mockQueryClient,
  };
});
