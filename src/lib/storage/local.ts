import { createHmac, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

function root() {
  return path.resolve(process.env.LOCAL_STORAGE_DIR ?? ".local/storage");
}

function safePath(bucket: string, key: string) {
  if (!bucket || !key || key.includes("..") || key.startsWith("/")) throw new Error("Invalid storage key");
  return path.join(root(), bucket, key);
}

function signingSecret() {
  return process.env.STORAGE_SIGNING_SECRET || process.env.AUTH_SESSION_SECRET || "local-storage-development-secret";
}

function signature(bucket: string, key: string, expires: string) {
  return createHmac("sha256", signingSecret()).update(`${bucket}:${key}:${expires}`).digest("base64url");
}

export async function putObject(bucket: string, key: string, body: Uint8Array) {
  const filename = safePath(bucket, key);
  await mkdir(path.dirname(filename), { recursive: true });
  await writeFile(filename, body);
  return filename;
}

export async function removeObject(bucket: string, key: string) {
  await rm(safePath(bucket, key), { force: true });
}

export function signedObjectUrl(bucket: string, key: string, lifetimeSeconds = 3600) {
  const expires = String(Math.floor(Date.now() / 1000) + lifetimeSeconds);
  const params = new URLSearchParams({ bucket, key, expires, sig: signature(bucket, key, expires) });
  return `${process.env.STORAGE_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/storage?${params}`;
}

export function verifyObjectUrl(bucket: string, key: string, expires: string, sig: string) {
  if (!/^\d+$/.test(expires) || Number(expires) < Math.floor(Date.now() / 1000)) return false;
  const expected = signature(bucket, key, expires);
  const actual = Buffer.from(sig);
  const expectedBuffer = Buffer.from(expected);
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
}

export function objectPath(bucket: string, key: string) {
  return safePath(bucket, key);
}

export { readFile };
