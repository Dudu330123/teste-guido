import { NextResponse } from "next/server";
import { revokeCurrentSession } from "@/lib/auth/session";
import { authErrorResponse } from "@/lib/auth/http";

export async function POST() {
  try {
    await revokeCurrentSession();
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return authErrorResponse(error);
  }
}
