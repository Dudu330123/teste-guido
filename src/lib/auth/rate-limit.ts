import { AuthError } from "./types";

const attempts = new Map<string, { count: number; resetAt: number }>();

export function enforceRateLimit(key: string, limit = 10, windowMs = 5 * 60 * 1000) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  current.count += 1;
  if (current.count > limit) throw new AuthError("rate_limited", "Muitas tentativas. Aguarde alguns minutos e tente novamente.", 429);
}

export function requestRateLimitKey(request: Request, action: string) {
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  return `${action}:${address}`;
}
