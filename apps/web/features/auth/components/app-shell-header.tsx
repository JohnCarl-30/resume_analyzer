"use client";

import Link from "next/link";

import { BrandMark } from "@/features/onboarding/components/wizard-icons";
import {
  NEW_ANALYSIS_PATH,
  SCRATCH_BUILDER_PATH,
} from "@/lib/analysis-quota-navigation";
import type { AnalysisQuotaNavigationState } from "@/lib/analysis-quota-navigation";
import { useScrolledPast } from "@/lib/use-scrolled-past";
import { cn } from "@/lib/utils";

import { AccountMenu } from "./account-menu";

type AppShellNav = "home" | "new" | "tracker" | "settings";

interface AppShellHeaderProps {
  active?: AppShellNav;
  quotaNav: AnalysisQuotaNavigationState;
}

const baseNavItems: Array<{ id: AppShellNav; href: string; label: string }> = [
  { id: "home", href: "/home", label: "Home" },
  { id: "new", href: NEW_ANALYSIS_PATH, label: "Upload resume" },
  { id: "tracker", href: "/applications", label: "Applications" },
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

export function AppShellHeader({ active, quotaNav }: AppShellHeaderProps) {
  const uploadNav = getUploadNavItem(quotaNav);
  const lifted = useScrolledPast(8);

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
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className={cn("app-shell-header", lifted && "is-lifted")}>
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

        {/* Below sm the row above has no nav at all, so the same destinations
            live here as a scrollable tab strip. */}
        <nav aria-label="App navigation" className="app-shell-tabs">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="app-shell-tab"
              aria-current={active === item.id ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
}
