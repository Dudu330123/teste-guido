import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/auth-shell";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = { title: "Entrar | Guido" };
export default function LoginPage() {
  return <AuthShell className="login-auth-page" title="Entrar" description="Entre para salvar seu progresso e acessar suas preferências. Você também pode explorar o Guido sem uma conta."><LoginForm /></AuthShell>;
}
