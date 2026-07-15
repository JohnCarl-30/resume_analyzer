import { Suspense } from "react";

import SignInPage from "./sign-in-page";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background px-4 text-sm text-muted-foreground">
          Loading sign in…
        </main>
      }
    >
      <SignInPage />
    </Suspense>
  );
}
