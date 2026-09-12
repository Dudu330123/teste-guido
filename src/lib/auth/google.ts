import { cookies } from "next/headers";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { decodeJwt, createRemoteJWKSet, jwtVerify } from "jose";
import { createCodeChallenge, createCodeVerifier } from "./tokens";
import { AuthError } from "./types";

const STATE_COOKIE = "guido_google_state";
const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

function secret() {
  const value = process.env.AUTH_SESSION_SECRET;
  if (!value || value.length < 32) throw new AuthError("auth_not_configured", "AUTH_SESSION_SECRET não está configurado.", 503);
  return value;
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function encodeState(payload: { state: string; verifier: string; nonce: string; next: string; expiresAt: number }) {
  const value = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${value}.${sign(value)}`;
}

function decodeState(value: string) {
  const [encoded, signature] = value.split(".");
  const expected = encoded ? Buffer.from(sign(encoded)) : Buffer.alloc(0);
  const actual = Buffer.from(signature ?? "");
  if (!encoded || !signature || actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new AuthError("invalid_oauth_state", "Não foi possível validar o login com Google.", 400);
  const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as { state: string; verifier: string; nonce: string; next: string; expiresAt: number };
  if (payload.expiresAt < Date.now()) throw new AuthError("expired_oauth_state", "A tentativa de login expirou.", 400);
  return payload;
}

export async function createGoogleAuthorizationUrl(next: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !process.env.GOOGLE_CLIENT_SECRET || !redirectUri) throw new AuthError("google_not_configured", "Login com Google ainda não está configurado.", 503);
  const state = randomUUID();
  const nonce = randomUUID();
  const verifier = createCodeVerifier();
  const cookieValue = encodeState({ state, verifier, nonce, next, expiresAt: Date.now() + 10 * 60 * 1000 });
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, cookieValue, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 600 });
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("code_challenge", createCodeChallenge(verifier));
  url.searchParams.set("code_challenge_method", "S256");
  return url;
}

export async function exchangeGoogleCode(code: string, state: string) {
  const cookieStore = await cookies();
  const rawState = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.set(STATE_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
  if (!rawState) throw new AuthError("invalid_oauth_state", "Não foi possível validar o login com Google.", 400);
  const stored = decodeState(rawState);
  if (stored.state !== state) throw new AuthError("invalid_oauth_state", "Não foi possível validar o login com Google.", 400);
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID ?? "", client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "", redirect_uri: process.env.GOOGLE_REDIRECT_URI ?? "", grant_type: "authorization_code", code_verifier: stored.verifier }),
    cache: "no-store",
  });
  if (!response.ok) throw new AuthError("google_exchange_failed", "Não foi possível concluir o login com Google.", 400);
  const token = await response.json() as { id_token?: string };
  if (!token.id_token) throw new AuthError("google_token_missing", "Resposta inválida do Google.", 400);
  const verified = await jwtVerify(token.id_token, GOOGLE_JWKS, { issuer: ["https://accounts.google.com", "accounts.google.com"], audience: process.env.GOOGLE_CLIENT_ID });
  const claims = verified.payload;
  if (claims.nonce !== stored.nonce || claims.email_verified !== true || typeof claims.sub !== "string" || typeof claims.email !== "string") throw new AuthError("google_identity_invalid", "A identidade Google não pôde ser validada.", 400);
  return { subject: claims.sub, email: claims.email, displayName: typeof claims.name === "string" ? claims.name : claims.email, next: stored.next };
}

export function googleClaimsForTests(token: string) {
  return decodeJwt(token);
}
