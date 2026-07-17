"use client";

import { useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { resolveSafeRedirectPath } from "@/lib/auth-redirect";

/**
 * When the API rejects a Clerk token, users can land here still signed in to Clerk.
 * Sign them out automatically so the SignIn form can render.
 */
export function SessionExpiredRecovery() {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const searchParams = useSearchParams();
  const isRecoveringRef = useRef(false);
  const reason = searchParams.get("reason");
  const redirectPath = resolveSafeRedirectPath(searchParams.get("next"));

  useEffect(() => {
    if (!isLoaded || reason !== "session-expired" || !isSignedIn || isRecoveringRef.current) {
      return;
    }

    isRecoveringRef.current = true;

    void signOut({
      redirectUrl: `/auth/sign-in?next=${encodeURIComponent(redirectPath)}`,
    });
  }, [isLoaded, isSignedIn, reason, redirectPath, signOut]);

  if (reason !== "session-expired" || !isSignedIn) {
    return null;
  }

  return (
    <p className="mb-6 text-sm leading-6 text-muted-foreground" role="status">
      Your previous session couldn&apos;t be verified. Signing you out so you can sign in again…
    </p>
  );
}
