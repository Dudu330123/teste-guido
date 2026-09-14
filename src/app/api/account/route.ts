import { NextResponse } from "next/server";
import { z } from "zod";
import { authErrorResponse } from "@/lib/auth/http";
import { getProfile, updateProfile } from "@/lib/auth/service";
import { getCurrentUser } from "@/lib/auth/session";

const profileSchema = z.object({ displayName: z.string().trim().min(1).max(100), preferredPlatform: z.enum(["android", "ios"]) });

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: { code: "unauthorized", message: "Entre para consultar sua conta." } }, { status: 401 });
    return NextResponse.json({ data: { user, profile: await getProfile(user.id) } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: { code: "unauthorized", message: "Entre para salvar suas preferências." } }, { status: 401 });
    const parsed = profileSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: { code: "invalid_request", message: "Revise os dados informados." } }, { status: 400 });
    await updateProfile(user.id, parsed.data);
    return NextResponse.json({ data: { profile: await getProfile(user.id) } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return authErrorResponse(error);
  }
}
