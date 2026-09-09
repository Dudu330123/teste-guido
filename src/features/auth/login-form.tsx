"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validation/auth";
import { FormMessage } from "./form-message";

export function LoginForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [useDemo, setUseDemo] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const demoMenuButtonRef = useRef<HTMLButtonElement>(null);
  const demoMenuCloseRef = useRef<HTMLButtonElement>(null);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    setEmailError(isValid ? "" : "Digite um e-mail válido");
  };

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

  const handleDemoTest = (email: string, password: string) => {
    setUseDemo(true);
    setDemoMenuOpen(false);
    
    setTimeout(() => {
      const emailInput = document.getElementById("email") as HTMLInputElement;
      const passwordInput = document.getElementById("password") as HTMLInputElement;
      if (emailInput && passwordInput) {
        emailInput.value = email;
        passwordInput.value = password;
      }
      
      const form = document.querySelector("form");
      form?.requestSubmit();
    }, 100);
  };

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

  return (
    <form className="mt-7" onSubmit={async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const email = form.get("email");
      const password = form.get("password");

      if (useDemo) {
        setSuccess(true);
        setMessage("Modo demonstração: Login simulado com sucesso!");
        setTimeout(() => {
          router.push("/conta");
          router.refresh();
        }, 1500);
        return;
      }

      const parsed = loginSchema.safeParse({ email, password });
      if (!parsed.success) {
        setSuccess(false);
        setMessage(parsed.error.issues[0]?.message ?? "Revise os dados informados.");
        return;
      }

      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setSuccess(false);
        setMessage("⚠️ A autenticação não está configurada no ambiente. Por favor, configure as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY no arquivo .env.local");
        return;
      }

      setSubmitting(true);
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      setSubmitting(false);
      setSuccess(!error);
      setMessage(
        error 
          ? "❌ Não foi possível entrar. Verifique seu e-mail e senha, ou tente o modo demonstração." 
          : "✓ Entrada realizada com sucesso!"
      );
      if (!error) {
        router.push("/conta");
        router.refresh();
      }
    }}>
      <label htmlFor="email" className="block font-bold mb-2">E-mail</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={handleEmailChange}
        placeholder="seu@email.com"
        className={`glass-control mt-2 min-h-14 w-full px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${emailError ? "border-red-500" : ""}`}
      />
      {emailError && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{emailError}</p>
      )}

      <label htmlFor="password" className="mt-5 block font-bold mb-2">Senha</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        minLength={8}
        placeholder="••••••••"
        className="glass-control mt-2 min-h-14 w-full px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />

      <div className="mt-4 flex items-start gap-2">
        <input 
          id="use-demo" 
          type="checkbox" 
          checked={useDemo}
          onChange={(e) => setUseDemo(e.target.checked)}
          className="mt-1 w-4 h-4 cursor-pointer accent-blue-600"
        />
        <label htmlFor="use-demo" className="text-sm font-medium cursor-pointer select-none">
          Testar em modo demonstração (sem Supabase)
        </label>
      </div>

      <button 
        type="submit" 
        disabled={submitting} 
        className="primary-action mt-7 min-h-14 w-full px-5 py-3 text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-[0.98] transition-all"
      >
        {submitting ? "🔐 Entrando..." : "Entrar"}
      </button>

      <button
        type="button"
        ref={demoMenuButtonRef}
        onClick={() => setDemoMenuOpen(!demoMenuOpen)}
        aria-expanded={demoMenuOpen}
        aria-controls="demo-menu"
        className="secondary-action w-full px-4 py-3 text-base font-bold text-center hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all flex items-center justify-center gap-2"
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
              <p className="text-sm text-[var(--muted)]">Selecione uma conta de teste para simular o login sem Supabase</p>
            </div>

            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={() => handleDemoTest("demo@test.com", "12345678")}
                className="w-full text-left p-4 rounded-2xl bg-white/50 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 transition-all border-2 border-transparent hover:border-blue-500"
              >
                <div className="font-bold text-lg">Conta de Teste 1</div>
                <div className="text-sm text-[var(--muted)]">demo@test.com / 12345678</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoTest("demo2@test.com", "12345678")}
                className="w-full text-left p-4 rounded-2xl bg-white/50 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 transition-all border-2 border-transparent hover:border-blue-500"
              >
                <div className="font-bold text-lg">Conta de Teste 2</div>
                <div className="text-sm text-[var(--muted)]">demo2@test.com / 12345678</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoTest("demo3@test.com", "12345678")}
                className="w-full text-left p-4 rounded-2xl bg-white/50 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 transition-all border-2 border-transparent hover:border-blue-500"
              >
                <div className="font-bold text-lg">Conta de Teste 3</div>
                <div className="text-sm text-[var(--muted)]">demo3@test.com / 12345678</div>
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

      <div className="mt-6 flex flex-col gap-3 pt-4 border-t border-gray-300/20">
        <Link
          href="/recuperar-senha"
          className="inline-flex items-center justify-center gap-2 font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors px-5 py-3 rounded-xl min-h-12"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Esqueci minha senha
        </Link>
        <Link
          href="/cadastro"
          className="inline-flex items-center justify-center gap-2 font-bold text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors px-5 py-3 rounded-xl min-h-12"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Criar uma conta nova
        </Link>
      </div>
    </form>
  );
}
