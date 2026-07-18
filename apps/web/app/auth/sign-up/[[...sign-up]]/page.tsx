import { Suspense } from "react";
import type { Metadata } from "next";

import { AuthFormPanel } from "@/features/auth/views/clerk-auth-shell";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a Resumae account to run your resume check.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="py-8 text-center text-sm text-muted-foreground" aria-busy="true">
          Loading sign up…
        </div>
      }
    >
      <AuthFormPanel mode="sign-up" />
    </Suspense>
  );
}
