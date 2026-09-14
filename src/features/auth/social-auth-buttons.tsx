"use client";

import { useState } from "react";
import type { Provider } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
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
