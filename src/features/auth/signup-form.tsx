"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { signUpSchema } from "@/lib/validation/auth";
import { getSignupErrorMessage } from "./auth-error-message";
import { FormMessage } from "./form-message";
import { SocialAuthButtons } from "./social-auth-buttons";

export function SignupForm() {
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setPassword(value);
    setPasswordStrength([value.length >= 8, /[A-Z]/.test(value), /[0-9]/.test(value), /[^A-Za-z0-9]/.test(value)].filter(Boolean).length);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = signUpSchema.safeParse({
      name: form.get("name"), email: form.get("email"), password: form.get("password"),
      confirmPassword: form.get("confirmPassword"), preferredOperatingSystem: form.get("preferredOperatingSystem"),
    });
    if (!parsed.success) {
      setSuccess(false);
      setMessage(parsed.error.issues[0]?.message ?? "Revise os dados informados.");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setSuccess(false);
      setMessage("O cadastro ainda não está configurado neste ambiente.");
      return;
    }
    const { name, email, password: validPassword, preferredOperatingSystem } = parsed.data;
    setSubmitting(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: validPassword,
        options: {
          data: { name, preferred_operating_system: preferredOperatingSystem },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/conta")}`,
        },
      });
      setSuccess(!error);
      setMessage(error ? getSignupErrorMessage(error) : "Cadastro recebido. Confira seu e-mail para confirmar a conta.");
    } catch {
      setSuccess(false);
      setMessage("Não foi possível conectar ao Guido. Verifique sua conexão e tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="mt-7 space-y-5" noValidate onSubmit={(event) => void handleSubmit(event)} aria-busy={submitting}>
      <SocialAuthButtons disabled={submitting} />
      <div className="login-method-divider" role="separator" aria-label="ou"><span>ou cadastre-se com e-mail</span></div>
      <div><label htmlFor="name" className="block font-bold">Nome</label><input id="name" name="name" autoComplete="name" required className="glass-control mt-2 min-h-14 w-full px-4" /></div>
      <div><label htmlFor="signup-email" className="block font-bold">E-mail</label><input id="signup-email" name="email" type="email" autoComplete="email" required className="glass-control mt-2 min-h-14 w-full px-4" /></div>
      <div>
        <label htmlFor="signup-password" className="block font-bold">Senha</label>
        <input id="signup-password" name="password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={handlePasswordChange} className="glass-control mt-2 min-h-14 w-full px-4" />
        <div className="mt-2 flex items-center gap-2" aria-label={`Força da senha: ${passwordStrength} de 4`}>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-300 dark:bg-gray-700">
            <div className={`h-full ${passwordStrength === 0 ? "w-0" : passwordStrength === 1 ? "w-1/4 bg-red-600" : passwordStrength === 2 ? "w-2/4 bg-amber-600" : passwordStrength === 3 ? "w-3/4 bg-blue-600" : "w-full bg-green-700"}`} />
          </div>
          <span className="text-sm font-medium">{passwordStrength === 0 ? "" : passwordStrength === 1 ? "Fraca" : passwordStrength === 2 ? "Média" : passwordStrength === 3 ? "Boa" : "Forte"}</span>
        </div>
      </div>
      <div><label htmlFor="confirm-password" className="block font-bold">Confirme a senha</label><input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" required className="glass-control mt-2 min-h-14 w-full px-4" /></div>
      <fieldset>
        <legend className="font-bold">Celular preferido</legend>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <label className="glass-control flex min-h-12 items-center gap-3 rounded-xl px-4"><input type="radio" name="preferredOperatingSystem" value="ios" className="size-5" /> iPhone</label>
          <label className="glass-control flex min-h-12 items-center gap-3 rounded-xl px-4"><input type="radio" name="preferredOperatingSystem" value="android" defaultChecked className="size-5" /> Outro celular</label>
        </div>
      </fieldset>
      <button type="submit" disabled={submitting} className="primary-action min-h-14 w-full px-5 py-3 text-xl font-bold">{submitting ? "Criando conta…" : "Criar conta"}</button>
      <FormMessage message={message} type={success ? "success" : "error"} />
      <Link href="/entrar" className="block font-bold underline">Já tenho uma conta</Link>
    </form>
  );
}
