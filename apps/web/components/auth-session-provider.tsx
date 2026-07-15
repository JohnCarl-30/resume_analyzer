"use client";

import { useEffect } from "react";

import { setAccessTokenGetter } from "@/lib/auth-token";
import { createClient } from "@/lib/supabase/client";

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const supabase = createClient();

    if (!supabase) {
      return;
    }

    setAccessTokenGetter(async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      // Token getter reads fresh session on each API call.
    });

    return () => {
      subscription.unsubscribe();
      setAccessTokenGetter(async () => null);
    };
  }, []);

  return children;
}
