type Bucket = {
  count: number;
  resetAt: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

const buckets = new Map<string, Bucket>();

function clientAddress(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function checkRateLimit(
  request: Request,
  name: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const key = `${name}:${clientAddress(request)}`;
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: Math.max(0, limit - 1), retryAfterSeconds: 0 };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { allowed: true, remaining: Math.max(0, limit - current.count), retryAfterSeconds: 0 };
}

export function rateLimitResponse(result: RateLimitResult) {
  return {
    status: 429,
    headers: {
      "Cache-Control": "no-store",
      "Retry-After": String(result.retryAfterSeconds),
    },
  } as const;
}
