import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/analysis/new";

  const supabase = await createClient();

  if (!supabase) {
    redirect("/auth/sign-in?error=auth-not-configured");
  }

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  redirect(next);
}
