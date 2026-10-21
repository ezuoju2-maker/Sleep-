import { verifyRequest } from "./_csrf.js";
import { getSessionUser } from "./_session.js";
import { verifyPassword, hashPassword } from "./_crypto.js";
import { writeAudit } from "./_audit.js";
import { sendPasswordChangedNotice } from "./_notify.js";
import { validatePassword } from "./_password.js";

export async function onRequestPost(context) {
  const { request, env, waitUntil } = context;
  if (!verifyRequest(request)) return Response.json({ error: "非法请求" }, { status: 403 });

  const auth = await getSessionUser(request, env, context);
  if (!auth) return Response.json({ error: "会话已过期" }, { status: 401 });

  try {
    const { oldPassword, newPassword, sudo_token } = await request.json();
    const sudoKey = `sudo_${sudo_token}`;
    const owner = await env.SLEEP_KV.get(sudoKey);
    if (!owner || owner !== auth.userId.toString()) {
      return Response.json({ error: "安全验证已过期" }, { status: 403 });
    }
    await env.SLEEP_KV.delete(sudoKey);

      if (!oldPassword) return Response.json({ error: "原密码不能为空" }, { status: 400 });
      const pwdErr = await validatePassword(env, newPassword, { checkHibp: true });
      if (pwdErr) return Response.json({ error: pwdErr }, { status: 400 });

    const user = await env.DB.prepare("SELECT password_hash FROM users WHERE id = ?").bind(auth.userId).first();
    if (!user) return Response.json({ error: "用户不存在" }, { status: 404 });

    const ok = await verifyPassword(oldPassword, user.password_hash, env);
    if (!ok) return Response.json({ error: "原密码不正确" }, { status: 403 });

    const newHash = await hashPassword(newPassword, env);
    await env.DB.batch([
      env.DB.prepare("UPDATE users SET password_hash = ? WHERE id = ?").bind(newHash, auth.userId),
      env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(auth.userId),
      env.DB.prepare("DELETE FROM login_attempts WHERE key LIKE ?").bind(`acct:${auth.userId}:%`),
      env.DB.prepare("DELETE FROM login_attempts WHERE key LIKE ?").bind(`sudo:${auth.userId}:%`),
    ]);
    waitUntil(writeAudit(env, request, { userId: auth.userId, action: "password.changed" }));

    const u = await env.DB.prepare("SELECT email FROM users WHERE id = ?").bind(auth.userId).first();
    if (u && u.email) {
      waitUntil(sendPasswordChangedNotice(env, { email: u.email, userId: auth.userId, request }));
    }

    const secure = request.url.startsWith("https://") ? "; Secure" : "";
    const headers = new Headers({ "Content-Type": "application/json" });
    headers.append("Set-Cookie", `session=; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=0`);
    headers.append("Set-Cookie", "__Host-session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0");
    return new Response(JSON.stringify({ success: true, message: "密码修改成功，请重新登录" }), {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("Change Password Error:", err);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
