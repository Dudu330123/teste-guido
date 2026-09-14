"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { profileSchema } from "@/lib/validation/auth";
import { getSupabaseConfig } from "@/lib/validation/env";
import { FormMessage } from "./form-message";

type LoadState = "loading" | "unconfigured" | "signed_out" | "ready";

export function AccountPanel() {
  const [state, setState] = useState<LoadState>(() => getSupabaseConfig().configured ? "loading" : "unconfigured");
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [preferredPlatform, setPreferredPlatform] = useState<"android" | "ios">("android");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    void (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) { setState("signed_out"); return; }
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, preferred_platform")
        .eq("id", data.user.id)
        .maybeSingle();
      setUser(data.user);
      setDisplayName(profile?.display_name ?? data.user.user_metadata.name ?? data.user.user_metadata.full_name ?? "");
      setPreferredPlatform(profile?.preferred_platform === "ios" ? "ios" : "android");
      setState("ready");
    })();
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
    // A RLS restringe esta atualização ao perfil do próprio usuário autenticado.
    const { error } = await supabase.from("profiles").update({
      display_name: parsed.data.displayName,
      preferred_platform: parsed.data.preferredPlatform,
    }).eq("id", user.id);
    setSubmitting(false);
    setSuccess(!error);
    setMessage(error ? "Não foi possível salvar agora." : "Preferências salvas.");
  }

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    window.location.href = "/entrar";
  }

  if (state === "loading") return <p role="status" className="glass-panel rounded-3xl p-6 font-semibold">Carregando sua conta…</p>;
  if (state === "unconfigured") return <section className="glass-panel rounded-3xl p-6 sm:p-8"><h1 className="text-4xl font-bold">Minha conta</h1><p className="mt-4">O login ainda não está configurado neste ambiente.</p></section>;
  if (state === "signed_out") return <section className="glass-panel rounded-3xl p-6 sm:p-8"><h1 className="text-4xl font-bold">Minha conta</h1><p className="mt-4">Entre para consultar suas preferências e seu progresso.</p><Link href="/entrar" className="primary-action mt-6 inline-flex min-h-12 items-center px-5 py-2 font-bold">Entrar</Link></section>;

  return (
    <section className="glass-panel rounded-3xl p-6 sm:p-8">
      <h1 className="text-4xl font-bold">Minha conta</h1>
      <p className="mt-3 text-[var(--muted)]">{user?.email}</p>
      <form className="mt-7 space-y-6" onSubmit={(event) => void saveProfile(event)}>
        <div><label htmlFor="profile-name" className="block font-bold">Como prefere ser chamado?</label><input id="profile-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required maxLength={100} autoComplete="name" className="glass-control mt-2 min-h-14 w-full px-4" /></div>
        <fieldset>
          <legend className="font-bold">Qual celular você usa?</legend>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <label className="glass-control flex min-h-12 flex-1 items-center gap-3 rounded-xl px-4"><input type="radio" name="platform" checked={preferredPlatform === "ios"} onChange={() => setPreferredPlatform("ios")} /> iPhone</label>
            <label className="glass-control flex min-h-12 flex-1 items-center gap-3 rounded-xl px-4"><input type="radio" name="platform" checked={preferredPlatform === "android"} onChange={() => setPreferredPlatform("android")} /> Outro celular</label>
          </div>
        </fieldset>
        <button type="submit" disabled={submitting} className="primary-action min-h-14 w-full px-5 py-3 text-xl font-bold">{submitting ? "Salvando…" : "Salvar preferências"}</button>
        <FormMessage message={message} type={success ? "success" : "error"} />
      </form>
      <button type="button" onClick={() => void signOut()} className="secondary-action mt-6 min-h-12 w-full px-4 py-3 font-bold">Sair da conta</button>
      <p className="mt-7 border-t border-[var(--border)] pt-5 text-[var(--muted)]">O Guido não armazena dados bancários nesta conta.</p>
    </section>
  );
}
