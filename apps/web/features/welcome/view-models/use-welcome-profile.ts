"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  destinationForIntent,
  type ExperienceLevel,
  type TargetField,
  type WelcomeIntent,
  type WelcomeProfile,
} from "../model/welcome-profile";

export function useWelcomeProfile() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [targetField, setTargetField] = useState<TargetField | null>(null);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null);
  const [intent, setIntent] = useState<WelcomeIntent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = Boolean(targetField && experienceLevel && intent) && !isSaving;

  async function submit() {
    if (!targetField || !experienceLevel || !intent) {
      return;
    }

    const profile: WelcomeProfile = {
      targetField,
      experienceLevel,
      intent,
      completedAt: new Date().toISOString(),
    };

    setIsSaving(true);
    setError("");

    try {
      // Clerk metadata rather than our own table: the API is mid-migration and
      // has no profile store, and this survives across devices either way.
      await user?.update({
        unsafeMetadata: { ...(user.unsafeMetadata ?? {}), welcome: profile },
      });
      router.replace(destinationForIntent(intent));
    } catch {
      setError("We couldn't save that. Try again, or skip for now.");
      setIsSaving(false);
    }
  }

  /** Skipping still records that the questions were seen, so they stop asking. */
  async function skip() {
    setIsSaving(true);
    try {
      await user?.update({
        unsafeMetadata: {
          ...(user.unsafeMetadata ?? {}),
          welcome: { skippedAt: new Date().toISOString(), completedAt: new Date().toISOString() },
        },
      });
    } finally {
      router.replace("/home");
    }
  }

  return {
    isLoaded,
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
  };
}
