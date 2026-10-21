import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { verifyRequest } from "../_csrf.js";
import { SESSION_MAX_AGE_REMEMBER_SEC } from "../_constants.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!verifyRequest(request)) return Response.json({ error: "非法请求" }, { status: 403 });

  try {
    const { challengeId, credential } = await request.json();
    if (!challengeId || !credential) {
      return Response.json({ error: "参数缺失" }, { status: 400 });
    }

    const expectedOrigin = new URL(request.url).origin;
    const expectedRPID = env.WEBAUTHN_RP_ID || new URL(request.url).hostname;

    const challengeRow = await env.DB
      .prepare("SELECT challenge FROM passkey_challenges WHERE id = ? AND expires_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now')")
      .bind(challengeId)
      .first();
    if (!challengeRow) return Response.json({ error: "验证已过期" }, { status: 400 });

    const credentialId = credential.id;
    const passkey = await env.DB
      .prepare("SELECT user_id, public_key, counter FROM passkeys WHERE credential_id = ?")
      .bind(credentialId)
      .first();
    if (!passkey) return Response.json({ error: "未找到该设备的绑定记录" }, { status: 404 });

    const publicKey = Uint8Array.from(atob(passkey.public_key), (c) => c.charCodeAt(0));

    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: challengeRow.challenge,
      expectedOrigin,
      expectedRPID,
      credential: {
        id: credentialId,
        publicKey,
        counter: passkey.counter,
      },
    });

    if (!verification.verified) {
      return Response.json({ error: "验证失败" }, { status: 401 });
    }

    const newCounter = verification.authenticationInfo.newCounter;
    if (passkey.counter !== 0 && newCounter <= passkey.counter) {
      return Response.json({ error: "检测到凭据克隆风险" }, { status: 403 });
    }

    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => b.toString(16).padStart(2, "0")).join("");
    const tokenHash = await crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(token))
      .then((b) => Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, "0")).join(""));
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const ua = request.headers.get("user-agent") || "unknown";
    const secure = request.url.startsWith("https://") ? "; Secure" : "";

    // 挑战消费、计数器更新、会话签发在同一事务内完成。前两条以 EXISTS 守卫，
    // 只有挑战仍有效时才写入；并发双发时第二个请求前两条均影响 0 行，最终由 DELETE 的 changes 判定。
    const alive = "expires_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";
    const results = await env.DB.batch([
      env.DB.prepare(`INSERT INTO sessions (token_hash, user_id, expires_at, ip, user_agent)
        SELECT ?1, ?2, ?3, ?4, ?5
        WHERE EXISTS (SELECT 1 FROM passkey_challenges WHERE id = ?6 AND ${alive})`)
        .bind(tokenHash, passkey.user_id, expiresAt, ip, ua, challengeId),
      env.DB.prepare(`UPDATE passkeys SET counter = ?1
        WHERE credential_id = ?2
          AND EXISTS (SELECT 1 FROM passkey_challenges WHERE id = ?3 AND ${alive})`)
        .bind(newCounter, credentialId, challengeId),
      env.DB.prepare(`DELETE FROM passkey_challenges WHERE id = ? AND ${alive}`)
        .bind(challengeId),
    ]);
    if (results[2].meta.changes !== 1) {
      return Response.json({ error: "验证已过期或已被使用" }, { status: 400 });
    }

    context.waitUntil(
      env.DB.prepare("INSERT INTO audit_logs (user_id, action, ip, country, user_agent) VALUES (?, 'passkey.login', ?, ?, ?)")
        .bind(passkey.user_id, ip, (request.cf && request.cf.country) || "Unknown", ua)
        .run()
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `${secure ? "__Host-session" : "session"}=${token}; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=${SESSION_MAX_AGE_REMEMBER_SEC}`,
      },
    });
  } catch (err) {
    console.error("Passkey Login Error:", err);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
