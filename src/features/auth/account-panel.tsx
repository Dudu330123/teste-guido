"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { profileSchema } from "@/lib/validation/auth";
import { FormMessage } from "./form-message";
import type { AuthUser } from "@/lib/auth/types";

type LoadState = "loading" | "signed_out" | "ready";

export function AccountPanel() {
  const [state, setState] = useState<LoadState>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [preferredPlatform, setPreferredPlatform] = useState<"android" | "ios">("android");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      const response = await fetch("/api/account", { cache: "no-store" });
      if (!response.ok) {
        setState("signed_out");
        return;
      }
      const body = await response.json() as { data: { user: AuthUser; profile: { display_name: string; preferred_platform: "android" | "ios" | null } | null } };
      setUser(body.data.user);
      setDisplayName(body.data.profile?.display_name ?? body.data.user.displayName ?? "");
      setPreferredPlatform(body.data.profile?.preferred_platform === "ios" ? "ios" : "android");
      setState("ready");
    };

    void loadUserProfile().catch(() => setState("signed_out"));
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = profileSchema.safeParse({ displayName, preferredPlatform });
    if (!parsed.success || !user) {
      setSuccess(false);
      setMessage(parsed.error?.issues[0]?.message ?? "Não foi possível identificar sua conta.");
      return;
    }
    setSubmitting(true);
    const response = await fetch("/api/account", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    setSubmitting(false);
    setSuccess(response.ok);
    setMessage(response.ok ? "Preferências salvas." : "Não foi possível salvar agora.");
  }

  const confirmLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/entrar";
  };

  if (state === "loading") {
    return <p role="status" className="glass-panel rounded-3xl p-6 font-semibold">Carregando sua conta…</p>;
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
            <label className="glass-control flex min-h-12 flex-1 items-center gap-3 rounded-xl px-4"><input type="radio" name="platform" checked={preferredPlatform === "ios"} onChange={() => setPreferredPlatform("ios")} /> iPhone</label>
            <label className="glass-control flex min-h-12 flex-1 items-center gap-3 rounded-xl px-4"><input type="radio" name="platform" checked={preferredPlatform === "android"} onChange={() => setPreferredPlatform("android")} /> Android</label>
          </div>
        </fieldset>
        <button type="submit" disabled={submitting} className="primary-action min-h-14 w-full px-5 py-3 text-xl font-bold">
          {submitting ? "Salvando…" : "Salvar preferências"}
        </button>

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
          onClick={() => void confirmLogout()}
          className="secondary-action w-full px-4 py-3 text-base font-bold text-center hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sair da conta
        </button>
      </div>

      <p className="mt-7 border-t border-[var(--border)] pt-5 text-[var(--muted)]">O Guido não armazena dados bancários nesta conta.</p>
    </section>
  );
}
