import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/auth-shell";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = { title: "Entrar | Guido" };
export default function LoginPage() {
  return (
    <AuthShell className="login-auth-page" title="Entrar">
      <LoginForm />
    </AuthShell>
  );
}
