import { Suspense } from "react";
import type { Metadata } from "next";

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
    <Suspense
      fallback={
        <div className="py-8 text-center text-sm text-muted-foreground" aria-busy="true">
          Loading sign in…
        </div>
      }
    >
      <AuthFormPanel mode="sign-in" />
    </Suspense>
  );
}
