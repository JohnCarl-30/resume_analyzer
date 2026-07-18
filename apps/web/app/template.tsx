"use client";

import { usePathname } from "next/navigation";

function getTransitionKey(pathname: string) {
  if (pathname.startsWith("/auth/sign-in") || pathname.startsWith("/auth/sign-up")) {
    return "/auth";
  }

  return pathname;
}

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const transitionKey = getTransitionKey(pathname);

  return (
    <div key={transitionKey} className="page-enter">
      {children}
    </div>
  );
}
