"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { SignedIn, SignedOut, SignIn, SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

import { BrandMark } from "@/features/onboarding/components/wizard-icons";
import { resolveSafeRedirectPath } from "@/lib/auth-redirect";

import { AlreadySignedInPanel } from "../components/already-signed-in-panel";
import { SessionExpiredRecovery } from "../components/session-expired-recovery";
import { SignInBrandPanel } from "../components/sign-in-brand-panel";

const clerkAppearance = {
  elements: {
    rootBox: "w-full",
    cardBox: "shadow-none w-full max-w-none",
    card: "shadow-none border-0 bg-transparent p-0 gap-4",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlockButton:
      "h-10 border border-border bg-background text-sm font-medium text-foreground hover:bg-secondary",
    formButtonPrimary:
      "h-10 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90",
    formFieldInput: "h-10 border-border bg-background text-sm",
    footerActionLink: "text-primary font-medium hover:text-primary/90",
    identityPreviewEditButton: "text-primary",
    formFieldLabel: "text-sm font-medium text-foreground",
  },
} as const;

interface ClerkAuthShellProps {
  mode: "sign-in" | "sign-up";
}

function AuthPanel({ mode }: ClerkAuthShellProps) {
  const searchParams = useSearchParams();
  const redirectPath = resolveSafeRedirectPath(searchParams.get("next"));
  const AuthComponent = mode === "sign-in" ? SignIn : SignUp;

  return (
    <>
      <SessionExpiredRecovery />

      <SignedIn>
        <AlreadySignedInPanel redirectPath={redirectPath} />
      </SignedIn>

      <SignedOut>
        <header
          className="animate-enter-up mb-8"
          style={{ "--enter-delay": "40ms" } as CSSProperties}
        >
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.65rem]">
            {mode === "sign-up" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {mode === "sign-up"
              ? "One AI resume check per account, free to start."
              : "Sign in to run your resume check against a job post."}
          </p>
        </header>

        <div
          className="animate-enter-up"
          style={{ "--enter-delay": "110ms" } as CSSProperties}
        >
          <AuthComponent
            routing="path"
            path={mode === "sign-in" ? "/auth/sign-in" : "/auth/sign-up"}
            signInUrl="/auth/sign-in"
            signUpUrl="/auth/sign-up"
            forceRedirectUrl={redirectPath}
            appearance={clerkAppearance}
          />
        </div>

        <div
          className="animate-enter-up mt-6 space-y-3 text-sm text-muted-foreground"
          style={{ "--enter-delay": "170ms" } as CSSProperties}
        >
          <p>
            After your one analysis, you can still update that saved check against a new job post.
          </p>
          <Link href="/" className="motion-link inline-flex w-fit hover:text-foreground">
            ← Back to marketing home
          </Link>
        </div>
      </SignedOut>
    </>
  );
}

export function ClerkAuthShell({ mode }: ClerkAuthShellProps) {
  return (
    <main className="min-h-screen bg-background text-foreground lg:grid lg:min-h-screen lg:grid-cols-2">
      <SignInBrandPanel />

      <section className="flex min-h-screen flex-col justify-center px-4 py-10 sm:px-8 lg:px-14 lg:py-12">
        <div className="mx-auto w-full max-w-[22rem]">
          <div className="mb-8 lg:hidden">
            <Link
              href="/"
              className="brand-logo inline-flex items-center gap-2 text-base font-semibold tracking-tight"
            >
              <BrandMark />
              <span className="font-brand">Deep Focus</span>
            </Link>
          </div>

          <AuthPanel mode={mode} />
        </div>
      </section>
    </main>
  );
}
