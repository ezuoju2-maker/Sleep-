import { generateRegistrationOptions } from "@simplewebauthn/server";
import { verifyRequest } from "../_csrf.js";
import { getSessionUser } from "../_session.js";

const MAX_PASSKEYS_PER_USER = 10;

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!verifyRequest(request)) return Response.json({ error: "非法请求" }, { status: 403 });

  const auth = await getSessionUser(request, env, context);
  if (!auth) return Response.json({ error: "未登录" }, { status: 401 });

  const user = await env.DB.prepare("SELECT email FROM users WHERE id = ?").bind(auth.userId).first();
  if (!user) return Response.json({ error: "用户不存在" }, { status: 404 });

  const count = await env.DB.prepare("SELECT COUNT(*) AS n FROM passkeys WHERE user_id = ?").bind(auth.userId).first();
  if (count.n >= MAX_PASSKEYS_PER_USER) {
    return Response.json({ error: `Passkey 数量已达上限（${MAX_PASSKEYS_PER_USER}）` }, { status: 400 });
  }

  const rpID = env.WEBAUTHN_RP_ID || new URL(request.url).hostname;

  const options = await generateRegistrationOptions({
    rpName: "Sleep",
    rpID,
    userID: new TextEncoder().encode(auth.userId.toString()),
    userName: user.email,
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "required",
    },
  });

  const challengeId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  await env.DB.batch([
    env.DB.prepare("INSERT INTO passkey_challenges (id, user_id, challenge, expires_at) VALUES (?, ?, ?, ?)")
      .bind(challengeId, auth.userId, options.challenge, expiresAt),
  ]);

  return Response.json({ options, challengeId });
}
