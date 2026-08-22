"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import { HeroPreview } from "@/features/landing/components/hero-preview";
import { BrandMark } from "@/features/onboarding/components/wizard-icons";

import { ChipGroup } from "../components/chip-group";
import {
  EXPERIENCE_LEVELS,
  INTENTS,
  TARGET_FIELDS,
  type WelcomeIntent,
} from "../model/welcome-profile";
import { useWelcomeProfile } from "../view-models/use-welcome-profile";

/**
 * Every question on one screen.
 *
 * The account has a single free AI check, so each extra step between signing
 * up and spending it is somewhere to lose people. The split layout keeps the
 * product visible while the questions are answered.
 */
export function WelcomeView() {
  const {
    targetField,
    experienceLevel,
    intent,
    isSaving,
    error,
    canSubmit,
    setTargetField,
    setExperienceLevel,
    setIntent,
    submit,
    skip,
  } = useWelcomeProfile();

  return (
    <main className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col px-4 py-10 sm:px-8 lg:px-12 lg:py-14">
        <Link
          href="/home"
          className="brand-logo inline-flex items-center gap-2 self-start text-base font-semibold tracking-tight text-foreground"
        >
          <BrandMark />
          <span className="font-brand">Resumae</span>
        </Link>

        <div className="mx-auto mt-10 w-full max-w-md lg:mt-16">
          <h1 className="display-serif text-3xl text-foreground">Let&rsquo;s aim this properly.</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Three questions. They shape what a check looks for, and you can change any of it later.
          </p>

          <form
            className="mt-8 space-y-8"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            <ChipGroup
              legend="What kind of role are you aiming at?"
              options={TARGET_FIELDS}
              value={targetField}
              onChange={setTargetField}
            />

            <ChipGroup
              legend="How far along are you?"
              options={EXPERIENCE_LEVELS}
              value={experienceLevel}
              onChange={setExperienceLevel}
            />

            <ChipGroup<WelcomeIntent>
              legend="What would you like to do first?"
              hint="We'll take you straight there."
              options={INTENTS}
              value={intent}
              onChange={setIntent}
            />

            {error ? (
              <p className="app-inline-notice text-sm text-muted-foreground" role="alert">
                {error}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" size="lg" disabled={!canSubmit} className="h-11 gap-2 px-5">
                {isSaving ? "Saving…" : "Continue"}
                <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-11 text-muted-foreground"
                onClick={() => void skip()}
                disabled={isSaving}
              >
                Skip for now
              </Button>
            </div>
          </form>
        </div>
      </div>

      <aside className="hidden items-center bg-muted/40 p-12 lg:flex">
        <div className="w-full">
          <HeroPreview />
          <p className="mt-6 max-w-[42ch] text-sm leading-6 text-muted-foreground">
            Every check is measured against the job post you paste in — not a generic template.
          </p>
        </div>
      </aside>
    </main>
  );
}
