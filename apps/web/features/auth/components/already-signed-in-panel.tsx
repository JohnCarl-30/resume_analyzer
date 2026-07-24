"use client";

import Link from "next/link";
import { SignOutButton, useUser } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

interface AlreadySignedInPanelProps {
  redirectPath: string;
}

export function AlreadySignedInPanel({ redirectPath }: AlreadySignedInPanelProps) {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  return (
    <div className="app-auth-card overflow-hidden">
      <div className="space-y-6 px-5 py-6 sm:px-6 sm:py-7">
        <header className="space-y-1.5">
          <h1 className="display-serif text-2xl tracking-tight text-foreground text-balance sm:text-[1.75rem]">
            You&apos;re signed in
          </h1>
          <p className="max-w-[36ch] text-sm leading-6 text-muted-foreground text-pretty">
            {email ? (
              <>
                Continue as <span className="font-medium text-foreground">{email}</span>, or switch
                accounts.
              </>
            ) : (
              "Continue to your resume check, or switch accounts."
            )}
          </p>
        </header>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="h-11 px-4 sm:flex-1">
            <Link href={redirectPath}>Continue to resume check</Link>
          </Button>
          <SignOutButton
            signOutOptions={{
              redirectUrl: `/auth/sign-in?next=${encodeURIComponent(redirectPath)}`,
            }}
          >
            <Button type="button" variant="outline" className="h-11 px-4 sm:flex-1">
              Use another account
            </Button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
}
