import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { authErrorResponse } from "@/lib/auth/http";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ data: { user } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return authErrorResponse(error);
  }
}
