import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/auth-shell";
import { RecoveryForm } from "@/features/auth/recovery-form";

export const metadata: Metadata = { title: "Recuperar senha" };
export default function RecoveryPage() {
  return <AuthShell title="Recuperar senha" description="Informe seu e-mail para receber as instruções do Supabase Auth."><RecoveryForm /></AuthShell>;
}
