import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const guideIdSchema = z.string().regex(/^[a-zA-Z0-9-]{1,100}$/);
const progressInputSchema = z.object({
  currentStep: z.number().int().min(0).max(499),
  status: z.enum(["not_started", "in_progress", "completed"]),
});

function getBackendUrl() {
  const value = process.env.GUIDO_API_URL;
  if (!value) return null;
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

async function getAccessToken() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session?.access_token ?? null;
}

async function proxyProgress(
  guideId: string,
  method: "GET" | "PUT",
  body?: z.infer<typeof progressInputSchema>,
) {
  // Este endpoint funciona como BFF: recupera a sessão em cookie no servidor e
  // encaminha ao C++ somente o bearer token necessário para esta requisição.
  const parsedGuideId = guideIdSchema.safeParse(guideId);
  if (!parsedGuideId.success) {
    return NextResponse.json({ error: { code: "invalid_request", message: "Guia inválido." } }, { status: 400 });
  }
  const backendUrl = getBackendUrl();
  if (!backendUrl) {
    return NextResponse.json({ error: { code: "service_unavailable", message: "API não configurada." } }, { status: 503 });
  }
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: { code: "unauthorized", message: "Entre para sincronizar." } }, { status: 401 });
  }

  const endpoint = new URL(`/api/v1/me/progress/${encodeURIComponent(parsedGuideId.data)}`, backendUrl);
  try {
    const response = await fetch(endpoint, {
      method,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(4_000),
    });
    // Mantemos status e envelope produzidos pelo backend, mas reconstruímos os
    // headers para não repassar cabeçalhos inesperados do serviço interno.
    const responseBody = await response.text();
    return new NextResponse(responseBody, {
      status: response.status,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: { code: "service_unavailable", message: "Não foi possível sincronizar agora." } },
      { status: 503 },
    );
  }
}

interface RouteContext {
  params: Promise<{ guideId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { guideId } = await context.params;
  return proxyProgress(guideId, "GET");
}

export async function PUT(request: Request, context: RouteContext) {
  const { guideId } = await context.params;
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: { code: "invalid_request", message: "JSON inválido." } }, { status: 400 });
  }
  const parsed = progressInputSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "invalid_request", message: "Progresso inválido." } },
      { status: 400 },
    );
  }
  return proxyProgress(guideId, "PUT", parsed.data);
}
