export async function onRequestGet(context) {
  const { request, env } = context;
  const clientId = env.GITHUB_CLIENT_ID;
  const redirectUri = env.GITHUB_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return new Response("服务未配置 GitHub OAuth", { status: 500 });
  }

  const state = crypto.randomUUID();
  const nonce = crypto.randomUUID();
  await env.SLEEP_KV.put(`oauth_state:${state}`, nonce, { expirationTtl: 600 });

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email&state=${state}`;

  // nonce 绑定发起授权的浏览器，回调时与 KV 中的值双向比对，防止 OAuth 登录 CSRF。
  const secure = request.url.startsWith("https://") ? "; Secure" : "";
  return new Response(null, {
    status: 302,
    headers: {
      Location: authUrl,
      "Set-Cookie": `oauth_nonce=${nonce}; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=600`,
    },
  });
}
