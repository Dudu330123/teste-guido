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

/** Usa marcas vetoriais leves sem adicionar uma biblioteca apenas para dois ícones. */
function SocialProviderIcon({ provider }: { provider: SocialProvider }) {
  if (provider === "google") {
    return (
      <svg aria-hidden="true" className="social-auth-provider-icon" data-provider-icon="google" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.7 4.7 0 0 1-2 3v2.6h3.3c1.9-1.8 2.9-4.4 2.9-7.5Z" />
        <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.3l-3.3-2.6c-.9.6-2.1 1-3.4 1a5.9 5.9 0 0 1-5.6-4.1H3v2.6A10 10 0 0 0 12 22Z" />
        <path fill="#FBBC05" d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3a10 10 0 0 0 0 9.1L6.4 14Z" />
        <path fill="#EA4335" d="M12 5.9c1.5 0 2.9.5 3.9 1.5l2.9-2.9A9.8 9.8 0 0 0 12 2a10 10 0 0 0-9 5.5l3.4 2.6A5.9 5.9 0 0 1 12 5.9Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="social-auth-provider-icon social-auth-provider-icon--apple" data-provider-icon="apple" viewBox="0 0 24 24">
      <path fill="currentColor" d="M16.8 12.7c0-2.6 2.2-3.9 2.3-4a5 5 0 0 0-4-2.2c-1.7-.2-3.3 1-4.1 1-.8 0-2.1-1-3.5-.9a5.2 5.2 0 0 0-4.4 2.7c-1.9 3.2-.5 8 1.3 10.7.9 1.3 2 2.8 3.4 2.7 1.3-.1 1.9-.9 3.5-.9s2.1.9 3.5.8c1.5 0 2.4-1.3 3.3-2.6a11.7 11.7 0 0 0 1.5-3.1 4.6 4.6 0 0 1-2.8-4.2Zm-2.7-8a4.7 4.7 0 0 0 1.1-3.4 4.8 4.8 0 0 0-3.1 1.6A4.4 4.4 0 0 0 11 6.2a4 4 0 0 0 3.1-1.5Z" />
    </svg>
  );
}

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
          <SocialProviderIcon provider={provider.id} />
          {loadingProvider === provider.id ? "Abrindo…" : provider.label}
        </button>
      ))}
      <FormMessage message={message} type="error" />
    </div>
  );
}
