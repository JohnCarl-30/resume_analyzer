"use client";

import Link from "next/link";
import { SignedOut } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { DEFAULT_AFTER_AUTH_PATH } from "@/lib/auth-redirect";

import { AccountMenu } from "./account-menu";

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
      <AccountMenu />
    </div>
  );
}
