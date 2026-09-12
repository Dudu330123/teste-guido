import { cookies } from "next/headers";
import { createOpaqueToken, hashOpaqueToken } from "./tokens";
import { query } from "@/lib/db/client";
import type { AuthUser } from "./types";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function sessionCookieName() {
  return process.env.AUTH_COOKIE_NAME?.trim() || "guido_session";
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export async function createSession(userId: string) {
  const token = createOpaqueToken();
  await query(
    `insert into sessions (user_id, token_hash, expires_at)
     values ($1, $2, now() + interval '30 days')`,
    [userId, hashOpaqueToken(token)],
  );
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName(), token, sessionCookieOptions());
}

export async function revokeCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName())?.value;
  if (token) {
    await query("update sessions set revoked_at = now() where token_hash = $1 and revoked_at is null", [hashOpaqueToken(token)]);
  }
  cookieStore.set(sessionCookieName(), "", { ...sessionCookieOptions(), maxAge: 0 });
}

export async function revokeUserSessions(userId: string) {
  await query("update sessions set revoked_at = now() where user_id = $1 and revoked_at is null", [userId]);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName())?.value;
  if (!token) return null;
  let result;
  try {
    result = await query<{
      id: string;
      email: string;
      display_name: string;
      preferred_platform: "android" | "ios" | null;
      email_verified_at: string | null;
    }>(
      `select u.id, u.email, u.display_name, u.preferred_platform, u.email_verified_at
         from sessions s join users u on u.id = s.user_id
        where s.token_hash = $1 and s.revoked_at is null and s.expires_at > now() and u.disabled = false`,
      [hashOpaqueToken(token)],
    );
  } catch {
    return null;
  }
  const row = result.rows[0];
  if (!row) return null;
  await query("update sessions set last_seen_at = now() where token_hash = $1", [hashOpaqueToken(token)]);
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    preferredPlatform: row.preferred_platform,
    emailVerified: Boolean(row.email_verified_at),
  };
}
