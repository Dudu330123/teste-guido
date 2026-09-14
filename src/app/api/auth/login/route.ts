import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticatePassword } from "@/lib/auth/service";
import { authErrorResponse } from "@/lib/auth/http";
import { enforceRateLimit, requestRateLimitKey } from "@/lib/auth/rate-limit";

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1).max(128) });

export async function POST(request: Request) {
  try {
    enforceRateLimit(requestRateLimitKey(request, "login"), 12);
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: { code: "invalid_request", message: "Revise os dados informados." } }, { status: 400 });
    const result = await authenticatePassword(parsed.data);
    return NextResponse.json({ data: { user: result.user } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return authErrorResponse(error);
  }
}
