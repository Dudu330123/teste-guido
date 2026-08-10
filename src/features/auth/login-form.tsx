"use client";

import Link from "next/link";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validation/auth";
import { FormMessage } from "./form-message";

export function LoginForm() {
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  return (
    <form className="mt-7" onSubmit={async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const parsed = loginSchema.safeParse({ email: form.get("email"), password: form.get("password") });
      if (!parsed.success) { setSuccess(false); setMessage(parsed.error.issues[0]?.message ?? "Revise os dados informados."); return; }
      const supabase = getSupabaseBrowserClient();
      if (!supabase) { setSuccess(false); setMessage("A autenticação ainda não foi configurada. Consulte o README para conectar o Supabase."); return; }
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      setSuccess(!error);
      setMessage(error ? "Não foi possível entrar. Confira o e-mail e a senha." : "Entrada realizada com sucesso.");
    }}>
      <label htmlFor="email" className="block font-bold">E-mail</label>
      <input id="email" name="email" type="email" autoComplete="email" required className="glass-control mt-2 min-h-14 w-full px-4" />
      <label htmlFor="password" className="mt-5 block font-bold">Senha</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required minLength={8} className="glass-control mt-2 min-h-14 w-full px-4" />
      <button type="submit" className="primary-action mt-7 min-h-14 w-full px-5 py-3 text-xl font-bold">Entrar</button>
      <FormMessage message={message} type={success ? "success" : "error"} />
      <div className="mt-6 flex flex-col gap-3">
        <Link href="/recuperar-senha" className="font-bold underline">Esqueci minha senha</Link>
        <Link href="/cadastro" className="font-bold underline">Criar uma conta</Link>
      </div>
    </form>
  );
}
