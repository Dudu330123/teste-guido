import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

export type SupabaseConfig =
  | { configured: true; url: string; publishableKey: string }
  | { configured: false; message: string };

export function getSupabaseConfig(): SupabaseConfig {
  // Novos projetos usam sb_publishable_*. A variável antiga permanece como
  // fallback temporário para instalações existentes durante a transição oficial.
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const result = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey,
  });

  if (!result.success) {
    return {
      configured: false,
      message: "A autenticação ainda não foi configurada neste ambiente.",
    };
  }

  return {
    configured: true,
    url: result.data.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: result.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}
