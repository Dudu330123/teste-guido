import { NextResponse } from "next/server";
import { z } from "zod";
import { generateGuideWithAi } from "@/services/ai-guide-generator";
import { generateGuideFromGemini } from "@/lib/ai/gemini-guide";
import { getAuthenticatedSupabaseServerClient } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

const requestSchema = z.object({
  prompt: z.string().trim().min(3, "Escreva um pouco mais sobre o que deseja aprender.").max(1000),
  inputMode: z.enum(["text", "voice"]).default("text"),
});

const DAILY_REQUEST_LIMIT = 3;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

async function saveFailedRequest(
  supabase: NonNullable<Awaited<ReturnType<typeof getAuthenticatedSupabaseServerClient>>>["supabase"],
  userId: string,
  prompt: string,
  inputMode: "text" | "voice",
  errorMessage: string,
) {
  await supabase.from("guide_requests").insert({
    user_id: userId,
    prompt,
    input_mode: inputMode,
    status: "error",
    error_message: errorMessage,
  });
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, "guide-requests", 5, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Tente novamente em alguns instantes." }, rateLimitResponse(rateLimit));
  }

  const authenticated = await getAuthenticatedSupabaseServerClient();
  if (!authenticated) {
    return NextResponse.json(
      { error: "Entre na sua conta para pedir um guia personalizado." },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Pedido inválido." },
      { status: 400 },
    );
  }

  const since = new Date(Date.now() - DAY_IN_MS).toISOString();
  const { count, error: countError } = await authenticated.supabase
    .from("guide_requests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", authenticated.user.id)
    .gte("created_at", since);

  if (countError) {
    console.error("Não foi possível consultar o limite de pedidos:", countError);
    return NextResponse.json(
      { error: "O recurso ainda não está pronto no banco de dados. Aplique a migração do Guido e tente novamente." },
      { status: 503 },
    );
  }

  if ((count ?? 0) >= DAILY_REQUEST_LIMIT) {
    return NextResponse.json(
      { error: "Você já fez 3 pedidos nas últimas 24 horas. Tente novamente mais tarde." },
      { status: 429 },
    );
  }

  let guide;
  const aiResult = await generateGuideFromGemini(parsed.data.prompt);
  if (aiResult.ok) {
    guide = aiResult.guide;
  } else if (aiResult.reason === "no_api_key") {
    // Mantém o protótipo utilizável localmente sem uma chave paga: a base
    // segura e limitada do Guido continua funcionando até o Gemini ser configurado.
    guide = await generateGuideWithAi(parsed.data.prompt);
  } else {
    await saveFailedRequest(
      authenticated.supabase,
      authenticated.user.id,
      parsed.data.prompt,
      parsed.data.inputMode,
      "A inteligência online não conseguiu preparar o guia.",
    );
    return NextResponse.json(
      { error: "Não consegui preparar o guia agora. Tente novamente em alguns instantes." },
      { status: 503 },
    );
  }

  const { data, error: insertError } = await authenticated.supabase
    .from("guide_requests")
    .insert({
      user_id: authenticated.user.id,
      prompt: parsed.data.prompt,
      input_mode: parsed.data.inputMode,
      status: "completed",
      generated_guide: guide,
      completed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insertError || !data) {
    console.error("Não foi possível salvar o pedido de guia:", insertError);
    return NextResponse.json(
      { error: "O guia foi preparado, mas não consegui salvar o pedido. Tente novamente." },
      { status: 503 },
    );
  }

  return NextResponse.json(
    { id: data.id, status: "completed", guide },
    { status: 201 },
  );
}
