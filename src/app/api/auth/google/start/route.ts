import { NextResponse } from "next/server";
import { createGoogleAuthorizationUrl } from "@/lib/auth/google";
import { safeNextPath } from "@/lib/auth/http";
import { AuthError } from "@/lib/auth/types";

export async function GET(request: Request) {
  try {
    const next = safeNextPath(new URL(request.url).searchParams.get("next"));
    return NextResponse.redirect(await createGoogleAuthorizationUrl(next));
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.redirect(new URL(`/entrar?erro=${encodeURIComponent(error.code)}`, request.url));
    }
    console.error("Google OAuth start failed", error instanceof Error ? error.name : "unknown_error");
    return NextResponse.redirect(new URL("/entrar?erro=google", request.url));
  }
}
