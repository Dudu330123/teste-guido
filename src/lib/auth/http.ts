import { NextResponse } from "next/server";
import { AuthError } from "./types";

export function authErrorResponse(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status });
  }
  console.error("Authentication request failed", error instanceof Error ? error.name : "unknown_error");
  return NextResponse.json({ error: { code: "service_unavailable", message: "Não foi possível concluir a operação agora." } }, { status: 503 });
}

export function safeNextPath(value: unknown) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/conta";
}
