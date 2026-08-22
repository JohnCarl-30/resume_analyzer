"use client";

import { useClerk } from "@clerk/nextjs";
import { Pencil1Icon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";

/**
 * Opens Clerk's own profile dialog.
 *
 * Name, email and password are all held by Clerk, so editing them here would
 * mean rebuilding flows Clerk already ships -- including verification emails
 * and password rules. Until this existed there was no way to change any of
 * them from inside the app at all.
 */
export function ManageProfileButton() {
  const { openUserProfile } = useClerk();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => openUserProfile()}
    >
      <Pencil1Icon data-icon="inline-start" aria-hidden="true" />
      Manage
    </Button>
  );
}
