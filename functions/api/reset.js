import { verifyRequest } from "./_csrf.js";
import { hashPassword } from "./_crypto.js";
import { sendPasswordChangedNotice } from "./_notify.js";
import { validatePassword } from "./_password.js";
import { rateLimit } from "./_ratelimit.js";
import { RESET_IP_LIMIT, RESET_IP_WINDOW_SEC } from "./_constants.js";
import { writeAudit } from "./_audit.js";


export async function onRequestPost(context) {
  const { request, env } = context;
  if (!verifyRequest(request)) return Response.json({ error: "非法请求" }, { status: 403 });

  try {
    const clientIP = request.headers.get("cf-connecting-ip") || "unknown";
    const rl = await rateLimit(env, `reset_ip:${clientIP}`, RESET_IP_LIMIT, RESET_IP_WINDOW_SEC);
    if (!rl.ok) return Response.json({ error: "尝试过于频繁，请稍后再试" }, { status: 429 });

    const { token, newPassword } = await request.json();
    if (!token || !newPassword) {
      return Response.json({ error: "参数错误" }, { status: 400 });
    }

    const pwdErr = await validatePassword(env, newPassword, { checkHibp: true });
    if (pwdErr) return Response.json({ error: pwdErr }, { status: 400 });

    const tokenHash = await crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(token))
      .then(b => Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, "0")).join(""));

    const preview = await env.DB
      .prepare("SELECT user_id, expires_at FROM password_resets WHERE token_hash = ? AND used_at IS NULL")
      .bind(tokenHash)
      .first();
    if (!preview) {
      return Response.json({ error: "重置链接已失效或已被使用" }, { status: 400 });
    }
    const nowIso = new Date().toISOString();
    if (new Date(preview.expires_at).toISOString() <= nowIso) {
      return Response.json({ error: "重置链接已过期" }, { status: 400 });
    }

    const newHash = await hashPassword(newPassword, env);
    const userId = preview.user_id;

    // 令牌消费、改密、撤销会话、清锁键在同一事务内完成。后续语句以 EXISTS 守卫，
    // 只有本事务确实消费了令牌（used_at = nowIso）才生效，避免并发双发时密码被二次改写。
    const guard = "EXISTS (SELECT 1 FROM password_resets WHERE token_hash = ? AND used_at = ?)";
    const results = await env.DB.batch([
      env.DB.prepare("UPDATE password_resets SET used_at = ? WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?")
        .bind(nowIso, tokenHash, nowIso),
      env.DB.prepare(`UPDATE users SET password_hash = ? WHERE id = ? AND ${guard}`)
        .bind(newHash, userId, tokenHash, nowIso),
      env.DB.prepare(`DELETE FROM sessions WHERE user_id = ? AND ${guard}`)
        .bind(userId, tokenHash, nowIso),
      env.DB.prepare(`DELETE FROM login_attempts WHERE key LIKE ? AND ${guard}`)
        .bind(`acct:${userId}:%`, tokenHash, nowIso),
      env.DB.prepare(`DELETE FROM login_attempts WHERE key LIKE ? AND ${guard}`)
        .bind(`sudo:${userId}:%`, tokenHash, nowIso),
    ]);
    if (results[0].meta.changes !== 1) {
      return Response.json({ error: "重置链接已失效、过期或已被使用" }, { status: 400 });
    }

    context.waitUntil(writeAudit(env, request, { userId, action: "password.reset" }));

    const u = await env.DB.prepare("SELECT email FROM users WHERE id = ?").bind(userId).first();
    if (u && u.email) {
      context.waitUntil(sendPasswordChangedNotice(env, { email: u.email, userId, request }));
    }

    return Response.json({ success: true, message: "密码修改成功，请重新登录" });
  } catch (err) {
    console.error("Reset Error:", err);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
