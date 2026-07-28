"use client";

import Link from "next/link";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { signUpSchema } from "@/lib/validation/auth";
import { FormMessage } from "./form-message";

export function SignupForm() {
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  return (
    <form className="mt-7 space-y-5" onSubmit={async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const parsed = signUpSchema.safeParse({
        name: form.get("name"), email: form.get("email"), password: form.get("password"),
        confirmPassword: form.get("confirmPassword"), preferredOperatingSystem: form.get("preferredOperatingSystem"),
      });
      if (!parsed.success) { setSuccess(false); setMessage(parsed.error.issues[0]?.message ?? "Revise os dados informados."); return; }
      const supabase = getSupabaseBrowserClient();
      if (!supabase) { setSuccess(false); setMessage("O cadastro ainda não está conectado ao Supabase. A aplicação pode ser usada sem conta."); return; }
      const { name, email, password, preferredOperatingSystem } = parsed.data;
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { name, preferred_operating_system: preferredOperatingSystem } } });
      setSuccess(!error);
      setMessage(error ? "Não foi possível criar a conta. Revise os dados e tente novamente." : "Cadastro recebido. Verifique seu e-mail para continuar.");
    }}>
      <div><label htmlFor="name" className="block font-bold">Nome</label><input id="name" name="name" autoComplete="name" required className="mt-2 min-h-14 w-full border-2 border-[var(--border)] px-4" /></div>
      <div><label htmlFor="signup-email" className="block font-bold">E-mail</label><input id="signup-email" name="email" type="email" autoComplete="email" required className="mt-2 min-h-14 w-full border-2 border-[var(--border)] px-4" /></div>
      <div><label htmlFor="signup-password" className="block font-bold">Senha</label><input id="signup-password" name="password" type="password" autoComplete="new-password" required minLength={8} className="mt-2 min-h-14 w-full border-2 border-[var(--border)] px-4" /></div>
      <div><label htmlFor="confirm-password" className="block font-bold">Confirme a senha</label><input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} className="mt-2 min-h-14 w-full border-2 border-[var(--border)] px-4" /></div>
      <fieldset>
        <legend className="font-bold">Celular preferido</legend>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <label className="flex min-h-12 items-center gap-3 rounded-xl border-2 border-[var(--border)] px-4"><input type="radio" name="preferredOperatingSystem" value="android" defaultChecked className="size-5" /> Android</label>
          <label className="flex min-h-12 items-center gap-3 rounded-xl border-2 border-[var(--border)] px-4"><input type="radio" name="preferredOperatingSystem" value="ios" className="size-5" /> iPhone</label>
        </div>
      </fieldset>
      <button type="submit" className="min-h-14 w-full bg-[var(--primary)] px-5 py-3 text-xl font-bold text-white">Criar conta</button>
      <FormMessage message={message} type={success ? "success" : "error"} />
      <Link href="/entrar" className="block font-bold underline">Já tenho uma conta</Link>
    </form>
  );
}
