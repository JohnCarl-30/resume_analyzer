"use client";

import Link from "next/link";
import { SignOutButton, SignedIn, useUser } from "@clerk/nextjs";
import {
  ChevronDownIcon,
  ExitIcon,
  GearIcon,
  HomeIcon,
} from "@radix-ui/react-icons";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AccountMenuProps {
  signInRedirectPath?: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function AccountMenu({ signInRedirectPath: _signInRedirectPath }: AccountMenuProps) {
  const { user, isLoaded } = useUser();
  const displayName =
    user?.fullName?.trim() ||
    user?.primaryEmailAddress?.emailAddress ||
    "Account";
  const email = user?.primaryEmailAddress?.emailAddress;

  return (
    <SignedIn>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "app-account-menu-trigger",
              "inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background py-0.5 pr-1.5 pl-0.5 text-xs font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/20",
            )}
            aria-label="Open account menu"
          >
            <span
              className="inline-flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold"
              aria-hidden="true"
            >
              {isLoaded ? getInitials(displayName) : "…"}
            </span>
            <ChevronDownIcon aria-hidden="true" className="size-3.5 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {isLoaded ? (
            <>
              <DropdownMenuLabel className="font-normal">
                <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
                {email ? (
                  <p className="truncate text-xs font-normal text-muted-foreground">{email}</p>
                ) : null}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          ) : (
            <div className="space-y-2 px-2 py-1.5" aria-hidden="true">
              <Skeleton className="app-skeleton h-4 w-32" />
              <Skeleton className="app-skeleton h-3 w-40" />
            </div>
          )}
          <DropdownMenuItem asChild>
            <Link href="/home">
              <HomeIcon aria-hidden="true" />
              Home
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account">
              <GearIcon aria-hidden="true" />
              Account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <SignOutButton signOutOptions={{ redirectUrl: "/auth/sign-in" }}>
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
    </SignedIn>
  );
}
