import { Suspense } from "react";
import type { Metadata } from "next";

import { AuthFormFallback } from "@/features/auth/components/auth-form-fallback";
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
    <Suspense fallback={<AuthFormFallback label="Loading sign up…" />}>
      <AuthFormPanel mode="sign-up" />
    </Suspense>
  );
}
