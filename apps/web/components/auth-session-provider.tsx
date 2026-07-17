"use client";

import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

import { resolveSafeRedirectPath } from "@/lib/auth-redirect";
import { setAccessTokenGetter, setUnauthorizedHandler } from "@/lib/auth-token";

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, signOut } = useAuth();
  const pathname = usePathname();
  const isHandlingUnauthorizedRef = useRef(false);
  const authRef = useRef({ getToken, isLoaded });
  authRef.current = { getToken, isLoaded };

  useMemo(() => {
    setAccessTokenGetter(async () => {
      const { getToken: resolveToken, isLoaded: loaded } = authRef.current;
      if (!loaded) {
        return null;
      }

      return resolveToken();
    });
  }, []);

  useEffect(
    () => () => {
      setAccessTokenGetter(async () => null);
    },
    [],
  );

  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (isHandlingUnauthorizedRef.current || pathname.startsWith("/auth/")) {
        return;
      }

      isHandlingUnauthorizedRef.current = true;

      const nextPath = resolveSafeRedirectPath(pathname);
      const signInUrl = `/auth/sign-in?reason=session-expired&next=${encodeURIComponent(nextPath)}`;

      void signOut({ redirectUrl: signInUrl }).finally(() => {
        isHandlingUnauthorizedRef.current = false;
      });
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [pathname, signOut]);

  return children;
}
