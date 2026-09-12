"use client";

import Link from "next/link";
import { useState } from "react";
import { recoverySchema, resetPasswordSchema } from "@/lib/validation/auth";
import { FormMessage } from "./form-message";

interface RecoveryFormProps {
  resetMode?: boolean;
  resetToken?: string;
}

export function RecoveryForm({ resetMode = false, resetToken = "" }: RecoveryFormProps) {
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  if (resetMode) {
    return (
      <form className="mt-7" onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const parsed = resetPasswordSchema.safeParse({
          password: form.get("password"),
          confirmPassword: form.get("confirmPassword"),
        });
        if (!parsed.success) {
          setSuccess(false);
          setMessage(parsed.error.issues[0]?.message ?? "Revise as senhas.");
          return;
        }
        setSubmitting(true);
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ token: resetToken, password: parsed.data.password }),
        });
        const body = await response.json() as { error?: { message?: string } };
        setSubmitting(false);
        setSuccess(response.ok);
        setMessage(response.ok ? "✓ Senha alterada com sucesso! Você já pode entrar." : body.error?.message ?? "Não foi possível alterar a senha.");
      }}>
        <label htmlFor="new-password" className="block font-bold">Nova senha</label>
        <input id="new-password" name="password" type="password" autoComplete="new-password" required minLength={8} className="glass-control mt-2 min-h-14 w-full px-4" />
        <label htmlFor="confirm-new-password" className="mt-5 block font-bold">Confirme a nova senha</label>
        <input id="confirm-new-password" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} className="glass-control mt-2 min-h-14 w-full px-4" />
      <button type="submit" disabled={submitting} className="primary-action mt-7 min-h-14 w-full px-5 py-3 text-xl font-bold">
        {submitting ? "Salvando…" : "Salvar nova senha"}
      </button>

      <FormMessage message={message} type={success ? "success" : "error"} />
      <Link href="/entrar" className="mt-6 block font-bold underline hover:text-blue-600 transition-colors">Voltar para entrar</Link>
    </form>
    );
  }

  return (
    <form className="mt-7" onSubmit={async (event) => {
      event.preventDefault();
      const parsed = recoverySchema.safeParse({ email: new FormData(event.currentTarget).get("email") });
      if (!parsed.success) {
        setSuccess(false);
        setMessage(parsed.error.issues[0]?.message ?? "Informe um e-mail válido.");
        return;
      }
      setSubmitting(true);
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const body = await response.json() as { error?: { message?: string }; data?: { message?: string } };
      setSubmitting(false);
      setSuccess(response.ok);
      setMessage(response.ok ? body.data?.message ?? "Se houver uma conta com esse e-mail, as instruções foram enviadas." : body.error?.message ?? "Não foi possível enviar o pedido de recuperação.");
    }}>
      <label htmlFor="recovery-email" className="block font-bold">E-mail da conta</label>
      <input id="recovery-email" name="email" type="email" autoComplete="email" required className="glass-control mt-2 min-h-14 w-full px-4" />
      <button type="submit" disabled={submitting} className="primary-action mt-7 min-h-14 w-full px-5 py-3 text-xl font-bold">
        {submitting ? "Enviando…" : "Enviar instruções"}
      </button>

      <FormMessage message={message} type={success ? "success" : "error"} />
      <Link href="/entrar" className="mt-6 block font-bold underline hover:text-blue-600 transition-colors">Voltar para entrar</Link>
    </form>
  );
}
