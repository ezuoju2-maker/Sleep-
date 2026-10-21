import { getSessionUser } from "./_session.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  const auth = await getSessionUser(request, env, context);
  if (!auth) return Response.json({ error: "未登录" }, { status: 401 });

  const rows = await env.DB
    .prepare("SELECT action, ip, country, user_agent, created_at FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 10")
    .bind(auth.userId)
    .all();

  return Response.json({ success: true, logs: rows.results });
}
