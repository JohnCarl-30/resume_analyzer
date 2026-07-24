"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { SignedIn, SignedOut, SignIn, SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

import { resolveSafeRedirectPath } from "@/lib/auth-redirect";

import { AlreadySignedInPanel } from "../components/already-signed-in-panel";
import { SessionExpiredRecovery } from "../components/session-expired-recovery";
import { AuthShellLayout } from "./auth-shell-layout";

const authSwitchLinkClass =
  "font-medium text-[color:var(--brand)] underline-offset-[3px] hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20";

/** Own the card chrome — hide Clerk branding; keep email + Google form only. */
const clerkAppearance = {
  variables: {
    colorPrimary: "var(--brand)",
    colorText: "var(--foreground)",
    colorTextSecondary: "var(--muted-foreground)",
    colorBackground: "transparent",
    colorInputBackground: "oklch(100% 0 0)",
    colorInputText: "var(--foreground)",
    colorDanger: "var(--destructive)",
    colorNeutral: "var(--page-line-strong)",
    borderRadius: "0.5rem",
    fontFamily: "var(--font-ui)",
    fontSize: "0.9375rem",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full max-w-none !bg-transparent !shadow-none !border-0",
    card: "!bg-transparent !shadow-none !border-0 !p-0 !gap-4 !rounded-none",
    main: "!gap-4",
    form: "!gap-4",
    formFieldRow: "!gap-1.5",
    formField: "!gap-1.5",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlockButton:
      "h-11 !border !border-[color:var(--page-line-strong)] !bg-white !text-sm !font-medium !text-foreground hover:!bg-muted !shadow-none focus-visible:!ring-2 focus-visible:!ring-ring/20",
    socialButtonsBlockButtonText: "!text-foreground !font-medium",
    dividerLine: "!bg-border",
    dividerText: "!text-caption !text-muted-foreground !bg-card !px-3",
    formButtonPrimary:
      "!flex !h-11 !w-full !items-center !justify-center !text-center !bg-foreground !text-background !text-sm !font-medium hover:!bg-foreground/90 !shadow-none focus-visible:!ring-2 focus-visible:!ring-ring/20",
    formButtonPrimaryIcon: "hidden",
    formFieldInput:
      "h-11 !box-border !w-full !max-w-full !border !border-solid !border-[color:color-mix(in_srgb,var(--page-text)_28%,var(--page-line-strong))] !bg-white !px-3.5 !text-sm !text-foreground !shadow-none focus-visible:!border-[color:var(--brand)] focus-visible:!ring-2 focus-visible:!ring-ring/20",
    formFieldInputShowPasswordButton:
      "!m-0 !shrink-0 !border-0 !bg-transparent !p-0 !text-muted-foreground hover:!text-foreground !shadow-none",
    formFieldInputShowPasswordIcon: "!block !size-4 !shrink-0",
    formFieldLabel: "!text-sm !font-medium !text-foreground",
    formFieldHintText: "hidden",
    formFieldInfoText: "hidden",
    formFieldSuccessText: "hidden",
    formFieldErrorText: "!text-sm !text-destructive",
    footer: "hidden",
    badge: "hidden",
    identityPreviewEditButton: "!text-[color:var(--brand)]",
    alternativeMethodsBlockButton: "!border-border !bg-background !text-foreground !shadow-none",
  },
} as const;

export interface AuthFormPanelProps {
  mode: "sign-in" | "sign-up";
}

/** Right-pane auth form — swapped by /auth/sign-in and /auth/sign-up pages. */
export function AuthFormPanel({ mode }: AuthFormPanelProps) {
  const searchParams = useSearchParams();
  const redirectPath = resolveSafeRedirectPath(searchParams.get("next"));
  const AuthComponent = mode === "sign-in" ? SignIn : SignUp;
  const isSignUp = mode === "sign-up";

  return (
    <>
      <SessionExpiredRecovery />

      <SignedIn>
        <AlreadySignedInPanel redirectPath={redirectPath} />
      </SignedIn>

      <SignedOut>
        <header
          className="animate-enter-up-safe mb-5 space-y-1.5"
          style={{ "--enter-delay": "40ms" } as CSSProperties}
        >
          <h1 className="display-serif text-2xl tracking-tight text-foreground text-balance sm:text-[1.75rem]">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="max-w-[36ch] text-sm leading-6 text-muted-foreground text-pretty">
            {isSignUp
              ? "Free to start — one AI resume check per account."
              : "Sign in to check your resume against a job post."}
          </p>
        </header>

        <div
          className="animate-enter-up-safe app-auth-card overflow-visible"
          style={{ "--enter-delay": "110ms" } as CSSProperties}
        >
          <div
            className={`app-auth-clerk px-5 py-5 sm:px-6 sm:py-6 ${isSignUp ? "app-auth-clerk--sign-up" : "app-auth-clerk--sign-in"}`}
          >
            <AuthComponent
              routing="path"
              path={isSignUp ? "/auth/sign-up" : "/auth/sign-in"}
              signInUrl="/auth/sign-in"
              signUpUrl="/auth/sign-up"
              forceRedirectUrl={redirectPath}
              appearance={clerkAppearance}
            />
          </div>

          <div className="app-auth-card-footer rounded-b-[calc(var(--radius)+0.125rem)] border-t border-border px-5 py-3.5 text-sm leading-6 text-muted-foreground sm:px-6">
            {isSignUp ? (
              <>
                <span>Already have an account?</span>
                <Link
                  href={`/auth/sign-in?next=${encodeURIComponent(redirectPath)}`}
                  className={authSwitchLinkClass}
                >
                  Sign in
                </Link>
              </>
            ) : (
              <>
                <span>Don&apos;t have an account?</span>
                <Link
                  href={`/auth/sign-up?next=${encodeURIComponent(redirectPath)}`}
                  className={authSwitchLinkClass}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>

        <div
          className="animate-enter-up-safe mt-6 space-y-3 text-sm leading-6 text-muted-foreground"
          style={{ "--enter-delay": "170ms" } as CSSProperties}
        >
          {!isSignUp ? (
            <p className="max-w-[40ch] text-pretty">
              After your one analysis, you can still update that saved check against a new job post.
            </p>
          ) : (
            <p className="max-w-[40ch] text-pretty">
              After your check, keep editing and re-check the same resume against new posts.
            </p>
          )}
          <Link
            href="/"
            className="motion-link inline-flex min-h-11 items-center text-muted-foreground hover:text-foreground focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
          >
            ← Back to home
          </Link>
        </div>
      </SignedOut>
    </>
  );
}

/** Full auth shell — used in tests; production uses AuthShellLayout + AuthFormPanel. */
export function ClerkAuthShell({ mode }: AuthFormPanelProps) {
  return (
    <AuthShellLayout>
      <AuthFormPanel mode={mode} />
    </AuthShellLayout>
  );
}
