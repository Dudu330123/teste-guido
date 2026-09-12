import { NextResponse } from "next/server";
import { exchangeGoogleCode } from "@/lib/auth/google";
import { safeNextPath } from "@/lib/auth/http";
import { resolveGoogleIdentity } from "@/lib/auth/service";
import { createSession } from "@/lib/auth/session";
import { AuthError } from "@/lib/auth/types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return NextResponse.redirect(new URL("/entrar?erro=google", request.url));
  try {
    const identity = await exchangeGoogleCode(code, state);
    const user = await resolveGoogleIdentity(identity);
    await createSession(user.id);
    return NextResponse.redirect(new URL(safeNextPath(identity.next), request.url));
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.redirect(new URL(`/entrar?erro=${encodeURIComponent(error.code)}`, request.url));
    console.error("Google OAuth callback failed", error instanceof Error ? error.name : "unknown_error");
    return NextResponse.redirect(new URL("/entrar?erro=google", request.url));
  }
}
