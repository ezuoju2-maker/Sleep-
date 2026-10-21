import { getSessionUser } from "./_session.js";

import { verifyRequest } from "./_csrf.js";
export async function onRequestGet(context) {
  const { request, env } = context;
  const auth = await getSessionUser(request, env, context);
  if (!auth) return Response.json({ error: "未登录" }, { status: 401 });

  const rows = await env.DB
    .prepare("SELECT token_hash, ip, user_agent, created_at FROM sessions WHERE user_id = ? ORDER BY created_at DESC")
    .bind(auth.userId)
    .all();

  const sessions = rows.results.map(s => ({
    ip: s.ip,
    user_agent: s.user_agent,
    created_at: s.created_at,
    isCurrent: s.token_hash === auth.tokenHash,
  }));

  return Response.json({ success: true, sessions });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!verifyRequest(request)) return Response.json({ error: "非法请求" }, { status: 403 });
  const auth = await getSessionUser(request, env, context);
  if (!auth) return Response.json({ error: "未登录" }, { status: 401 });

  const { action } = await request.json();
  if (action === "revoke_others") {
    await env.DB
      .prepare("DELETE FROM sessions WHERE user_id = ? AND token_hash != ?")
      .bind(auth.userId, auth.tokenHash)
      .run();
    return Response.json({ success: true, message: "已下线所有其他设备" });
  }
  return Response.json({ error: "未知操作" }, { status: 400 });
}
