import { AuthShellLayout } from "@/features/auth/views/auth-shell-layout";
import "./clerk-overrides.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthShellLayout>{children}</AuthShellLayout>;
}
