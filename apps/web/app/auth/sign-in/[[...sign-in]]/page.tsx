import { Suspense } from "react";
import type { Metadata } from "next";

import { AuthFormFallback } from "@/features/auth/components/auth-form-fallback";
import { AuthFormPanel } from "@/features/auth/views/clerk-auth-shell";

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
    <Suspense fallback={<AuthFormFallback label="Loading sign in…" />}>
      <AuthFormPanel mode="sign-in" />
    </Suspense>
  );
}
