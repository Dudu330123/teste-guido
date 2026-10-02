import { NextResponse } from "next/server";

/** Uploads foram removidos: imagens entram somente como assets versionados. */
function retiredEndpoint() {
  return NextResponse.json(
    { error: { code: "endpoint_retired", message: "Use imagens versionadas no site; upload público desativado." } },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}

export const GET = retiredEndpoint;
export const POST = retiredEndpoint;
export const DELETE = retiredEndpoint;
