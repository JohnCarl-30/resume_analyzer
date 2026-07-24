"use client";

import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

import { resolveSafeRedirectPath } from "@/lib/auth-redirect";
import { clearStoredToken, setAccessTokenGetter, setUnauthorizedHandler } from "@/lib/auth-token";

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, isSignedIn, signOut } = useAuth();
  const pathname = usePathname();
  const isHandlingUnauthorizedRef = useRef(false);
  const authRef = useRef({ getToken, isLoaded, isSignedIn });
  authRef.current = { getToken, isLoaded, isSignedIn };

  useMemo(() => {
    setAccessTokenGetter(async () => {
      const { getToken: resolveToken, isLoaded: loaded, isSignedIn: signedIn } = authRef.current;
      if (!loaded || !signedIn) {
        return null;
      }

      const cached = await resolveToken();
      if (cached) {
        return cached;
      }

      // Fresh sessions can be signed-in before a JWT is cached; force one network fetch.
      return resolveToken({ skipCache: true });
    });
  }, []);

  useEffect(
    () => () => {
      setAccessTokenGetter(async () => null);
      clearStoredToken();
    },
    [],
  );

  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (isHandlingUnauthorizedRef.current || pathname.startsWith("/auth/")) {
        return;
      }

      isHandlingUnauthorizedRef.current = true;
      clearStoredToken();

      const nextPath = resolveSafeRedirectPath(pathname);
      const signInUrl = `/auth/sign-in?reason=session-expired&next=${encodeURIComponent(nextPath)}`;

void signOut({ redirectUrl: signInUrl }).finally(() => {
            isHandlingUnauthorizedRef.current = false;
            clearStoredToken();
          });
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [pathname, signOut]);

  return children;
}
