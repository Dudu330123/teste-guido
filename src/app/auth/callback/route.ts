import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/** Impede que o callback seja usado para redirecionar a domínios externos. */
export function safeAuthReturnPath(value: string | null) {
  if (!value?.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  try {
    const parsed = new URL(value, "https://guido.local");
    const normalized = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    return parsed.origin === "https://guido.local" && normalized.startsWith("/") && !normalized.startsWith("//") && !normalized.includes("\\")
      ? normalized
      : "/";
  } catch {
    return "/";
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeAuthReturnPath(requestUrl.searchParams.get("next"));
  const supabase = await getSupabaseServerClient();

  if (!code || !supabase) {
    return NextResponse.redirect(new URL("/entrar?erro=callback", requestUrl.origin));
  }
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/entrar?erro=callback", requestUrl.origin));
  }
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
