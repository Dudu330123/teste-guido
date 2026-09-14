import { NextResponse } from "next/server";
import { z } from "zod";
import { requestPasswordReset } from "@/lib/auth/service";
import { authErrorResponse } from "@/lib/auth/http";
import { enforceRateLimit, requestRateLimitKey } from "@/lib/auth/rate-limit";

export async function POST(request: Request) {
  try {
    enforceRateLimit(requestRateLimitKey(request, "forgot-password"), 5);
    const parsed = z.object({ email: z.string().email() }).safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: { code: "invalid_request", message: "Informe um e-mail válido." } }, { status: 400 });
    await requestPasswordReset(parsed.data.email);
    return NextResponse.json({ data: { message: "Se houver uma conta com esse e-mail, as instruções foram enviadas." } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return authErrorResponse(error);
  }
}
