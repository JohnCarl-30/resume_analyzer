import type { Metadata } from "next";

import { HomePageClient } from "./home-page-client";

export const metadata: Metadata = {
  title: "Home",
  description: "See your check allowance, reopen saved analyses, or upload a resume for a new match.",
  alternates: {
    canonical: "/home",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
