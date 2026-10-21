import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { verifyRequest } from "../_csrf.js";
import { getSessionUser } from "../_session.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!verifyRequest(request)) return Response.json({ error: "非法请求" }, { status: 403 });

  const auth = await getSessionUser(request, env, context);
  if (!auth) return Response.json({ error: "未登录" }, { status: 401 });

  try {
    const { challengeId, credential } = await request.json();
    if (!challengeId || !credential) {
      return Response.json({ error: "参数缺失" }, { status: 400 });
    }

    const row = await env.DB
      .prepare("SELECT user_id, challenge FROM passkey_challenges WHERE id = ? AND expires_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now')")
      .bind(challengeId)
      .first();
    if (!row) return Response.json({ error: "验证已过期，请重试" }, { status: 400 });
    if (row.user_id !== auth.userId) {
      return Response.json({ error: "验证无效" }, { status: 403 });
    }

    const expectedOrigin = new URL(request.url).origin;
    const expectedRPID = env.WEBAUTHN_RP_ID || new URL(request.url).hostname;

    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: row.challenge,
      expectedOrigin,
      expectedRPID,
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return Response.json({ error: "验证失败" }, { status: 400 });
    }

    const { credential: info } = verification.registrationInfo;
    const publicKeyB64 = btoa(String.fromCharCode(...info.publicKey));

    // 凭据写入与挑战消费在同一事务内完成。凭据写入以 EXISTS 守卫，
    // 只有挑战仍有效时才插入；任一语句失败则整体回滚，挑战保持可用供重试。
    const alive = "expires_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";
    let results;
    try {
      results = await env.DB.batch([
        env.DB.prepare(`INSERT INTO passkeys (credential_id, user_id, public_key, counter, transports)
          SELECT ?1, ?2, ?3, ?4, ?5
          WHERE EXISTS (SELECT 1 FROM passkey_challenges WHERE id = ?6 AND ${alive})`)
          .bind(
            info.id,
            auth.userId,
            publicKeyB64,
            info.counter,
            JSON.stringify(credential.response?.transports || []),
            challengeId
          ),
        env.DB.prepare(`DELETE FROM passkey_challenges WHERE id = ? AND ${alive}`)
          .bind(challengeId),
      ]);
    } catch (err) {
      if (String(err.message || "").includes("UNIQUE")) {
        return Response.json({ error: "该设备已绑定过，请直接使用面容 / 指纹登录" }, { status: 409 });
      }
      throw err;
    }
    if (results[1].meta.changes !== 1) {
      return Response.json({ error: "验证已过期或已被使用" }, { status: 400 });
    }

    return Response.json({ success: true, message: "面容 / 指纹绑定成功" });
  } catch (err) {
    console.error("Passkey Register Verify Error:", err);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
