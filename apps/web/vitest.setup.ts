import "@testing-library/jest-dom";
import { vi } from "vitest";

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
