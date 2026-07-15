import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

let accessTokenGetter: (() => Promise<string | null>) | null = null;

export function setAccessTokenGetter(getter: () => Promise<string | null>) {
  accessTokenGetter = getter;
}

export async function getAccessToken() {
  if (accessTokenGetter) {
    return accessTokenGetter();
  }

  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createClient();
  if (!supabase) {
    return null;
  }

  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
