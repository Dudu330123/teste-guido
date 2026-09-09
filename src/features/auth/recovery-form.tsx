"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
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
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
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

  const handleDemoSend = (email: string) => {
    setDemoMenuOpen(false);
    setSuccess(true);
    setMessage(`✓ Pedido de recuperação enviado com sucesso para ${email}`);
  };

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
          setMessage("⚠️ A recuperação de senha não está configurada no ambiente. Configure as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY para ativar o recurso.");
          return;
        }
        setSubmitting(true);
        const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
        setSubmitting(false);
        setSuccess(!error);
        setMessage(
          error 
            ? "❌ Não foi possível alterar a senha. Verifique o link enviado por e-mail ou tente novamente." 
            : "✓ Senha alterada com sucesso! Você já pode entrar."
        );
      }}>
        <label htmlFor="new-password" className="block font-bold">Nova senha</label>
        <input id="new-password" name="password" type="password" autoComplete="new-password" required minLength={8} className="glass-control mt-2 min-h-14 w-full px-4" />
        <label htmlFor="confirm-new-password" className="mt-5 block font-bold">Confirme a nova senha</label>
        <input id="confirm-new-password" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} className="glass-control mt-2 min-h-14 w-full px-4" />
      <button type="submit" disabled={submitting} className="primary-action mt-7 min-h-14 w-full px-5 py-3 text-xl font-bold">
        {submitting ? "Salvando…" : "Salvar nova senha"}
      </button>

      <button
        type="button"
        ref={demoMenuButtonRef}
        onClick={() => setDemoMenuOpen(!demoMenuOpen)}
        aria-expanded={demoMenuOpen}
        aria-controls="demo-menu"
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
              <p className="text-sm text-[var(--muted)]">Selecione uma conta de teste para simular a recuperação</p>
            </div>

            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={() => handleDemoSend("demo@test.com")}
                className="w-full text-left p-4 rounded-2xl bg-white/50 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 transition-all border-2 border-transparent hover:border-blue-500"
              >
                <div className="font-bold text-lg">Conta de Teste 1</div>
                <div className="text-sm text-[var(--muted)]">demo@test.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSend("demo2@test.com")}
                className="w-full text-left p-4 rounded-2xl bg-white/50 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 transition-all border-2 border-transparent hover:border-blue-500"
              >
                <div className="font-bold text-lg">Conta de Teste 2</div>
                <div className="text-sm text-[var(--muted)]">demo2@test.com</div>
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
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setSuccess(false);
        setMessage("⚠️ A recuperação de senha não está configurada no ambiente. Configure as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY para ativar o recurso.");
        return;
      }
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/recuperar-senha?modo=nova-senha")}`;
        setSubmitting(true);
        const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo });
        setSubmitting(false);
        setSuccess(!error);
        setMessage(
          error 
            ? "❌ Não foi possível enviar o pedido de recuperação. Verifique sua conexão e tente novamente." 
            : "✓ Se houver uma conta com esse e-mail, você receberá as instruções de recuperação em breve."
        );
    }}>
      <label htmlFor="recovery-email" className="block font-bold">E-mail da conta</label>
      <input id="recovery-email" name="email" type="email" autoComplete="email" required className="glass-control mt-2 min-h-14 w-full px-4" />
      <button type="submit" disabled={submitting} className="primary-action mt-7 min-h-14 w-full px-5 py-3 text-xl font-bold">
        {submitting ? "Enviando…" : "Enviar instruções"}
      </button>

      <button
        type="button"
        ref={demoMenuButtonRef}
        onClick={() => setDemoMenuOpen(!demoMenuOpen)}
        aria-expanded={demoMenuOpen}
        aria-controls="demo-menu"
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
              <p className="text-sm text-[var(--muted)]">Selecione uma conta de teste para simular a recuperação</p>
            </div>

            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={() => handleDemoSend("demo@test.com")}
                className="w-full text-left p-4 rounded-2xl bg-white/50 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 transition-all border-2 border-transparent hover:border-blue-500"
              >
                <div className="font-bold text-lg">Conta de Teste 1</div>
                <div className="text-sm text-[var(--muted)]">demo@test.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSend("demo2@test.com")}
                className="w-full text-left p-4 rounded-2xl bg-white/50 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 transition-all border-2 border-transparent hover:border-blue-500"
              >
                <div className="font-bold text-lg">Conta de Teste 2</div>
                <div className="text-sm text-[var(--muted)]">demo2@test.com</div>
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
      <Link href="/entrar" className="mt-6 block font-bold underline hover:text-blue-600 transition-colors">Voltar para entrar</Link>
    </form>
  );
}
