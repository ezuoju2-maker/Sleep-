export async function writeAudit(env, request, { userId, action, detail }) {
  try {
    const cf = request.cf || {};
    const finalAction = detail ? `${action}:${detail}` : action;
    await env.DB
      .prepare("INSERT INTO audit_logs (user_id, action, ip, country, user_agent) VALUES (?, ?, ?, ?, ?)")
      .bind(
        userId,
        finalAction,
        request.headers.get("cf-connecting-ip") || "unknown",
        cf.country || "Unknown",
        request.headers.get("user-agent") || "unknown"
      )
      .run();
  } catch (e) {
    console.error("Audit write failed:", e);
  }
}
