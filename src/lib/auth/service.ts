import { query, withTransaction } from "@/lib/db/client";
import { createSession, revokeUserSessions } from "./session";
import { createOpaqueToken, hashOpaqueToken } from "./tokens";
import { hashPassword, verifyPassword } from "./password";
import { sendEmail, sendWelcomeEmail } from "./email";
import { AuthError, normalizeEmail, type AuthUser } from "./types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function userFromRow(row: {
  id: string;
  email: string;
  display_name: string;
  preferred_platform: "android" | "ios" | null;
  email_verified_at: string | null;
}): AuthUser {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    preferredPlatform: row.preferred_platform,
    emailVerified: Boolean(row.email_verified_at),
  };
}

function validateEmail(email: string) {
  const normalized = normalizeEmail(email);
  if (!emailPattern.test(normalized) || normalized.length > 320) {
    throw new AuthError("invalid_email", "Informe um e-mail válido.");
  }
  return normalized;
}

function validatePassword(password: string) {
  if (password.length < 8 || password.length > 128) {
    throw new AuthError("invalid_password", "A senha deve ter entre 8 e 128 caracteres.");
  }
}

export async function createAccount(input: {
  name: string;
  email: string;
  password: string;
  preferredPlatform: "android" | "ios";
}) {
  const email = validateEmail(input.email);
  validatePassword(input.password);
  const name = input.name.trim().replace(/\s+/g, " ");
  if (name.length < 1 || name.length > 100) throw new AuthError("invalid_name", "Informe seu nome.");

  const passwordHash = await hashPassword(input.password);
  const verificationToken = createOpaqueToken();
  const user = await withTransaction(async (client) => {
    try {
      const inserted = await client.query<{
        id: string;
        email: string;
        display_name: string;
        preferred_platform: "android" | "ios";
        email_verified_at: string | null;
      }>(
        `insert into users (email, normalized_email, password_hash, display_name, preferred_platform)
         values ($1, $1, $2, $3, $4) returning id, email, display_name, preferred_platform, email_verified_at`,
        [email, passwordHash, name, input.preferredPlatform],
      );
      const row = inserted.rows[0];
      await client.query("insert into user_identities (user_id, provider, provider_subject, provider_email) values ($1, 'password', $2, $3)", [row.id, email, email]);
      await client.query("insert into profiles (id, display_name, preferred_platform) values ($1, $2, $3)", [row.id, name, input.preferredPlatform]);
      await client.query(
        `insert into email_verification_tokens (user_id, token_hash, expires_at) values ($1, $2, now() + interval '24 hours')`,
        [row.id, hashOpaqueToken(verificationToken)],
      );
      return userFromRow(row);
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
        throw new AuthError("email_already_registered", "Não foi possível criar a conta com esses dados.");
      }
      throw error;
    }
  });

  const verificationUrl = `${process.env.AUTH_BASE_URL ?? "http://localhost:3000"}/api/auth/verify-email?token=${encodeURIComponent(verificationToken)}`;
  try {
    await sendWelcomeEmail({ to: email, name, verificationUrl });
  } catch (error) {
    console.error("Guido welcome email delivery failed", {
      userId: user.id,
      error: error instanceof Error ? error.message : "unknown_error",
    });
  }
  return { user, requiresEmailVerification: true };
}

export async function authenticatePassword(input: { email: string; password: string }) {
  const email = validateEmail(input.email);
  const result = await query<{
    id: string;
    email: string;
    display_name: string;
    preferred_platform: "android" | "ios" | null;
    email_verified_at: string | null;
    password_hash: string | null;
    disabled: boolean;
  }>(
    `select id, email, display_name, preferred_platform, email_verified_at, password_hash, disabled
       from users where normalized_email = $1`,
    [email],
  );
  const row = result.rows[0];
  if (!row?.password_hash || row.disabled || !(await verifyPassword(row.password_hash, input.password))) {
    throw new AuthError("invalid_credentials", "E-mail ou senha incorretos.", 401);
  }
  if (!row.email_verified_at) throw new AuthError("email_not_verified", "Confirme seu e-mail antes de entrar.", 403);
  const user = userFromRow(row);
  await createSession(user.id);
  return { user };
}

export async function requestPasswordReset(rawEmail: string) {
  const email = validateEmail(rawEmail);
  const result = await query<{ id: string; display_name: string }>("select id, display_name from users where normalized_email = $1 and disabled = false", [email]);
  const row = result.rows[0];
  if (!row) return;
  const token = createOpaqueToken();
  await query("delete from password_reset_tokens where user_id = $1 and consumed_at is null", [row.id]);
  await query("insert into password_reset_tokens (user_id, token_hash, expires_at) values ($1, $2, now() + interval '1 hour')", [row.id, hashOpaqueToken(token)]);
  const resetUrl = `${process.env.AUTH_BASE_URL ?? "http://localhost:3000"}/recuperar-senha?token=${encodeURIComponent(token)}`;
  await sendEmail({
    to: email,
    subject: "Redefina sua senha Guido",
    text: `Olá, ${row.display_name}. Redefina sua senha neste endereço:\n\n${resetUrl}\n\nO link expira em 1 hora e só pode ser usado uma vez.`,
  });
}

export async function resetPassword(token: string, password: string) {
  validatePassword(password);
  if (!token || token.length < 40) throw new AuthError("invalid_reset_token", "Link de recuperação inválido ou expirado.", 400);
  const passwordHash = await hashPassword(password);
  await withTransaction(async (client) => {
    const found = await client.query<{ user_id: string }>(
      `select user_id from password_reset_tokens where token_hash = $1 and consumed_at is null and expires_at > now() for update`,
      [hashOpaqueToken(token)],
    );
    const row = found.rows[0];
    if (!row) throw new AuthError("invalid_reset_token", "Link de recuperação inválido ou expirado.", 400);
    await client.query("update users set password_hash = $1, email_verified_at = coalesce(email_verified_at, now()) where id = $2", [passwordHash, row.user_id]);
    await client.query("update password_reset_tokens set consumed_at = now() where token_hash = $1", [hashOpaqueToken(token)]);
    await client.query("update sessions set revoked_at = now() where user_id = $1 and revoked_at is null", [row.user_id]);
  });
}

export async function verifyEmail(token: string) {
  if (!token || token.length < 40) throw new AuthError("invalid_verification_token", "Link de confirmação inválido ou expirado.", 400);
  await withTransaction(async (client) => {
    const found = await client.query<{ user_id: string }>(
      `select user_id from email_verification_tokens where token_hash = $1 and consumed_at is null and expires_at > now() for update`,
      [hashOpaqueToken(token)],
    );
    const row = found.rows[0];
    if (!row) throw new AuthError("invalid_verification_token", "Link de confirmação inválido ou expirado.", 400);
    await client.query("update users set email_verified_at = coalesce(email_verified_at, now()) where id = $1", [row.user_id]);
    await client.query("update email_verification_tokens set consumed_at = now() where token_hash = $1", [hashOpaqueToken(token)]);
  });
}

export async function resolveGoogleIdentity(input: { subject: string; email: string; displayName: string }) {
  const email = validateEmail(input.email);
  return withTransaction(async (client) => {
    const identity = await client.query<{
      id: string; email: string; display_name: string; preferred_platform: "android" | "ios" | null; email_verified_at: string | null;
    }>(
      `select u.id, u.email, u.display_name, u.preferred_platform, u.email_verified_at
         from user_identities i join users u on u.id = i.user_id
        where i.provider = 'google' and i.provider_subject = $1 and u.disabled = false`,
      [input.subject],
    );
    if (identity.rows[0]) return userFromRow(identity.rows[0]);

    const existing = await client.query<{
      id: string; email: string; display_name: string; preferred_platform: "android" | "ios" | null; email_verified_at: string | null;
    }>("select id, email, display_name, preferred_platform, email_verified_at from users where normalized_email = $1 and disabled = false for update", [email]);
    let row = existing.rows[0];
    if (row && !row.email_verified_at) throw new AuthError("email_not_verified", "Confirme seu e-mail antes de vincular o Google.", 403);
    if (!row) {
      const inserted = await client.query<typeof row>(
        `insert into users (email, normalized_email, display_name, email_verified_at)
         values ($1, $1, $2, now()) returning id, email, display_name, preferred_platform, email_verified_at`,
        [email, input.displayName.trim().slice(0, 100) || email],
      );
      row = inserted.rows[0];
      await client.query("insert into profiles (id, display_name) values ($1, $2)", [row.id, row.display_name]);
    }
    await client.query("insert into user_identities (user_id, provider, provider_subject, provider_email) values ($1, 'google', $2, $3)", [row.id, input.subject, email]);
    return userFromRow(row);
  });
}

export async function updateProfile(userId: string, input: { displayName: string; preferredPlatform: "android" | "ios" }) {
  const name = input.displayName.trim().replace(/\s+/g, " ");
  if (name.length < 1 || name.length > 100) throw new AuthError("invalid_name", "Informe um nome válido.");
  await withTransaction(async (client) => {
    await client.query("update users set display_name = $1, preferred_platform = $2 where id = $3", [name, input.preferredPlatform, userId]);
    await client.query("update profiles set display_name = $1, preferred_platform = $2 where id = $3", [name, input.preferredPlatform, userId]);
  });
}

export async function getProfile(userId: string) {
  const result = await query<{ display_name: string; preferred_platform: "android" | "ios" | null }>("select display_name, preferred_platform from profiles where id = $1", [userId]);
  return result.rows[0] ?? null;
}

export { revokeUserSessions };
