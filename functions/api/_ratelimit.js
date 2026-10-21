export async function rateLimit(env, key, limit, windowSeconds) {
  if (!env.DB) {
    console.error(JSON.stringify({ event: "ratelimit_unavailable", key, limit, windowSeconds }));
    return { ok: false, remaining: 0, degraded: true, retryAfter: 30 };
  }
  const now = Date.now();
  const resetAt = now + windowSeconds * 1000;
  try {
    const row = await env.DB.prepare(
      `INSERT INTO rate_limits (key, count, reset_at) VALUES (?1, 1, ?2)
       ON CONFLICT(key) DO UPDATE SET
         count    = CASE WHEN rate_limits.reset_at <= ?3 THEN 1 ELSE rate_limits.count + 1 END,
         reset_at = CASE WHEN rate_limits.reset_at <= ?3 THEN ?2 ELSE rate_limits.reset_at END
       RETURNING count, reset_at`,
    ).bind(key, resetAt, now).first();
    return { ok: row.count <= limit, remaining: Math.max(0, limit - row.count), resetAt: row.reset_at };
  } catch (err) {
    console.error(JSON.stringify({ event: "ratelimit_error", key, message: err.message }));
    return { ok: false, remaining: 0, degraded: true, retryAfter: 30 };
  }
}
