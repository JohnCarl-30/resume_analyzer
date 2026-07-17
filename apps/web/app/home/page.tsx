import type { Metadata } from "next";

import { HomePageClient } from "./home-page-client";

export const metadata: Metadata = {
  title: "Home",
  description: "Your profile, saved resume checks, and quick access to upload a new resume.",
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
