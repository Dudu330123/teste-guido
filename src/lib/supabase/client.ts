import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/validation/env";

let client: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.configured) return null;
  if (!client) client = createBrowserClient(config.url, config.publishableKey);
  return client;
}
