"use client";

import { useState } from "react";
import type { Provider } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseConfig } from "@/lib/validation/env";
import { FormMessage } from "./form-message";

type SocialProvider = Extract<Provider, "google" | "apple">;

const providers: ReadonlyArray<{ id: SocialProvider; label: string }> = [
  { id: "google", label: "Continuar com Google" },
  { id: "apple", label: "Continuar com Apple" },
];

interface SocialAuthButtonsProps {
  disabled?: boolean;
  next?: string;
}

async function isProviderEnabled(provider: SocialProvider) {
  const config = getSupabaseConfig();
  if (!config.configured) return false;
  const response = await fetch(`${config.url}/auth/v1/settings`, {
    headers: { apikey: config.publishableKey },
    cache: "no-store",
  });
  if (!response.ok) return false;
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object") return false;
  const external = Reflect.get(payload, "external");
  return Boolean(external && typeof external === "object" && Reflect.get(external, provider) === true);
}

/**
 * Inicia OAuth pelo Supabase, que atua somente como infraestrutura de identidade.
 * O usuário continua entrando com a conta Google ou Apple que já possui.
 */
export function SocialAuthButtons({ disabled = false, next = "/conta" }: SocialAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);
  const [message, setMessage] = useState("");

  async function signIn(provider: SocialProvider) {
    if (disabled || loadingProvider) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("A entrada social ainda não está configurada neste ambiente.");
      return;
    }

    setMessage("");
    setLoadingProvider(provider);
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    try {
      if (!await isProviderEnabled(provider)) {
        setLoadingProvider(null);
        setMessage(`${provider === "google" ? "Google" : "Apple"} ainda não foi ativado para o Guido. Use e-mail e senha por enquanto.`);
        return;
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams: provider === "google" ? { prompt: "select_account" } : undefined,
        },
      });
      if (!error) return;
      setLoadingProvider(null);
      setMessage(`Não foi possível entrar com ${provider === "google" ? "Google" : "Apple"}. Tente novamente ou use seu e-mail.`);
    } catch {
      setLoadingProvider(null);
      setMessage("Não foi possível conectar ao Guido. Verifique sua conexão e tente novamente.");
    }
  }

  return (
    <div className="space-y-3">
      {providers.map((provider) => (
        <button
          key={provider.id}
          type="button"
          disabled={disabled || Boolean(loadingProvider)}
          aria-busy={loadingProvider === provider.id}
          className="secondary-action flex min-h-14 w-full items-center justify-center gap-3 px-5 py-3 text-lg font-bold disabled:cursor-wait disabled:opacity-60"
          onClick={() => void signIn(provider.id)}
        >
          <span aria-hidden="true" className="inline-flex size-7 items-center justify-center rounded-full border border-current font-bold">
            {provider.id === "google" ? "G" : "A"}
          </span>
          {loadingProvider === provider.id ? "Abrindo…" : provider.label}
        </button>
      ))}
      <FormMessage message={message} type="error" />
    </div>
  );
}
