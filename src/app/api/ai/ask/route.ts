import { NextResponse } from "next/server";
import { generateGuideFromGemini } from "@/lib/ai/gemini-guide";
import { checkRateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  try {
    const rateLimit = checkRateLimit(request, "ai-ask", 10, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Tente novamente em alguns instantes." }, rateLimitResponse(rateLimit));
    }

    const body = await request.json().catch(() => null);
    const prompt = body?.prompt;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "A pergunta não pode estar vazia." },
        { status: 400 },
      );
    }

    // A chave aceita somente variáveis do servidor. Chaves enviadas pelo
    // navegador poderiam aparecer no histórico, no DevTools ou em logs.
    const result = await generateGuideFromGemini(prompt.slice(0, 1000));

    if (!result.ok) {
      return NextResponse.json({
        fallback: true,
        reason: result.reason,
        message: "A inteligência online está indisponível neste momento.",
      }, { headers: { "Cache-Control": "no-store" } });
    }

    return NextResponse.json({ success: true, guide: result.guide }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.warn("Erro ao consultar serviço de IA do Guido:", error);
    return NextResponse.json({ fallback: true, reason: "unexpected_error" }, { headers: { "Cache-Control": "no-store" } });
  }
}
