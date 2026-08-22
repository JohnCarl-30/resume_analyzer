import type { Metadata } from "next";

import { WelcomeView } from "@/features/welcome/views/welcome-view";

export const metadata: Metadata = {
  title: "Welcome",
  description: "Tell Resumae what you're aiming at so a check knows what to look for.",
};

export default function WelcomePage() {
  return <WelcomeView />;
}
