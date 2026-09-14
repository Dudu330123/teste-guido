import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { query, withTransaction } from "@/lib/db/client";

const guideIdSchema = z.string().uuid();
const progressInputSchema = z.object({ currentStep: z.number().int().min(0).max(499), status: z.enum(["not_started", "in_progress", "completed"]) });

function response(row: { guide_version_id: string; current_step: number; status: "not_started" | "in_progress" | "completed"; last_accessed_at: Date; completed_at: Date | null }) {
  return { data: { guideId: row.guide_version_id, currentStep: row.current_step, status: row.status, lastAccessedAt: new Date(row.last_accessed_at).toISOString(), completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : null } };
}

interface RouteContext { params: Promise<{ guideId: string }> }

export async function GET(_request: Request, context: RouteContext) {
  const parsedId = guideIdSchema.safeParse((await context.params).guideId);
  if (!parsedId.success) return NextResponse.json({ error: { code: "invalid_request", message: "Guia inválido." } }, { status: 400 });
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: { code: "unauthorized", message: "Entre para sincronizar." } }, { status: 401 });
    const result = await query<{ guide_version_id: string; current_step: number; status: "not_started" | "in_progress" | "completed"; last_accessed_at: Date; completed_at: Date | null }>(
      "select guide_version_id, current_step, status, last_accessed_at, completed_at from user_progress where user_id = $1 and guide_version_id = $2",
      [user.id, parsedId.data],
    );
    const row = result.rows[0];
    if (!row) return NextResponse.json({ error: { code: "not_found", message: "Progresso ainda não iniciado." } }, { status: 404 });
    return NextResponse.json(response(row), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Progress lookup failed", error instanceof Error ? error.name : "unknown_error");
    return NextResponse.json({ error: { code: "service_unavailable", message: "Não foi possível consultar agora." } }, { status: 503 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const parsedId = guideIdSchema.safeParse((await context.params).guideId);
  if (!parsedId.success) return NextResponse.json({ error: { code: "invalid_request", message: "Guia inválido." } }, { status: 400 });
  let input: unknown;
  try { input = await request.json(); } catch { return NextResponse.json({ error: { code: "invalid_request", message: "JSON inválido." } }, { status: 400 }); }
  const parsedInput = progressInputSchema.safeParse(input);
  if (!parsedInput.success) return NextResponse.json({ error: { code: "invalid_request", message: "Progresso inválido." } }, { status: 400 });
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: { code: "unauthorized", message: "Entre para sincronizar." } }, { status: 401 });
    const lastStep = await query<{ position: number }>("select position from steps where guide_version_id = $1 order by position desc limit 1", [parsedId.data]);
    if (!lastStep.rows[0]) return NextResponse.json({ error: { code: "not_found", message: "Guia não encontrado." } }, { status: 404 });
    if (parsedInput.data.currentStep >= lastStep.rows[0].position) return NextResponse.json({ error: { code: "invalid_request", message: "Etapa fora do guia." } }, { status: 400 });
    const result = await withTransaction(async (client) => {
      const saved = await client.query<{ guide_version_id: string; current_step: number; status: "not_started" | "in_progress" | "completed"; last_accessed_at: Date; completed_at: Date | null }>(
        `insert into user_progress (user_id, guide_version_id, current_step, status, last_accessed_at, completed_at)
         values ($1, $2, $3, $4, now(), case when $4 = 'completed' then now() else null end)
         on conflict (user_id, guide_version_id) do update set current_step = excluded.current_step, status = excluded.status,
           last_accessed_at = excluded.last_accessed_at, completed_at = excluded.completed_at
         returning guide_version_id, current_step, status, last_accessed_at, completed_at`,
        [user.id, parsedId.data, parsedInput.data.currentStep, parsedInput.data.status],
      );
      return saved.rows[0];
    });
    return NextResponse.json(response(result), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Progress save failed", error instanceof Error ? error.name : "unknown_error");
    return NextResponse.json({ error: { code: "service_unavailable", message: "Não foi possível salvar agora." } }, { status: 503 });
  }
}
