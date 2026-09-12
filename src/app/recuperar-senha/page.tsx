import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/auth-shell";
import { RecoveryForm } from "@/features/auth/recovery-form";

export const metadata: Metadata = { title: "Recuperar senha" };
interface RecoveryPageProps {
  searchParams: Promise<{ modo?: string; token?: string }>;
}

export default async function RecoveryPage({ searchParams }: RecoveryPageProps) {
  const params = await searchParams;
  const resetMode = params.modo === "nova-senha" || Boolean(params.token);
  return (
    <AuthShell
      title={resetMode ? "Criar nova senha" : "Recuperar senha"}
      description={resetMode ? "Escolha uma nova senha para sua conta Guido." : "Informe seu e-mail para receber as instruções."}
    >
      <RecoveryForm resetMode={resetMode} resetToken={params.token} />
    </AuthShell>
  );
}
