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
  "font-semibold text-primary underline underline-offset-[3px] hover:text-primary/85 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20";

/** Own the card chrome — hide Clerk branding; keep email + Google form only. */
const clerkAppearance = {
  variables: {
    colorPrimary: "var(--foreground)",
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
    identityPreviewEditButton: "!text-primary",
    alternativeMethodsBlockButton: "!border-border !bg-background !text-foreground !shadow-none",
  },
} as const;

const clerkAppearanceSignUp = {
  ...clerkAppearance,
  elements: {
    ...clerkAppearance.elements,
    card: "!bg-transparent !shadow-none !border-0 !p-0 !gap-2 !rounded-none",
    main: "!gap-2",
    form: "!gap-2",
    formFieldRow: "!gap-1",
    formField: "!gap-1",
    socialButtonsBlockButton:
      "h-10 !border !border-[color:var(--page-line-strong)] !bg-white !text-sm !font-medium !text-foreground hover:!bg-muted !shadow-none focus-visible:!ring-2 focus-visible:!ring-ring/20",
    formButtonPrimary:
      "mt-0 !flex !h-10 !w-full !items-center !justify-center !text-center !bg-foreground !text-background !text-sm !font-medium hover:!bg-foreground/90 !shadow-none focus-visible:!ring-2 focus-visible:!ring-ring/20",
    formFieldInput:
      "h-10 !border !border-[color:var(--page-line-strong)] !bg-white !px-3 !text-sm !text-foreground !shadow-none focus-visible:!border-foreground focus-visible:!ring-2 focus-visible:!ring-ring/20",
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
          className={`animate-enter-up-safe space-y-1 ${isSignUp ? "mb-4" : "mb-5"}`}
          style={{ "--enter-delay": "40ms" } as CSSProperties}
        >
          <h1
            className={`tracking-tight text-foreground ${isSignUp ? "text-xl font-semibold sm:text-2xl" : "display-serif text-2xl sm:text-[1.75rem]"}`}
          >
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm leading-6 text-muted-foreground text-pretty">
            {isSignUp
              ? "One AI resume check per account, free to start."
              : "Sign in to run your resume check against a job post."}
          </p>
        </header>

        <div
          className="animate-enter-up-safe app-auth-card overflow-visible"
          style={{ "--enter-delay": "110ms" } as CSSProperties}
        >
          <div
            className={`app-auth-clerk px-5 sm:px-6 ${isSignUp ? "app-auth-clerk--sign-up py-3 sm:py-4" : "app-auth-clerk--sign-in py-5 sm:py-6"}`}
          >
            <AuthComponent
              routing="path"
              path={isSignUp ? "/auth/sign-up" : "/auth/sign-in"}
              signInUrl="/auth/sign-in"
              signUpUrl="/auth/sign-up"
              forceRedirectUrl={redirectPath}
              appearance={isSignUp ? clerkAppearanceSignUp : clerkAppearance}
            />
          </div>

          <div
            className={`app-auth-card-footer rounded-b-[calc(var(--radius)+0.125rem)] border-t border-border text-sm leading-6 text-foreground/80 ${isSignUp ? "px-5 py-2.5 sm:px-6" : "px-6 py-3.5 sm:px-7"}`}
          >
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
          className={`animate-enter-up-safe text-sm leading-6 text-muted-foreground ${isSignUp ? "mt-5" : "mt-6 space-y-3"}`}
          style={{ "--enter-delay": "170ms" } as CSSProperties}
        >
          {!isSignUp ? (
            <p className="text-pretty">
              After your one analysis, you can still update that saved check against a new job post.
            </p>
          ) : null}
          <Link
            href="/"
            className="motion-link inline-flex min-h-11 items-center hover:text-foreground focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
          >
            ← Back to marketing home
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
