import type { Metadata } from "next";

import { AccountPageView } from "@/features/account/views/account-page-view";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your Deep Focus profile, resume-check allowance, and sign-in session.",
  alternates: {
    canonical: "/account",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountPage() {
  return <AccountPageView />;
}
