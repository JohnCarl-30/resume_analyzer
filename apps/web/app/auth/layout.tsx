import { AuthShellLayout } from "@/features/auth/views/auth-shell-layout";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthShellLayout>{children}</AuthShellLayout>;
}
