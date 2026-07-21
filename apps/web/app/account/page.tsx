import type { Metadata } from "next";

import { AccountPageClient } from "./account-page-client";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your Resumae profile, resume-check allowance, and sign-in session.",
  alternates: {
    canonical: "/account",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountPage() {
  return <AccountPageClient />;
}
