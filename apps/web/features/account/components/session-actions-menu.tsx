"use client";

import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import {
  ChevronDownIcon,
  ExitIcon,
  HomeIcon,
} from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DEFAULT_AFTER_AUTH_PATH } from "@/lib/auth-redirect";
import { cn } from "@/lib/utils";

interface SessionActionsMenuProps {
  className?: string;
}

export function SessionActionsMenu({ className }: SessionActionsMenuProps) {
  const signInUrl = `/auth/sign-in?next=${encodeURIComponent(DEFAULT_AFTER_AUTH_PATH)}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn("app-session-menu-trigger", className)}
        >
          Session actions
          <ChevronDownIcon aria-hidden="true" className="size-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuItem asChild>
          <Link href="/home">
            <HomeIcon aria-hidden="true" />
            Back to home
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <SignOutButton signOutOptions={{ redirectUrl: signInUrl }}>
          <DropdownMenuItem
            variant="destructive"
            onSelect={(event) => event.preventDefault()}
          >
            <ExitIcon aria-hidden="true" />
            Sign out
          </DropdownMenuItem>
        </SignOutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
