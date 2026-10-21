import { verifyRequest } from "./_csrf.js";
import { isMaliciousIP } from "./_threatintel.js";
import { evaluateShield } from "./_shield.js";
import { verifyPassword, hashPassword, verifyDummyHash, hashNeedsRehash } from "./_crypto.js";
import { rateLimit } from "./_ratelimit.js";
import { writeAudit } from "./_audit.js";
import {
  LOGIN_IP_LIMIT,
  LOGIN_IP_WINDOW_SEC,
  LOGIN_ACCOUNT_FAIL_THRESHOLD,
  LOGIN_ACCOUNT_LOCK_SEC,
  SESSION_MAX_AGE_REMEMBER_SEC,
  SESSION_MAX_AGE_DEFAULT_SEC,
  MAX_SESSIONS_PER_USER,
} from "./_constants.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!verifyRequest(request)) return Response.json({ error: "非法请求" }, { status: 403 });

  try {
    const data = await request.json();
    const { account, password, remember } = data;
    const clientIP = request.headers.get("cf-connecting-ip") || "unknown";
    const authError = () => Response.json({ error: "邮箱或密码错误" }, { status: 401 });

    if (!account || !password) return authError();
    if (clientIP !== "unknown" && await isMaliciousIP(env, clientIP)) {
      return Response.json({ error: "来源风险" }, { status: 403 });
    }
    if (!evaluateShield(data.shield).pass) return authError();

    const ipOk = await rateLimit(env, `login_ip:${clientIP}`, LOGIN_IP_LIMIT, LOGIN_IP_WINDOW_SEC);
    if (!ipOk.ok) return Response.json({ error: "尝试过于频繁，请稍后再试" }, { status: 429 });

    const isEmail = account.includes("@");
    const emailKey = isEmail ? String(account).trim().toLowerCase() : "";
    const nameKey = isEmail ? "" : String(account).trim();
    const [byEmail, byName] = await Promise.all([
      isEmail ? env.DB.prepare("SELECT id, password_hash FROM users WHERE email = ?").bind(emailKey).first() : null,
      isEmail ? null : env.DB.prepare("SELECT id, password_hash FROM users WHERE username = ?").bind(nameKey).first(),
    ]);
    const user = byEmail || byName;
    const lockKey = user ? `acct:${user.id}:${clientIP}` : `ip:${clientIP}`;

    let attempt = await env.DB
      .prepare("SELECT attempts, locked_until FROM login_attempts WHERE key = ?")
      .bind(lockKey)
      .first();
    if (attempt && attempt.locked_until && new Date(attempt.locked_until) > new Date()) {
      return Response.json({ error: "尝试过于频繁，请稍后再试" }, { status: 429 });
    }
    if (attempt && attempt.locked_until) {
      await env.DB.prepare("DELETE FROM login_attempts WHERE key = ?").bind(lockKey).run();
      attempt = null;
    }

      if (!user) {
        await verifyDummyHash(password, env);
        await env.DB
          .prepare("INSERT INTO login_attempts (key, attempts, locked_until) VALUES (?1, 1, NULL) ON CONFLICT(key) DO UPDATE SET attempts = attempts + 1, locked_until = CASE WHEN attempts + 1 >= ?2 THEN ?3 ELSE locked_until END")
          .bind(lockKey, LOGIN_ACCOUNT_FAIL_THRESHOLD, new Date(Date.now() + LOGIN_ACCOUNT_LOCK_SEC * 1000).toISOString())
          .run();
        return authError();
      }

      const ok = await verifyPassword(password, user.password_hash, env);
      if (!ok) {
        await env.DB
          .prepare("INSERT INTO login_attempts (key, attempts, locked_until) VALUES (?1, 1, NULL) ON CONFLICT(key) DO UPDATE SET attempts = attempts + 1, locked_until = CASE WHEN attempts + 1 >= ?2 THEN ?3 ELSE locked_until END")
          .bind(lockKey, LOGIN_ACCOUNT_FAIL_THRESHOLD, new Date(Date.now() + LOGIN_ACCOUNT_LOCK_SEC * 1000).toISOString())
          .run();
        context.waitUntil(writeAudit(env, request, { userId: user.id, action: "login.failure" }));
        return authError();
      }

    await env.DB.prepare("DELETE FROM login_attempts WHERE key = ?").bind(lockKey).run();

    if (hashNeedsRehash(user.password_hash)) {
      const newHash = await hashPassword(password, env);
      await env.DB.prepare("UPDATE users SET password_hash = ? WHERE id = ?").bind(newHash, user.id).run();
    }

    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, "0")).join("");
    const tokenHash = await crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(token))
      .then(b => Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, "0")).join(""));
    const ttlSec = remember ? SESSION_MAX_AGE_REMEMBER_SEC : SESSION_MAX_AGE_DEFAULT_SEC;
    const expiresAt = new Date(Date.now() + ttlSec * 1000).toISOString();
    const secure = request.url.startsWith("https://") ? "; Secure" : "";

    const MAX_SESSIONS = MAX_SESSIONS_PER_USER;
    const existing = await env.DB
      .prepare("SELECT COUNT(*) AS n FROM sessions WHERE user_id = ?")
      .bind(user.id)
      .first();
    if (existing.n >= MAX_SESSIONS) {
      await env.DB
        .prepare("DELETE FROM sessions WHERE user_id = ? AND token_hash IN (SELECT token_hash FROM sessions WHERE user_id = ? ORDER BY created_at ASC LIMIT ?)")
        .bind(user.id, user.id, existing.n - MAX_SESSIONS + 1)
        .run();
    }

    await env.DB
      .prepare("INSERT INTO sessions (token_hash, user_id, expires_at, ip, user_agent) VALUES (?, ?, ?, ?, ?)")
      .bind(tokenHash, user.id, expiresAt, clientIP, request.headers.get("user-agent") || "unknown")
      .run();

    context.waitUntil(writeAudit(env, request, { userId: user.id, action: "login.success" }));

    const cookieName = secure ? "__Host-session" : "session";
    const cookie = `${cookieName}=${token}; HttpOnly${secure}; SameSite=Lax; Path=/${remember ? "; Max-Age=2592000" : ""}`;
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Set-Cookie": cookie },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
