import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedSupabaseServerClient } from "@/lib/supabase/server";

const historyRowSchema = z.object({
  guide_version_id: z.string().uuid(),
  current_step: z.number().int().min(0).max(499),
  status: z.enum(["not_started", "in_progress", "completed"]),
  last_accessed_at: z.string().datetime(),
  guide_versions: z.object({
    platform: z.enum(["android", "ios"]),
    guide_version: z.string().min(1),
    tutorials: z.object({
      slug: z.string().min(1),
      title: z.string().min(1),
      applications: z.object({ name: z.string().min(1) }),
    }),
  }),
});

export async function GET() {
  const authenticated = await getAuthenticatedSupabaseServerClient();
  if (!authenticated) {
    return NextResponse.json({ error: { code: "unauthorized", message: "Entre para consultar o histórico." } }, { status: 401 });
  }

  const { data, error } = await authenticated.supabase
    .from("user_progress")
    .select(`
      guide_version_id, current_step, status, last_accessed_at,
      guide_versions!inner(
        platform, guide_version,
        tutorials!inner(slug, title, applications!inner(name))
      )
    `)
    .eq("user_id", authenticated.user.id)
    .order("last_accessed_at", { ascending: false })
    .limit(50);
  if (error) {
    return NextResponse.json({ error: { code: "service_unavailable", message: "Não foi possível carregar o histórico." } }, { status: 503 });
  }

  const parsed = z.array(historyRowSchema).safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "invalid_response", message: "O histórico recebido é inválido." } }, { status: 502 });
  }
  return NextResponse.json({
    data: parsed.data.map((row) => ({
      guideId: row.guide_version_id,
      currentStep: row.current_step,
      status: row.status,
      lastAccessedAt: row.last_accessed_at,
      guideVersion: row.guide_versions.guide_version,
      operatingSystem: row.guide_versions.platform,
      taskSlug: row.guide_versions.tutorials.slug,
      taskTitle: row.guide_versions.tutorials.title,
      applicationName: row.guide_versions.tutorials.applications.name,
    })),
  }, { headers: { "Cache-Control": "no-store" } });
}
