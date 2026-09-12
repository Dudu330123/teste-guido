"use client";

import Link from "next/link";
import { useState } from "react";
import { signUpSchema } from "@/lib/validation/auth";
import { getSignupErrorMessage } from "./auth-error-message";
import { FormMessage } from "./form-message";

export function SignupForm() {
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  const checkStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordStrength(checkStrength(value));
  };

  return (
    <form className="mt-7 space-y-5" onSubmit={async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const parsed = signUpSchema.safeParse({
        name: form.get("name"), email: form.get("email"), password: form.get("password"),
        confirmPassword: form.get("confirmPassword"), preferredOperatingSystem: form.get("preferredOperatingSystem"),
      });
      if (!parsed.success) { setSuccess(false); setMessage(parsed.error.issues[0]?.message ?? "Revise os dados informados."); return; }
      const { name, email, password, preferredOperatingSystem } = parsed.data;
      setSubmitting(true);
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, password, preferredPlatform: preferredOperatingSystem }),
      });
      const body = await response.json() as { error?: { code?: string; status?: number; message?: string } };
      setSubmitting(false);
      setSuccess(response.ok);
      setMessage(response.ok ? "✓ Cadastro recebido com sucesso! Verifique seu e-mail para confirmar sua conta." : getSignupErrorMessage(body.error ?? {}));
    }}>
      <div><label htmlFor="name" className="block font-bold">Nome</label><input id="name" name="name" autoComplete="name" required className="glass-control mt-2 min-h-14 w-full px-4" /></div>
      <div><label htmlFor="signup-email" className="block font-bold">E-mail</label><input id="signup-email" name="email" type="email" autoComplete="email" required className="glass-control mt-2 min-h-14 w-full px-4" /></div>
      <div>
        <label htmlFor="signup-password" className="block font-bold mb-2">Senha</label>
        <input id="signup-password" name="password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={handlePasswordChange} className="glass-control mt-2 min-h-14 w-full px-4" />
        <div className="mt-2 flex items-center gap-2">
          <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${passwordStrength === 0 ? 'w-0 bg-gray-400' : passwordStrength <= 1 ? 'w-1/4 bg-red-500' : passwordStrength === 2 ? 'w-2/4 bg-yellow-500' : passwordStrength === 3 ? 'w-3/4 bg-blue-500' : 'w-full bg-green-500'}`}
            />
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {passwordStrength === 0 ? '' : passwordStrength <= 1 ? 'Fraca' : passwordStrength === 2 ? 'Média' : passwordStrength === 3 ? 'Bom' : 'Forte'}
          </span>
        </div>
      </div>
      <div><label htmlFor="confirm-password" className="block font-bold">Confirme a senha</label><input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" required className="glass-control mt-2 min-h-14 w-full px-4" /></div>
      <fieldset>
        <legend className="font-bold">Celular preferido</legend>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <label className="glass-control flex min-h-12 items-center gap-3 rounded-xl px-4"><input type="radio" name="preferredOperatingSystem" value="ios" className="size-5" /> iPhone</label>
          <label className="glass-control flex min-h-12 items-center gap-3 rounded-xl px-4"><input type="radio" name="preferredOperatingSystem" value="android" defaultChecked className="size-5" /> Android</label>
        </div>
      </fieldset>
      <button type="submit" disabled={submitting} className="primary-action min-h-14 w-full px-5 py-3 text-xl font-bold">
        {submitting ? "Criando conta…" : "Criar conta"}
      </button>

      <FormMessage message={message} type={success ? "success" : "error"} />
      <Link href="/entrar" className="block font-bold underline mt-4 hover:text-green-600 transition-colors">Já tenho uma conta</Link>
    </form>
  );
}
