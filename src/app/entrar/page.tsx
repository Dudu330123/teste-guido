import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/auth-shell";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = { title: "Entrar" };
export default function LoginPage() {
  return <AuthShell title="Entrar" description="A conta é opcional nesta versão do Guido."><LoginForm /></AuthShell>;
}
