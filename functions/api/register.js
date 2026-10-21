import { verifyRequest } from "./_csrf.js";
import { isMaliciousIP } from "./_threatintel.js";
import { evaluateShield } from "./_shield.js";
import { isDisposableEmail } from "./_disposable.js";
import { hashPassword } from "./_crypto.js";
import { validatePassword } from "./_password.js";
import { rateLimit } from "./_ratelimit.js";
import { writeAudit } from "./_audit.js";
import {
  REGISTER_IP_HOUR_LIMIT,
  REGISTER_IP_DAY_LIMIT,
} from "./_constants.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!verifyRequest(request)) return Response.json({ error: "非法请求" }, { status: 403 });

  try {
    const clientIP = request.headers.get("cf-connecting-ip") || "unknown";
    if (clientIP !== "unknown" && await isMaliciousIP(env, clientIP)) {
      return Response.json({ error: "请求来源存在安全风险" }, { status: 403 });
    }

    const now = new Date();
    const hourKey = now.toISOString().slice(0, 13);
    const dayKey = now.toISOString().slice(0, 10);
    const h = await rateLimit(env, `register_ip:${clientIP}:h${hourKey}`, REGISTER_IP_HOUR_LIMIT, 3600);
    if (!h.ok && !h.degraded) return Response.json({ error: "注册请求过于频繁，请一小时后再试" }, { status: 429 });
    const d = await rateLimit(env, `register_ip:${clientIP}:d${dayKey}`, REGISTER_IP_DAY_LIMIT, 86400);
    if (!d.ok && !d.degraded) return Response.json({ error: "今日注册次数已达上限，请明天再试" }, { status: 429 });

    const data = await request.json();
    const username = String(data.username || "").trim();
    const email = String(data.email || "").trim().toLowerCase();
    const password = data.password;

    if (!evaluateShield(data.shield).pass) {
      return Response.json({ error: "安全验证失败，请刷新后重试" }, { status: 403 });
    }
    if (!username || !/^[a-zA-Z0-9_]{4,20}$/.test(username)) {
      return Response.json({ error: "用户名不合法" }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "邮箱不合法" }, { status: 400 });
    }

    const pwdErr = await validatePassword(env, password);
    if (pwdErr) return Response.json({ error: pwdErr }, { status: 400 });

    if (await isDisposableEmail(email)) {
      return Response.json({ error: "请使用真实邮箱" }, { status: 400 });
    }

    const existing = await env.DB
      .prepare("SELECT id FROM users WHERE email = ?")
      .bind(email)
      .first();
    if (existing) {
      return Response.json({ error: "该邮箱已注册，请直接登录" }, { status: 409 });
    }
    const nameDup = await env.DB
      .prepare("SELECT id FROM users WHERE username = ?")
      .bind(username)
      .first();
    if (nameDup) {
      return Response.json({ error: "用户名已被占用，请换一个" }, { status: 409 });
    }

    let uid = null;
    for (let i = 0; i < 5; i += 1) {
      const cand = (crypto.getRandomValues(new Uint32Array(1))[0] % 90000000 + 10000000).toString();
      const dup = await env.DB.prepare("SELECT 1 FROM users WHERE uid = ?").bind(cand).first();
      if (!dup) { uid = cand; break; }
    }
    if (!uid) return Response.json({ error: "系统繁忙，请稍后再试" }, { status: 503 });

    const passwordHash = await hashPassword(password, env);

    let userId;
    try {
      const result = await env.DB
        .prepare("INSERT INTO users (uid, username, email, password_hash, email_verified) VALUES (?, ?, ?, ?, 1)")
        .bind(uid, username, email, passwordHash)
        .run();
      userId = result.meta.last_row_id;
    } catch (err) {
      if (String(err.message || "").includes("UNIQUE")) {
        return Response.json({ error: "邮箱或用户名已被占用" }, { status: 409 });
      }
      throw err;
    }
    if (!userId) throw new Error("insert user did not return id");

    const sessionToken = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, "0")).join("");
    const sessionTokenHash = await crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(sessionToken))
      .then(b => Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, "0")).join(""));
    const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const secure = request.url.startsWith("https://") ? "; Secure" : "";
    const cookieName = secure ? "__Host-session" : "session";

    await env.DB
      .prepare("INSERT INTO sessions (token_hash, user_id, expires_at, ip, user_agent) VALUES (?, ?, ?, ?, ?)")
      .bind(sessionTokenHash, userId, sessionExpiresAt, clientIP, request.headers.get("user-agent") || "unknown")
      .run();

    context.waitUntil(writeAudit(env, request, { userId, action: "register.success" }));

    const cookie = `${cookieName}=${sessionToken}; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=2592000`;
    return new Response(JSON.stringify({
      success: true,
      user: { uid, username, email }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Set-Cookie": cookie },
    });
  } catch (err) {
    console.error("Register Error:", err);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
