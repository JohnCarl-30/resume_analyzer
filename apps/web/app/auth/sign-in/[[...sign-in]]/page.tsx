import { Suspense } from "react";
import type { Metadata } from "next";

import { ClerkAuthShell } from "@/features/auth/views/clerk-auth-shell";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to run your resume check and access saved analyses.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background px-4 text-sm text-muted-foreground">
          Loading sign in…
        </main>
      }
    >
      <ClerkAuthShell mode="sign-in" />
    </Suspense>
  );
}
