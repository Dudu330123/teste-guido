"use client";

import Link from "next/link";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { recoverySchema, resetPasswordSchema } from "@/lib/validation/auth";
import { FormMessage } from "./form-message";

interface RecoveryFormProps {
  resetMode?: boolean;
}

export function RecoveryForm({ resetMode = false }: RecoveryFormProps) {
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
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
          setSuccess(false);
          setMessage("A recuperação de senha ainda não está configurada.");
          return;
        }
        setSubmitting(true);
        const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
        setSubmitting(false);
        setSuccess(!error);
        setMessage(error ? "O link expirou ou não foi possível trocar a senha." : "Senha alterada. Você já pode entrar.");
      }}>
        <label htmlFor="new-password" className="block font-bold">Nova senha</label>
        <input id="new-password" name="password" type="password" autoComplete="new-password" required minLength={8} className="glass-control mt-2 min-h-14 w-full px-4" />
        <label htmlFor="confirm-new-password" className="mt-5 block font-bold">Confirme a nova senha</label>
        <input id="confirm-new-password" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} className="glass-control mt-2 min-h-14 w-full px-4" />
        <button type="submit" disabled={submitting} className="primary-action mt-7 min-h-14 w-full px-5 py-3 text-xl font-bold">
          {submitting ? "Salvando…" : "Salvar nova senha"}
        </button>
        <FormMessage message={message} type={success ? "success" : "error"} />
        <Link href="/entrar" className="mt-6 block font-bold underline">Voltar para entrar</Link>
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
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setSuccess(false);
        setMessage("A recuperação de senha estará disponível após conectar o Supabase.");
        return;
      }
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/recuperar-senha?modo=nova-senha")}`;
      setSubmitting(true);
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo });
      setSubmitting(false);
      setSuccess(!error);
      setMessage(error ? "Não foi possível enviar o pedido agora." : "Se houver uma conta com esse e-mail, você receberá as instruções.");
    }}>
      <label htmlFor="recovery-email" className="block font-bold">E-mail da conta</label>
      <input id="recovery-email" name="email" type="email" autoComplete="email" required className="glass-control mt-2 min-h-14 w-full px-4" />
      <button type="submit" disabled={submitting} className="primary-action mt-7 min-h-14 w-full px-5 py-3 text-xl font-bold">
        {submitting ? "Enviando…" : "Enviar instruções"}
      </button>
      <FormMessage message={message} type={success ? "success" : "error"} />
      <Link href="/entrar" className="mt-6 block font-bold underline">Voltar para entrar</Link>
    </form>
  );
}
