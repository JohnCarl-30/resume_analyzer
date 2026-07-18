"use client";

import Link from "next/link";

import { useAnalysisQuota } from "@/features/account/hooks/use-analysis-quota";
import { BrandMark } from "@/features/onboarding/components/wizard-icons";
import {
  getAnalysisQuotaNavigationState,
  NEW_ANALYSIS_PATH,
  SCRATCH_BUILDER_PATH,
} from "@/lib/analysis-quota-navigation";
import type { AnalysisQuotaNavigationState } from "@/lib/analysis-quota-navigation";
import { cn } from "@/lib/utils";

import { AccountMenu } from "./account-menu";

type AppShellNav = "home" | "new" | "settings";

interface AppShellHeaderProps {
  active?: AppShellNav;
  quotaNav?: AnalysisQuotaNavigationState;
}

const baseNavItems: Array<{ id: AppShellNav; href: string; label: string }> = [
  { id: "home", href: "/home", label: "Home" },
  { id: "new", href: NEW_ANALYSIS_PATH, label: "Upload resume" },
  { id: "settings", href: "/account", label: "Account" },
];

function navClassName(isActive: boolean) {
  return cn(
    "transition-colors hover:text-foreground",
    isActive ? "font-medium text-foreground" : "text-muted-foreground",
  );
}

function getUploadNavItem(quotaNav: AnalysisQuotaNavigationState) {
  if (quotaNav.canUpload) {
    return {
      href: NEW_ANALYSIS_PATH,
      label: "Upload resume",
    };
  }

  if (quotaNav.savedCheckPath) {
    return {
      href: quotaNav.savedCheckPath,
      label: "Saved check",
    };
  }

  return {
    href: SCRATCH_BUILDER_PATH,
    label: "New draft",
  };
}

export function AppShellHeader({ active, quotaNav: quotaNavProp }: AppShellHeaderProps) {
  const { quota, error: quotaError, isLoading: quotaLoading } = useAnalysisQuota();
  const quotaNav =
    quotaNavProp ??
    getAnalysisQuotaNavigationState(quota, {
      isLoading: quotaLoading,
      error: quotaError,
    });
  const uploadNav = getUploadNavItem(quotaNav);

  const navItems = baseNavItems.map((item) =>
    item.id === "new"
      ? {
          ...item,
          href: uploadNav.href,
          label: uploadNav.label,
        }
      : item,
  );

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/home"
          className="brand-logo inline-flex min-w-0 items-center gap-2 text-base font-semibold tracking-tight"
        >
          <BrandMark />
          <span className="font-brand">Resumae</span>
        </Link>

        <nav
          aria-label="App navigation"
          className="hidden items-center gap-5 text-sm sm:flex"
        >
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={navClassName(active === item.id)}
              aria-current={active === item.id ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <AccountMenu />
      </div>
    </header>
  );
}
