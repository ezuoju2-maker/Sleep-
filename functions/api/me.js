import { getSessionUser } from "./_session.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  const auth = await getSessionUser(request, env, context);
  if (!auth) return Response.json({ error: "会话已过期，请重新登录" }, { status: 401 });

  const user = await env.DB
    .prepare("SELECT uid, email, username, email_verified, created_at FROM users WHERE id = ?")
    .bind(auth.userId)
    .first();

  if (!user) return Response.json({ error: "用户不存在" }, { status: 404 });
  return Response.json({ success: true, user });
}
