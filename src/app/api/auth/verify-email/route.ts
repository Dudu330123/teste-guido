import { NextResponse } from "next/server";
import { verifyEmail } from "@/lib/auth/service";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  try {
    await verifyEmail(token);
    return NextResponse.redirect(new URL("/entrar?verificado=1", request.url));
  } catch {
    return NextResponse.redirect(new URL("/entrar?erro=verificacao", request.url));
  }
}
