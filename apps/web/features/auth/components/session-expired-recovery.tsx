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
    <p
      className="mb-5 rounded-md border border-[color:var(--page-line)] bg-[color:var(--brand-soft)] px-3.5 py-2.5 text-sm leading-6 text-[color:var(--brand-strong)]"
      role="status"
      aria-live="polite"
    >
      Session expired. Signing you out so you can sign in again…
    </p>
  );
}
