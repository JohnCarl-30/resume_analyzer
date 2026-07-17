import { Suspense } from "react";
import type { Metadata } from "next";

import { ClerkAuthShell } from "@/features/auth/views/clerk-auth-shell";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a Deep Focus account to run your resume check.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background px-4 text-sm text-muted-foreground">
          Loading sign up…
        </main>
      }
    >
      <ClerkAuthShell mode="sign-up" />
    </Suspense>
  );
}
