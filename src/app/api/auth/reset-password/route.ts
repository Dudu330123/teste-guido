import { NextResponse } from "next/server";
import { z } from "zod";
import { resetPassword } from "@/lib/auth/service";
import { authErrorResponse } from "@/lib/auth/http";
import { enforceRateLimit, requestRateLimitKey } from "@/lib/auth/rate-limit";

export async function POST(request: Request) {
  try {
    enforceRateLimit(requestRateLimitKey(request, "reset-password"), 10);
    const parsed = z.object({ token: z.string().min(40), password: z.string().min(8).max(128) }).safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: { code: "invalid_request", message: "Revise o link e a nova senha." } }, { status: 400 });
    await resetPassword(parsed.data.token, parsed.data.password);
    return NextResponse.json({ data: { message: "Senha redefinida com sucesso." } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return authErrorResponse(error);
  }
}
