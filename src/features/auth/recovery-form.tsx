"use client";

import Link from "next/link";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { recoverySchema } from "@/lib/validation/auth";
import { FormMessage } from "./form-message";

export function RecoveryForm() {
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  return (
    <form className="mt-7" onSubmit={async (event) => {
      event.preventDefault();
      const parsed = recoverySchema.safeParse({ email: new FormData(event.currentTarget).get("email") });
      if (!parsed.success) { setSuccess(false); setMessage(parsed.error.issues[0]?.message ?? "Informe um e-mail válido."); return; }
      const supabase = getSupabaseBrowserClient();
      if (!supabase) { setSuccess(false); setMessage("A recuperação de senha estará disponível após conectar o Supabase."); return; }
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email);
      setSuccess(!error);
      setMessage(error ? "Não foi possível enviar o pedido agora." : "Se houver uma conta com esse e-mail, você receberá as instruções.");
    }}>
      <label htmlFor="recovery-email" className="block font-bold">E-mail da conta</label>
      <input id="recovery-email" name="email" type="email" autoComplete="email" required className="mt-2 min-h-14 w-full border-2 border-[var(--border)] px-4" />
      <button type="submit" className="mt-7 min-h-14 w-full bg-[var(--primary)] px-5 py-3 text-xl font-bold text-white">Enviar instruções</button>
      <FormMessage message={message} type={success ? "success" : "error"} />
      <Link href="/entrar" className="mt-6 block font-bold underline">Voltar para entrar</Link>
    </form>
  );
}
