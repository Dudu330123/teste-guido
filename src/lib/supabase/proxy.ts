import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "@/lib/validation/env";

/** Atualiza os cookies SSR antes que páginas e APIs consultem a identidade. */
export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const config = getSupabaseConfig();
  if (!config.configured) return response;

  // Visitantes anônimos não possuem sessão para renovar. Evitar a chamada de
  // autenticação aqui mantém páginas públicas rápidas sem alterar a proteção
  // das rotas para quem já está conectado.
  const hasAuthCookie = request.cookies.getAll().some(({ name }) =>
    /^sb-.+-auth-token(?:\.\d+)?$/.test(name),
  );
  if (!hasAuthCookie) return response;

  const supabase = createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getClaims valida a assinatura; getSession sozinho não é prova de identidade.
  await supabase.auth.getClaims();
  return response;
}
