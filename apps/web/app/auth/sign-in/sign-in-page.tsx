"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignInBrandPanel } from "@/features/auth/components/sign-in-brand-panel";
import { BrandMark } from "@/features/onboarding/components/wizard-icons";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

/* Hallmark · genre: editorial · macrostructure: Split Studio · theme: custom (existing tokens)
 * nav: none (auth) · enrichment: Tier-B resume document SVG · designed-as: single-page (sign-in)
 * pre-emit critique: P5 H4 E5 S4 R5 V5 */

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/analysis/new";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!isSupabaseConfigured()) {
      setError("Sign-in is not configured yet. Add Supabase env vars to enable accounts.");
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("Sign-in is not available right now.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "sign-up") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          throw signUpError;
        }

        setMessage("Account created. You can sign in now.");
        setMode("sign-in");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      router.replace(nextPath);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground lg:grid lg:min-h-screen lg:grid-cols-2">
      <SignInBrandPanel />

      <section className="flex min-h-screen flex-col justify-center px-4 py-10 sm:px-8 lg:px-14 lg:py-12">
        <div className="mx-auto w-full max-w-[22rem]">
          <div className="mb-8 lg:hidden">
            <Link
              href="/"
              className="brand-logo inline-flex items-center gap-2 text-base font-semibold tracking-tight"
            >
              <BrandMark />
              <span className="font-display">Deep Focus</span>
            </Link>
          </div>

          <header
            className="animate-enter-up mb-8"
            style={{ "--enter-delay": "40ms" } as CSSProperties}
          >
            <h1 className="display-serif text-2xl text-foreground sm:text-[1.65rem]">
              {mode === "sign-up" ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {mode === "sign-up"
                ? "One AI resume check per account, free to start."
                : "Sign in to run your resume check against a job post."}
            </p>
          </header>

          <form
            className="animate-enter-up flex flex-col gap-4"
            style={{ "--enter-delay": "110ms" } as CSSProperties}
            onSubmit={handleSubmit}
          >
            <label className="flex flex-col gap-2 text-sm font-medium">
              Email
              <Input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-10"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              Password
              <Input
                type="password"
                autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-10"
              />
            </label>

            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="text-sm text-muted-foreground" role="status">
                {message}
              </p>
            ) : null}

            <Button type="submit" disabled={isSubmitting} className="mt-1 h-10 w-full">
              {isSubmitting ? "Working…" : mode === "sign-up" ? "Create account" : "Sign in"}
            </Button>
          </form>

          <div
            className="animate-enter-up mt-6 flex flex-col gap-3 text-sm text-muted-foreground"
            style={{ "--enter-delay": "170ms" } as CSSProperties}
          >
            <button
              type="button"
              className="motion-link w-fit text-left font-medium text-foreground underline-offset-4 hover:underline"
              onClick={() => {
                setMode(mode === "sign-up" ? "sign-in" : "sign-up");
                setError("");
                setMessage("");
              }}
            >
              {mode === "sign-up" ? "Already have an account? Sign in" : "Need an account? Create one"}
            </button>
            <p>
              After your one analysis, you can still update that saved check against a new job post.
            </p>
            <Link href="/" className="motion-link w-fit hover:text-foreground">
              ← Back to home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
