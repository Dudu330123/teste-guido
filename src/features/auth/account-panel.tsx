"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { profileSchema } from "@/lib/validation/auth";
import { getSupabaseConfig } from "@/lib/validation/env";
import { FormMessage } from "./form-message";

type LoadState = "loading" | "unconfigured" | "signed_out" | "ready";

export function AccountPanel() {
  const [state, setState] = useState<LoadState>(() =>
    getSupabaseConfig().configured ? "loading" : "unconfigured",
  );
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [preferredPlatform, setPreferredPlatform] = useState<"android" | "ios">("android");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState("");
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const demoMenuButtonRef = useRef<HTMLButtonElement>(null);
  const demoMenuCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const loadUserProfile = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        setState("signed_out");
        return;
      }
      setUser(data.user);
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, preferred_platform")
        .eq("id", data.user.id)
        .maybeSingle();
      setDisplayName(profile?.display_name ?? data.user.user_metadata.name ?? "");
      setPreferredPlatform(profile?.preferred_platform === "ios" ? "ios" : "android");
      setState("ready");
    };

    loadUserProfile();
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    void supabase.auth.getUser().then(async ({ data, error }) => {
      if (error || !data.user) {
        setState("signed_out");
        return;
      }
      setUser(data.user);
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, preferred_platform")
        .eq("id", data.user.id)
        .maybeSingle();
      setDisplayName(profile?.display_name ?? data.user.user_metadata.name ?? "");
      setPreferredPlatform(profile?.preferred_platform === "ios" ? "ios" : "android");
      setState("ready");
    });
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = profileSchema.safeParse({ displayName, preferredPlatform });
    if (!parsed.success || !user) {
      setSuccess(false);
      setMessage(parsed.error?.issues[0]?.message ?? "Não foi possível identificar sua conta.");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setSubmitting(true);
    // A política RLS restringe a atualização ao próprio id autenticado. Não
    // enviamos e-mail, senha ou qualquer dado financeiro para a tabela profiles.
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: parsed.data.displayName,
        preferred_platform: parsed.data.preferredPlatform,
      })
      .eq("id", user.id);
    setSubmitting(false);
    setSuccess(!error);
    setMessage(error ? "Não foi possível salvar agora." : "Preferências salvas.");
  }

  const confirmLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
      window.location.href = "/entrar";
    }
  };

  if (state === "loading") {
    return <p role="status" className="glass-panel rounded-3xl p-6 font-semibold">Carregando sua conta…</p>;
  }
  if (state === "unconfigured") {
    return (
      <section className="glass-panel rounded-3xl p-6 sm:p-8">
        <h1 className="text-4xl font-bold">Minha conta</h1>
        <p className="mt-4">Esta tela está pronta e será ativada quando conectarmos o Supabase.</p>
        <Link href="/entrar" className="secondary-action mt-6 inline-flex min-h-12 items-center px-4 py-2 font-bold">Voltar para entrar</Link>
      </section>
    );
  }
  if (state === "signed_out") {
    return (
      <section className="glass-panel rounded-3xl p-6 sm:p-8">
        <h1 className="text-4xl font-bold">Minha conta</h1>
        <p className="mt-4">Entre para consultar suas preferências e seu progresso.</p>
        <Link href="/entrar" className="primary-action mt-6 inline-flex min-h-12 items-center px-5 py-2 font-bold">Entrar</Link>
      </section>
    );
  }

  return (
    <section className="glass-panel rounded-3xl p-6 sm:p-8">
      <h1 className="text-4xl font-bold">Minha conta</h1>
      <p className="mt-3 text-[var(--muted)]">{user?.email}</p>
      <form className="mt-7 space-y-6" onSubmit={saveProfile}>
        <div>
          <label htmlFor="profile-name" className="block font-bold">Como prefere ser chamado?</label>
          <input id="profile-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required maxLength={100} autoComplete="name" className="glass-control mt-2 min-h-14 w-full px-4" />
        </div>
        <fieldset>
          <legend className="font-bold">Qual celular você usa?</legend>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <label className="glass-control flex min-h-12 flex-1 items-center gap-3 rounded-xl px-4"><input type="radio" name="platform" checked={preferredPlatform === "ios"} onChange={() => setPreferredPlatform("ios")} className="size-5" /> iPhone</label>
            <label className="glass-control flex min-h-12 flex-1 items-center gap-3 rounded-xl px-4"><input type="radio" name="platform" checked={preferredPlatform === "android"} onChange={() => setPreferredPlatform("android")} className="size-5" /> Outro</label>
          </div>
        </fieldset>
        <button type="submit" disabled={submitting} className="primary-action min-h-14 w-full px-5 py-3 text-xl font-bold">
          {submitting ? "Salvando…" : "Salvar preferências"}
        </button>

        <button
          type="button"
          ref={demoMenuButtonRef}
          onClick={() => setDemoMenuOpen(!demoMenuOpen)}
          aria-expanded={demoMenuOpen}
          aria-controls="demo-menu"
          className="secondary-action w-full mt-4 px-4 py-3 text-base font-bold text-center hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all flex items-center justify-center gap-2"
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
                <p className="text-sm text-[var(--muted)]">Esta conta de teste não está conectada ao Supabase</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="p-4 rounded-2xl bg-white/50 dark:bg-white/10">
                  <div className="font-bold text-lg">Conta de Teste 1</div>
                  <div className="text-sm text-[var(--muted)]">demo@test.com / 12345678</div>
                </div>

                <div className="p-4 rounded-2xl bg-white/50 dark:bg-white/10">
                  <div className="font-bold text-lg">Conta de Teste 2</div>
                  <div className="text-sm text-[var(--muted)]">demo2@test.com / 12345678</div>
                </div>

                <div className="p-4 rounded-2xl bg-white/50 dark:bg-white/10">
                  <div className="font-bold text-lg">Conta de Teste 3</div>
                  <div className="text-sm text-[var(--muted)]">demo3@test.com / 12345678</div>
                </div>
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

        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="presentation">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="logout-confirm-title"
              className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8 text-[var(--foreground)]"
            >
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 id="logout-confirm-title" className="text-2xl font-bold mb-2">Sair da conta?</h2>
                <p className="text-sm text-[var(--muted)]">Seu progresso atual não será salvo automaticamente.</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="secondary-action flex-1 px-5 py-3 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmLogout}
                  className="primary-action flex-1 px-5 py-3 font-bold"
                >
                  Sim, sair
                </button>
              </div>
            </section>
          </div>
        )}

        <FormMessage message={message} type={success ? "success" : "error"} />
      </form>

      <div className="mt-6 flex flex-col gap-2">
        <button
          onClick={() => {
            const supabase = getSupabaseBrowserClient();
            if (supabase) {
              supabase.auth.signOut().then(() => {
                window.location.href = "/entrar";
              });
            }
          }}
          className="secondary-action w-full px-4 py-3 text-base font-bold text-center hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sair da conta
        </button>
      </div>

      <p className="mt-7 border-t border-[var(--border)] pt-5 text-[var(--muted)]">O Guido não armazena dados bancários nesta conta.</p>
      {logoutMessage && (
        <p className="mt-2 text-center font-semibold text-green-600 dark:text-green-400">
          {logoutMessage}
        </p>
      )}
    </section>
  );
}
