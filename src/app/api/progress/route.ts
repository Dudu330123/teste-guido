import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { query } from "@/lib/db/client";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: { code: "unauthorized", message: "Entre para consultar o histórico." } }, { status: 401 });
    const result = await query<{
      guide_version_id: string; current_step: number; status: "not_started" | "in_progress" | "completed"; last_accessed_at: Date;
      guide_version: string; platform: "android" | "ios"; task_slug: string; task_title: string; application_name: string;
    }>(
      `select up.guide_version_id, up.current_step, up.status, up.last_accessed_at,
              gv.guide_version, gv.platform, t.slug as task_slug, t.title as task_title, a.name as application_name
         from user_progress up
         join guide_versions gv on gv.id = up.guide_version_id
         join tutorials t on t.id = gv.tutorial_id
         join applications a on a.id = t.application_id
        where up.user_id = $1 order by up.last_accessed_at desc limit 50`,
      [user.id],
    );
    return NextResponse.json({ data: result.rows.map((row) => ({
      guideId: row.guide_version_id,
      currentStep: row.current_step,
      status: row.status,
      lastAccessedAt: new Date(row.last_accessed_at).toISOString(),
      guideVersion: row.guide_version,
      operatingSystem: row.platform,
      taskSlug: row.task_slug,
      taskTitle: row.task_title,
      applicationName: row.application_name,
    })) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Progress history failed", error instanceof Error ? error.name : "unknown_error");
    return NextResponse.json({ error: { code: "service_unavailable", message: "Não foi possível carregar o histórico." } }, { status: 503 });
  }
}
