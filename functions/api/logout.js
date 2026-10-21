import { verifyRequest } from "./_csrf.js";
import { hashToken } from "./_token.js";

function clearCookies(request) {
  const secure = request.url.startsWith("https://") ? "; Secure" : "";
  return [
    `session=; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=0`,
    `__Host-session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`,
  ];
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!verifyRequest(request)) return Response.json({ error: "非法请求" }, { status: 403 });

  const cookieHeader = request.headers.get("Cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)(?:__Host-)?session=([^;]+)/);
  if (match) {
    const tokenHash = await hashToken(match[1]);
    await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
  }

  const headers = new Headers({ "Content-Type": "application/json" });
  for (const c of clearCookies(request)) headers.append("Set-Cookie", c);
  return new Response(JSON.stringify({ success: true, message: "登出成功" }), {
    status: 200,
    headers,
  });
}
