const TOUCH_INTERVAL_MS = 5 * 60 * 1000;

export async function getSessionUser(request, env, context) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)(?:__Host-)?session=([^;]+)/);
  if (!match) return null;

  const token = match[1];
  const tokenHash = await crypto.subtle
    .digest("SHA-256", new TextEncoder().encode(token))
    .then((b) => Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, "0")).join(""));

  const session = await env.DB
    .prepare("SELECT user_id, expires_at, last_seen_at FROM sessions WHERE token_hash = ?")
    .bind(tokenHash)
    .first();

  if (!session) return null;

  if (new Date(session.expires_at) < new Date()) {
    const cleanup = env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
    if (context && context.waitUntil) context.waitUntil(cleanup);
    return null;
  }

  const now = Date.now();
  const lastSeen = session.last_seen_at ? new Date(session.last_seen_at).getTime() : 0;
  if (now - lastSeen >= TOUCH_INTERVAL_MS) {
    const touch = env.DB
      .prepare("UPDATE sessions SET last_seen_at = ? WHERE token_hash = ?")
      .bind(new Date(now).toISOString(), tokenHash)
      .run();
    if (context && context.waitUntil) context.waitUntil(touch);
  }

  return { userId: session.user_id, tokenHash };
}
