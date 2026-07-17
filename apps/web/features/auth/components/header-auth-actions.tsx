"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { DEFAULT_AFTER_AUTH_PATH } from "@/lib/auth-redirect";

export function HeaderAuthActions() {
  return (
    <div className="flex items-center gap-2">
      <SignedOut>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-9 px-3 text-muted-foreground hover:text-foreground"
        >
          <Link href={`/auth/sign-in?next=${encodeURIComponent(DEFAULT_AFTER_AUTH_PATH)}`}>
            Sign in
          </Link>
        </Button>
      </SignedOut>
      <SignedIn>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-9 px-3 text-muted-foreground hover:text-foreground"
        >
          <Link href={DEFAULT_AFTER_AUTH_PATH}>My resumes</Link>
        </Button>
        <UserButton afterSignOutUrl="/auth/sign-in" />
      </SignedIn>
    </div>
  );
}
