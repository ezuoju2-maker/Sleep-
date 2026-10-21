import { verifyRequest } from "./_csrf.js";
import { evaluateShield } from "./_shield.js";
import { sendEmail, isEmailConfigured } from "./_email.js";
import { rateLimit } from "./_ratelimit.js";
import {
  FORGOT_IP_DAY_LIMIT,
  FORGOT_GLOBAL_DAY_LIMIT,
  FORGOT_EMAIL_COOLDOWN_SEC,
} from "./_constants.js";

const SAFE = {
  success: true,
  message: "如果该邮箱已注册，重置邮件已发出，请检查邮箱（包括垃圾箱）。",
};

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!verifyRequest(request)) return Response.json({ error: "非法请求" }, { status: 403 });

  const clientIP = request.headers.get("cf-connecting-ip") || "unknown";
  const safe = () => Response.json(SAFE);

  try {
    if (!isEmailConfigured(env)) {
      return Response.json({ error: "邮件服务暂不可用，请稍后再试" }, { status: 503 });
    }
    const data = await request.json();
    const email = data.email;
    if (!email) return safe();

    if (!evaluateShield(data.shield).pass) {
      return Response.json({ error: "安全验证失败，请刷新页面后重试" }, { status: 403 });
    }

    const today = new Date().toISOString().slice(0, 10);

    const ipRl = await rateLimit(env, `forgot_ip:${clientIP}:${today}`, FORGOT_IP_DAY_LIMIT, 86400);
    if (!ipRl.ok && !ipRl.degraded) return safe();

    const globalRl = await rateLimit(env, `forgot_global:${today}`, FORGOT_GLOBAL_DAY_LIMIT, 86400);
    if (!globalRl.ok && !globalRl.degraded) return safe();

    const cooldown = await env.SLEEP_KV.get(`forgot_cooldown:${email}`);
    if (cooldown) return safe();

    const user = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    if (!user) return safe();

    const recent = await env.DB
      .prepare("SELECT expires_at FROM password_resets WHERE user_id = ?")
      .bind(user.id)
      .first();
    if (recent && new Date(recent.expires_at).getTime() - Date.now() > 59 * 60 * 1000) {
      return safe();
    }

    await env.SLEEP_KV.put(`forgot_cooldown:${email}`, "1", { expirationTtl: FORGOT_EMAIL_COOLDOWN_SEC });

    const token = crypto.randomUUID();
    const tokenHash = await crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(token))
      .then(b => Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, "0")).join(""));
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await env.DB.batch([
      env.DB.prepare("DELETE FROM password_resets WHERE user_id = ?").bind(user.id),
      env.DB.prepare("INSERT INTO password_resets (token_hash, user_id, expires_at) VALUES (?, ?, ?)")
        .bind(tokenHash, user.id, expiresAt),
    ]);

    const origin = new URL(request.url).origin;
    const resetLink = `${origin}/?reset_token=${token}`;
    const html = `<div style="font-family:-apple-system,sans-serif;background:#f4f5f7;padding:40px 20px;text-align:center">
<div style="max-width:400px;margin:0 auto;background:#fff;border-radius:16px;padding:30px">
<h2 style="color:#111">重置密码</h2>
<p style="color:#666">请点击下方按钮设置新密码（1 小时内有效）。</p>
<a href="${resetLink}" style="display:inline-block;padding:12px 28px;background:#000;color:#fff;text-decoration:none;border-radius:10px;font-weight:600">设置新密码</a>
</div></div>`;

    context.waitUntil(sendEmail(env, email, "重置您的 Sleep 账号密码", html, { userId: user.id, type: "forgot" }));
    return safe();
  } catch (err) {
    console.error("Forgot Error:", err);
    return safe();
  }
}
