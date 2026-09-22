import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/validation/env";

/**
 * Cliente anônimo para conteúdo público. Ele não lê cookies nem mantém sessão,
 * permitindo que o Next reutilize consultas editoriais sem misturar usuários.
 */
export function getSupabasePublicClient() {
  const config = getSupabaseConfig();
  if (!config.configured) return null;
  return createClient(config.url, config.publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
