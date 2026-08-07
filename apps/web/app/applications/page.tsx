import type { Metadata } from "next";

import { TrackerView } from "@/features/tracker/views/tracker-view";

export const metadata: Metadata = {
  title: "Applications",
  description:
    "Track the companies and roles you've applied to and where each application stands.",
  alternates: {
    canonical: "/applications",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ApplicationsPage() {
  return <TrackerView />;
}
