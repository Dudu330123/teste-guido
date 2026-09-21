import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { safeAuthReturnPath } from "@/lib/validation/auth-return-path";

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
