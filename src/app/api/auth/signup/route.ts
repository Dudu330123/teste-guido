import { NextResponse } from "next/server";
import { z } from "zod";
import { createAccount } from "@/lib/auth/service";
import { authErrorResponse } from "@/lib/auth/http";
import { enforceRateLimit, requestRateLimitKey } from "@/lib/auth/rate-limit";

const signupSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  preferredPlatform: z.enum(["android", "ios"]),
});

export async function POST(request: Request) {
  try {
    enforceRateLimit(requestRateLimitKey(request, "signup"), 5);
    const parsed = signupSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: { code: "invalid_request", message: "Revise os dados informados." } }, { status: 400 });
    const result = await createAccount(parsed.data);
    return NextResponse.json({ data: { requiresEmailVerification: result.requiresEmailVerification } }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return authErrorResponse(error);
  }
}
