"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { signUpSchema } from "@/lib/validation/auth";
import { getSignupErrorMessage } from "./auth-error-message";
import { FormMessage } from "./form-message";

export function SignupForm() {
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const demoMenuButtonRef = useRef<HTMLButtonElement>(null);
  const demoMenuCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!demoMenuOpen) return;
    demoMenuCloseRef.current?.focus();

    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDemoMenuOpen(false);
        demoMenuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [demoMenuOpen]);

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

  const handleDemoSignup = (email: string) => {
    setDemoMenuOpen(false);
    setSubmitting(true);
    setMessage("⏳ Criando conta...");

    setTimeout(() => {
      setSuccess(true);
      setMessage(`✓ Cadastro simulado com sucesso! Verifique seu e-mail (${email}) para continuar.`);
      setSubmitting(false);
    }, 2000);
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
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setSuccess(false);
        setMessage("⚠️ O cadastro não está configurado no ambiente. Configure as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY para ativar o recurso. A aplicação está pronta, mas você precisa conectar o Supabase.");
        return;
      }
      const { name, email, password, preferredOperatingSystem } = parsed.data;
      setSubmitting(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, preferred_operating_system: preferredOperatingSystem },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/conta")}`,
        },
      });
      setSubmitting(false);
      setSuccess(!error);
      setMessage(
        error 
          ? getSignupErrorMessage(error) 
          : "✓ Cadastro recebido com sucesso! Verifique seu e-mail para confirmar sua conta."
      );
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

      <button
        type="button"
        ref={demoMenuButtonRef}
        onClick={() => setDemoMenuOpen(!demoMenuOpen)}
        aria-expanded={demoMenuOpen}
        aria-controls="demo-menu"
        disabled={submitting}
        className="secondary-action w-full mt-6 px-4 py-3 text-base font-bold text-center hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Testar em modo demonstração (sem Supabase)
      </button>

      {demoMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-menu-title"
            className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8 text-[var(--foreground)]"
          >
            <div className="text-center mb-6">
              <h2 id="demo-menu-title" className="text-2xl font-bold mb-2">🧪 Modo Demonstração</h2>
              <p className="text-sm text-[var(--muted)]">Selecione uma conta de teste para simular o cadastro</p>
            </div>

            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={() => handleDemoSignup("demo@test.com")}
                className="w-full text-left p-4 rounded-2xl bg-white/50 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 transition-all border-2 border-transparent hover:border-blue-500 cursor-pointer"
              >
                <div className="font-bold text-lg">Conta de Teste 1</div>
                <div className="text-sm text-[var(--muted)]">demo@test.com / 12345678</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSignup("demo2@test.com")}
                className="w-full text-left p-4 rounded-2xl bg-white/50 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 transition-all border-2 border-transparent hover:border-blue-500 cursor-pointer"
              >
                <div className="font-bold text-lg">Conta de Teste 2</div>
                <div className="text-sm text-[var(--muted)]">demo2@test.com / 12345678</div>
              </button>
            </div>

            <button
              ref={demoMenuCloseRef}
              type="button"
              onClick={() => setDemoMenuOpen(false)}
              className="primary-action w-full min-h-12 px-5 py-3 font-bold rounded-xl text-lg"
            >
              Fechar
            </button>
          </section>
        </div>
      )}

      <FormMessage message={message} type={success ? "success" : "error"} />
      <Link href="/entrar" className="block font-bold underline mt-4 hover:text-green-600 transition-colors">Já tenho uma conta</Link>
    </form>
  );
}
