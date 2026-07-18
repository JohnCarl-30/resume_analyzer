import Link from "next/link";

import { BrandMark } from "@/features/onboarding/components/wizard-icons";

import { SignInBrandPanel } from "../components/sign-in-brand-panel";

interface AuthShellLayoutProps {
  children: React.ReactNode;
}

/** Persistent auth chrome — left stage stays mounted across sign-in / sign-up. */
export function AuthShellLayout({ children }: AuthShellLayoutProps) {
  return (
    <main className="app-auth-shell h-dvh overflow-hidden bg-background text-foreground lg:grid">
      <SignInBrandPanel />

      <section className="app-auth-form-pane relative z-0 h-dvh min-h-0 overflow-y-auto overscroll-y-contain">
        <div className="relative z-10 flex min-h-full w-full flex-col justify-center px-4 py-8 sm:px-8 lg:px-12 lg:py-10">
          <div className="mx-auto w-full max-w-[26rem] py-4 sm:py-6">
            <div className="mb-6 lg:hidden">
              <Link
                href="/"
                className="brand-logo inline-flex min-h-11 items-center gap-2 text-base font-semibold tracking-tight focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
              >
                <BrandMark />
                <span className="font-brand">Resumae</span>
              </Link>
            </div>

            <div className="app-auth-form-content">{children}</div>
          </div>
        </div>
      </section>
    </main>
  );
}
