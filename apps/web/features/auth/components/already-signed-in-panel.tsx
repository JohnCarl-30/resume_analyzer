"use client";

import Link from "next/link";
import { SignOutButton, useUser } from "@clerk/nextjs";

interface AlreadySignedInPanelProps {
  redirectPath: string;
}

export function AlreadySignedInPanel({ redirectPath }: AlreadySignedInPanelProps) {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  return (
    <div className="space-y-4 text-sm">
      <p className="leading-6 text-muted-foreground">
        You&apos;re already signed in
        {email ? (
          <>
            {" "}
            as <span className="font-medium text-foreground">{email}</span>
          </>
        ) : null}
        .
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href={redirectPath}
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Continue to resume check
        </Link>
        <SignOutButton
          signOutOptions={{
            redirectUrl: `/auth/sign-in?next=${encodeURIComponent(redirectPath)}`,
          }}
        >
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Use another account
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}
