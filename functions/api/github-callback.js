import { hashPassword } from "./_crypto.js";
import { generateToken, hashToken } from "./_token.js";
import { fetchWithTimeout } from "./_http.js";
import { SESSION_MAX_AGE_REMEMBER_SEC } from "./_constants.js";

async function exchangeCode(env, code, redirectUri) {
  const res = await fetchWithTimeout("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
    }).toString(),
  }, 5000);
  const data = await res.json();
  if (data.error || !data.access_token) {
    return { ok: false, error: data.error || "no_token" };
  }
  return { ok: true, accessToken: data.access_token };
}

async function fetchGithubUser(accessToken) {
  const uRes = await fetchWithTimeout("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${accessToken}`, "User-Agent": "Sleep-App" },
  }, 5000);
  const user = await uRes.json();

  const eRes = await fetchWithTimeout("https://api.github.com/user/emails", {
    headers: { Authorization: `Bearer ${accessToken}`, "User-Agent": "Sleep-App" },
  }, 5000);
  const emails = await eRes.json();
  const primary = Array.isArray(emails) ? emails.find((e) => e.primary && e.verified) : null;
  const normalizedEmail = primary ? primary.email.trim().toLowerCase() : null;

  return { id: String(user.id), login: user.login || `gh_${user.id}`, email: normalizedEmail };
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) return new Response("授权失败: 缺少参数", { status: 400 });

  const cookieHeader = request.headers.get("Cookie") || "";
  const nonceMatch = cookieHeader.match(/(?:^|;\s*)oauth_nonce=([^;]+)/);
  if (!nonceMatch) {
    return new Response("授权失败: 状态校验失败", { status: 403 });
  }

  const stateKey = `oauth_state:${state}`;
  const storedNonce = await env.SLEEP_KV.get(stateKey);
  if (!storedNonce || storedNonce !== nonceMatch[1]) {
    return new Response("授权失败: 状态校验失败或已过期", { status: 403 });
  }
  await env.SLEEP_KV.delete(stateKey);

  const redirectUri = env.GITHUB_REDIRECT_URI;
  if (!redirectUri) return new Response("服务未配置 GitHub OAuth", { status: 500 });

  const exchange = await exchangeCode(env, code, redirectUri);
  if (!exchange.ok) {
    return new Response(`GitHub 授权失败: ${exchange.error}`, { status: 400 });
  }

  const ghUser = await fetchGithubUser(exchange.accessToken);
  if (!ghUser.email) {
    return new Response("GitHub 账号没有已验证的主邮箱", { status: 400 });
  }

  // 1) 优先按 github_id 查找（已有绑定）
  let user = await env.DB
    .prepare("SELECT id FROM users WHERE github_id = ?")
    .bind(ghUser.id)
    .first();

  // 2) 未绑定但邮箱已存在 → 拒绝静默接管，提示手动绑定
  if (!user) {
    const byEmail = await env.DB
      .prepare("SELECT id FROM users WHERE email = ?")
      .bind(ghUser.email)
      .first();
    if (byEmail) {
      return new Response(
        "该邮箱已通过其他方式注册，请先用密码登录后在账号设置中绑定 GitHub",
        { status: 409 }
      );
    }

    // 3) 全新账号：生成 uid / 唯一 username / 随机密码
    let uid = null;
    for (let i = 0; i < 5; i += 1) {
      const cand = (crypto.getRandomValues(new Uint32Array(1))[0] % 90000000 + 10000000).toString();
      const dup = await env.DB.prepare("SELECT 1 FROM users WHERE uid = ?").bind(cand).first();
      if (!dup) { uid = cand; break; }
    }
    if (!uid) return new Response("系统繁忙，请稍后再试", { status: 503 });

    const passwordHash = await hashPassword(crypto.randomUUID(), env);

    let username = ghUser.login;
    let inserted = false;
    for (let attempt = 0; attempt < 5 && !inserted; attempt += 1) {
      try {
        await env.DB
          .prepare("INSERT INTO users (uid, username, email, password_hash, email_verified, github_id) VALUES (?, ?, ?, ?, 1, ?)")
          .bind(uid, username, ghUser.email, passwordHash, ghUser.id)
          .run();
        inserted = true;
      } catch (err) {
        if (String(err.message || "").includes("UNIQUE")) {
          username = `${ghUser.login}_gh${Math.floor(Math.random() * 10000)}`;
        } else {
          throw err;
        }
      }
    }
    if (!inserted) return new Response("创建账号失败，请稍后再试", { status: 500 });

    user = await env.DB.prepare("SELECT id FROM users WHERE github_id = ?").bind(ghUser.id).first();
  }

  // 4) 签发会话
  const sessionToken = generateToken();
  const tokenHash = await hashToken(sessionToken);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_REMEMBER_SEC * 1000).toISOString();
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const ua = request.headers.get("user-agent") || "unknown";

  await env.DB.batch([
    env.DB.prepare("INSERT INTO sessions (token_hash, user_id, expires_at, ip, user_agent) VALUES (?, ?, ?, ?, ?)")
      .bind(tokenHash, user.id, expiresAt, ip, ua),
    env.DB.prepare("INSERT INTO audit_logs (user_id, action, ip, country, user_agent) VALUES (?, 'oauth.login', ?, ?, ?)")
      .bind(user.id, ip, (request.cf && request.cf.country) || "Unknown", ua),
  ]);

  const headers = new Headers();
  headers.set("Location", "/");
  headers.append("Set-Cookie", `__Host-session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_MAX_AGE_REMEMBER_SEC}`);
  headers.append("Set-Cookie", "oauth_nonce=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0");

  return new Response(null, { status: 302, headers });
}
