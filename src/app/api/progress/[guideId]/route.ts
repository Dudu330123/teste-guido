import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedSupabaseServerClient } from "@/lib/supabase/server";

const guideIdSchema = z.string().uuid();
const progressInputSchema = z.object({
  currentStep: z.number().int().min(0).max(499),
  status: z.enum(["not_started", "in_progress", "completed"]),
});

function parseGuideId(guideId: string) {
  const parsedGuideId = guideIdSchema.safeParse(guideId);
  return parsedGuideId.success ? parsedGuideId.data : null;
}

function progressResponse(row: {
  guide_version_id: string;
  current_step: number;
  status: "not_started" | "in_progress" | "completed";
  last_accessed_at: string;
  completed_at: string | null;
}) {
  return {
    data: {
      guideId: row.guide_version_id,
      currentStep: row.current_step,
      status: row.status,
      lastAccessedAt: row.last_accessed_at,
      completedAt: row.completed_at,
    },
  };
}

interface RouteContext {
  params: Promise<{ guideId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { guideId } = await context.params;
  const validGuideId = parseGuideId(guideId);
  if (!validGuideId) {
    return NextResponse.json({ error: { code: "invalid_request", message: "Guia inválido." } }, { status: 400 });
  }
  const authenticated = await getAuthenticatedSupabaseServerClient();
  if (!authenticated) {
    return NextResponse.json({ error: { code: "unauthorized", message: "Entre para sincronizar." } }, { status: 401 });
  }
  const { data, error } = await authenticated.supabase
    .from("user_progress")
    .select("guide_version_id, current_step, status, last_accessed_at, completed_at")
    .eq("user_id", authenticated.user.id)
    .eq("guide_version_id", validGuideId)
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: { code: "service_unavailable", message: "Não foi possível consultar agora." } }, { status: 503 });
  }
  if (!data) {
    return NextResponse.json({ error: { code: "not_found", message: "Progresso ainda não iniciado." } }, { status: 404 });
  }
  return NextResponse.json(progressResponse(data), { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request, context: RouteContext) {
  const { guideId } = await context.params;
  const validGuideId = parseGuideId(guideId);
  if (!validGuideId) {
    return NextResponse.json({ error: { code: "invalid_request", message: "Guia inválido." } }, { status: 400 });
  }
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
  const authenticated = await getAuthenticatedSupabaseServerClient();
  if (!authenticated) {
    return NextResponse.json({ error: { code: "unauthorized", message: "Entre para sincronizar." } }, { status: 401 });
  }

  // A etapa é validada contra o guia visível ao usuário antes do upsert. Isso
  // impede gravar índices arbitrários mesmo que o corpo da requisição seja manipulado.
  const { data: lastStep, error: stepError } = await authenticated.supabase
    .from("steps")
    .select("position")
    .eq("guide_version_id", validGuideId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (stepError) {
    return NextResponse.json({ error: { code: "service_unavailable", message: "Não foi possível validar o guia." } }, { status: 503 });
  }
  if (!lastStep) {
    return NextResponse.json({ error: { code: "not_found", message: "Guia não encontrado." } }, { status: 404 });
  }
  if (parsed.data.currentStep >= lastStep.position) {
    return NextResponse.json({ error: { code: "invalid_request", message: "Etapa fora do guia." } }, { status: 400 });
  }

  const now = new Date().toISOString();
  const { data, error } = await authenticated.supabase
    .from("user_progress")
    .upsert({
      user_id: authenticated.user.id,
      guide_version_id: validGuideId,
      current_step: parsed.data.currentStep,
      status: parsed.data.status,
      last_accessed_at: now,
      completed_at: parsed.data.status === "completed" ? now : null,
    }, { onConflict: "user_id,guide_version_id" })
    .select("guide_version_id, current_step, status, last_accessed_at, completed_at")
    .single();
  if (error || !data) {
    return NextResponse.json({ error: { code: "service_unavailable", message: "Não foi possível salvar agora." } }, { status: 503 });
  }
  return NextResponse.json(progressResponse(data), { headers: { "Cache-Control": "no-store" } });
}
