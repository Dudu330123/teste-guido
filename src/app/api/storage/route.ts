import { NextResponse } from "next/server";
import { readFile, objectPath, verifyObjectUrl } from "@/lib/storage";

const contentTypes: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
  mp3: "audio/mpeg",
};

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const bucket = params.get("bucket") ?? "";
  const key = params.get("key") ?? "";
  const expires = params.get("expires") ?? "";
  const sig = params.get("sig") ?? "";
  if (!verifyObjectUrl(bucket, key, expires, sig)) return new NextResponse("Not found", { status: 404 });
  try {
    const body = await readFile(objectPath(bucket, key));
    const extension = key.split(".").pop()?.toLowerCase() ?? "";
    return new NextResponse(body, { headers: { "Content-Type": contentTypes[extension] ?? "application/octet-stream", "Cache-Control": "private, max-age=300" } });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
