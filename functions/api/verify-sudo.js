import { verifyRequest } from "./_csrf.js";
import { SUDO_TOKEN_TTL_SEC, LOGIN_ACCOUNT_FAIL_THRESHOLD, LOGIN_ACCOUNT_LOCK_SEC } from "./_constants.js";
import { getSessionUser } from "./_session.js";
import { verifyPassword } from "./_crypto.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!verifyRequest(request)) return Response.json({ error: "非法请求" }, { status: 403 });

  const auth = await getSessionUser(request, env, context);
  if (!auth) return Response.json({ error: "未登录" }, { status: 401 });

  try {
    const { password } = await request.json();
    const clientIP = request.headers.get("cf-connecting-ip") || "unknown";
    const lockKey = `sudo:${auth.userId}:${clientIP}`;
    const attempt = await env.DB.prepare("SELECT attempts, locked_until FROM login_attempts WHERE key = ?").bind(lockKey).first();

    if (attempt && attempt.locked_until && new Date(attempt.locked_until) > new Date()) {
      return Response.json({ error: "密码错误次数过多，请稍后再试" }, { status: 429 });
    }
    if (attempt && attempt.locked_until) {
      await env.DB.prepare("DELETE FROM login_attempts WHERE key = ?").bind(lockKey).run();
    }

    const user = await env.DB.prepare("SELECT password_hash FROM users WHERE id = ?").bind(auth.userId).first();
    if (!user) return Response.json({ error: "用户不存在" }, { status: 404 });

    const ok = await verifyPassword(password, user.password_hash, env);
    if (!ok) {
      await env.DB
        .prepare("INSERT INTO login_attempts (key, attempts, locked_until) VALUES (?1, 1, NULL) ON CONFLICT(key) DO UPDATE SET attempts = attempts + 1, locked_until = CASE WHEN attempts + 1 >= ?2 THEN ?3 ELSE locked_until END")
        .bind(lockKey, LOGIN_ACCOUNT_FAIL_THRESHOLD, new Date(Date.now() + LOGIN_ACCOUNT_LOCK_SEC * 1000).toISOString())
        .run();
      return Response.json({ error: "密码不正确" }, { status: 403 });
    }

    await env.DB.prepare("DELETE FROM login_attempts WHERE key = ?").bind(lockKey).run();

    const sudoToken = crypto.randomUUID();
    await env.SLEEP_KV.put(`sudo_${sudoToken}`, auth.userId.toString(), { expirationTtl: SUDO_TOKEN_TTL_SEC });

    return Response.json({ success: true, sudo_token: sudoToken });
  } catch (err) {
    console.error("Verify Sudo Error:", err);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
